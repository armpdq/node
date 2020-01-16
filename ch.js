const https = require('http');
const querystring = require('querystring');

let query = `CREATE TABLE tutorial.hits_v1
             (
               pid UInt32,
               source String,
               country String,
               req Uint64,
               resp Uint64,
               impr Uint64,
               clicks Uint64,
               free_clicks Uint64,
               amount Float32,
               feed_amount Float32,
               date Date
             )
  ENGINE = ReplicatedMergeTree()`;

const options = {
    'method': 'GET',
    'path': '/?' + querystring.stringify({
        'database': 'default',
        'query': query,
    }),
    'port': 8123,
    'hostname': '104.248.87.189',
    'headers': {
        'X-ClickHouse-User': 'default',
        'X-ClickHouse-Key': '9481fbgMwA2eBJN',
    },
};

const req = https.request(options, (res) => {
    console.log('statusCode:', res.statusCode);
    res.setEncoding('utf8');
    res.on('data', (chunk) => {
        console.log(chunk);
    });
});

req.end();
