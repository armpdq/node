const express = require('express');
const logger = require('morgan')('tiny');
const crypto = require('crypto');
const fs = require('fs');
const maxmind = require('maxmind');
let url = require('url');
let parser = require('ua-parser-js');

let first = true;

let redirectUrl = 'https://togorex.com/click.php?token=';
let impressionsUrl = 'https://imgmekus.com/?t=';

const AES_METHOD = 'aes-256-cbc';
const IV_LENGTH = 16;
const password = 'lbwyBzfgzUIvX3369785kaWvLJhIVq36';

const app = express();

let dir_path = __dirname + '/';

let s_port = process.argv[2] || 3000;


let requests = {};
let requestsAll = {};

let feeds = [];

let camps = [];

let requestsAllCount = 0;
let responseSuccess = 0;


function encrypt(text) {
    if (process.versions.openssl <= '1.0.1f') {
        throw new Error('OpenSSL Version too old, vulnerability to Heartbleed')
    }
    let iv = crypto.randomBytes(IV_LENGTH);
    let cipher = crypto.createCipheriv(AES_METHOD, new Buffer.from(password), iv);
    let encrypted = cipher.update(text);
    encrypted = Buffer.concat([encrypted, cipher.final()]);
    return iv.toString('hex') + ':' + encrypted.toString('hex');
}

function getLimit (query, pid) {
    let limit = query.limit ? query.limit : 3;

    if (pid !== '793199' && (limit > 5 || limit < 1)) {
        limit = 3;
    } else if (limit > 500 || limit < 1) {
        limit = 3;
    }

    return limit
}

function requestHandler (query, lookup) {
    let sendData = [];

    let pid = query.pid ? query.pid : '';
    let ip = query.ip ? query.ip : '';
    let ua = query.ua ? query.ua : '';
    let sourceid = query.sourceid ? query.sourceid : '';
    let lang = query.lang ? query.lang : '';
    let limit = getLimit(query, pid)

    let pidsource = pid + '-' + sourceid;
    if (!sourceid) pidsource = pid;

    let feed = getFeed(pid);

    let pidRate = getPidRate(pid);


    let geo = lookup.get(ip);

    let country = false;

    if (geo && geo.country && geo.country.iso_code) {
        country = geo.country.iso_code;
    }

    
    if (!country || !feed) return; 

    if (typeof requestsAll['_' + pid] === 'undefined') requestsAll['_' + pid] = {};
    if (typeof requestsAll['_' + pid]['_' + sourceid] === 'undefined') requestsAll['_' + pid]['_' + sourceid] = {};
    if (typeof requestsAll['_' + pid]['_' + sourceid][country] === 'undefined') requestsAll['_' + pid]['_' + sourceid][country] = 0;

    requestsAll['_' + pid]['_' + sourceid][country] = requestsAll['_' + pid]['_' + sourceid][country] + 1;

    let parsedUa = parser(ua);
    
    if (!parsedUa.os.name || !parsedUa.os.version) return;

    let realOs = parsedUa.os.name + parsedUa.os.version;

    realOs = realOs.split('.')[0];

    let key = country + '_' + feed + '_' + realOs;
    
    if (!camps[key]) return; 

    for (let camp of camps[key]) {

        let blist = camp['blocked_list'];
        let cpc = camp['cpc'];
        let camp_id = camp['camp_id'];
        let camp_source = camp['source'];

        let title = camp['title'];
        let description = camp['description'];
        let c_icon = camp['c_icon'];
        let image = camp['image'];

        let campIdWithSourceMP = camp_source + '_' + camp_id;

        if (blist.indexOf(pidsource) === -1) {

            let unixTimeNow = Math.floor(Date.now() / 1000);

            let url = redirectUrl + encodeURI(encrypt(campIdWithSourceMP + '~x~' + pid + '~x~' + sourceid + '~x~' + cpc + '~x~' + country + '~x~' + unixTimeNow));
            let imageRedirectUrl = impressionsUrl + encodeURI(encrypt(image + '~x~' + pid + '~x~' + sourceid + '~x~' + country));

            let feedCpc = parseFloat(cpc);

            pidRate = parseInt(pidRate);

            if (pidRate !== 0) {
                feedCpc = (pidRate / 100) * feedCpc;
            }

            feedCpc = feedCpc.toFixed(5);
            feedCpc = parseFloat(feedCpc);

            sendData.push({
                camp_id: camp_id,
                cpc: feedCpc,
                country: country,
                title: title,
                description: description,
                icon: c_icon,
                image: imageRedirectUrl,
                link: url
            });

            if (sendData.length >= limit) {
                break;
            }

        }
    }

    if (sendData.length) {
        if (typeof requests['_' + pid] === 'undefined') requests['_' + pid] = {};
        if (typeof requests['_' + pid]['_' + sourceid] === 'undefined') requests['_' + pid]['_' + sourceid] = {};
        if (typeof requests['_' + pid]['_' + sourceid][country] === 'undefined') requests['_' + pid]['_' + sourceid][country] = 0;

        requests['_' + pid]['_' + sourceid][country] = requests['_' + pid]['_' + sourceid][country] + 1;
    }

    return sendData;
}

function makeid(length) {
    var result = '';
    var characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    var charactersLength = characters.length;
    for (var i = 0; i < length; i++) {
        result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }
    return result;
}

function getCamps() {
    return new Promise((resolve, reject) => {    
        fs.readFile('camps.json', (err, rawData) => {
            if (err) return resolve();
            sortData(JSON.parse(rawData));
            resolve();
        });
    });
}

function getFeeds() {
    return new Promise((resolve, reject) => {
        fs.readFile('pids.json', (err, rawData) => {
            if (err) return resolve();
            feeds = JSON.parse(rawData);
            resolve();
        });
    });
}

function sortData(result) {
    first = false;

    if (!result.length) return; 
    
    let tmpCamps = [];

    for (let item of result) {
        let feeds = item['feedType'];
        let op_systems = item['op_system'];
        let country = item['country'];
        feeds = JSON.parse(feeds);
        op_systems = JSON.parse(op_systems);

        if (!feeds[0]) continue;

        for (let i = 0; i < feeds.length; i++) {
            let feed = feeds[i];
            for (let io = 0; io < op_systems.length; io++) {
                if (typeof op_systems[io] !== 'undefined') {
                    let op_system = op_systems[io];
                    let key = country + '_' + feed + '_' + op_system;
                    if (typeof tmpCamps[key] === 'undefined') tmpCamps[key] = [];
                    tmpCamps[key].push(item);
                } else {
                    console.log(op_systems);
                }

            }

        }
    }

    camps = tmpCamps;
    console.log('-----');
}

function getFeed(pid) {
    return typeof feeds[pid] != 'undefined' ? feeds[pid]['feed'] : false;
}

function getPidRate(pid) {
    return typeof feeds[pid] != 'undefined' ? feeds[pid]['rate'] : false;
}


async function runWorker () {
    await getCamps();
    await getFeeds();
    const lookup = await maxmind.open('./GeoIP2-Country.mmdb');

    app.use(logger);

    app.get('*', (req, res) => {
        const sendData = requestHandler(req.query, lookup)
        
        if (sendData && sendData.length) {
            // responseSuccess++;
            // if (responseSuccess % 1000 === 0) console.log('- ' + responseSuccess + ' - worker: ' + process.env.name);
            return res.json(sendData);
        } 

        res.status(204).end();
    });

    app.listen(s_port, (err) => err ? console.error(err) : console.log(`Server listening on ${s_port}`));

    setInterval(function () {
        if (Object.keys(requests).length) {
            let reqStr = JSON.stringify(requests);
            fs.writeFile(dir_path + "requestLog/log_" + makeid(10) + '.log', reqStr, function (err) {
                if (err) {
                    console.log(err);
                    return 'file write error';
                }
                requests = {};
            });
        }

        if (Object.keys(requestsAll).length) {
            let reqStr = JSON.stringify(requestsAll);
            fs.writeFile(dir_path + "requestLogAll/log_" + makeid(10) + '.log', reqStr, function (err) {
                if (err) {
                    console.log(err);
                    return 'file write error';
                }
                requestsAll = {};
            });
        }

    }, 20000);

    setInterval(async function () {
        try {
            await getCamps();
            await getFeeds();
        } catch (e) {
            console.error(e);
        }
    }, 60 * 1000 * 2);
}

runWorker();
