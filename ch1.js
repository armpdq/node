const { ClickHouse } = require('clickhouse');

const clickhouse = new ClickHouse({
    url: '104.248.87.189',
    port: 8123,
    debug: false,
    basicAuth: {
        username: 'default',
        password: '9481fbgMwA2eBJN',
    },
    isUseGzip: false,
    config: {
        session_timeout                         : 60,
        output_format_json_quote_64bit_integers : 0,
        enable_http_compression                 : 0
    },
    reqParams: {

    }
});
//
// let query = `CREATE TABLE default.clicks2
//              (
//                pid UInt32,
//                source String,
//                country String,
//                req UInt64,
//                resp UInt64,
//                impr UInt64,
//                clicks UInt64,
//                free_clicks UInt64,
//                amount Float32,
//                feed_amount Float32,
//                c_date Date
//              ) ENGINE = MergeTree(c_date, (c_date, pid, source, country), 8192)`;
//

// let query = `CREATE TABLE default.clicks
//              (
//                pid UInt32,
//                source String,
//                country String,
//                req UInt64,
//                resp UInt64,
//                impr UInt64,
//                clicks UInt64,
//                free_clicks UInt64,
//                amount Float32,
//                feed_amount Float32,
//                c_date Date
//              )
//               ENGINE = MergeTree
//               ORDER BY(pid, source, c_date, country);`;




// let query = `# select * from default.clicks2;`;
// let query = `# INSERT INTO default.clicks (pid, source, country, req, resp, impr, clicks, free_clicks, amount, feed_amount, c_date) VALUES (10, '102030--102030--WW', 'AM', 50000, 150000, 11, 11, 1, 0.0025, 0.000015, '2019-01-12');`;


// const ws = clickhouse.query(query).stream();

// ws.exec();
//
// clickhouse.query(query).stream()
//     .on('data', function() {
//         const stream = this;
//
//         stream.pause();
//
//         setTimeout(() => {
//             stream.resume();
//         }, 1000);
//     })
//     .on('error', err => {
//         console.log(err);
//     })
//     .on('end', () => {
//         console.log('END');
//     });
//
