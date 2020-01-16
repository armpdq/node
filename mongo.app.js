const crypto = require('crypto');
const AES_METHOD = 'aes-256-cbc';
const IV_LENGTH = 16;
const password = 'lbwyBzfgzUIvX3369785kaWvLJhIVq36';

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

console.log(encodeURI(encrypt('123')));








//
// var MongoClient = require('mongodb').MongoClient;
// var url = "remote:t2CEzuAYBnVc4xC@mongodb://165.22.205.17:27017/";
//
// MongoClient.connect(url, {useNewUrlParser: true, useUnifiedTopology: true}, function (err, db) {
//     if (!err) {
//         console.log("We are connected");
//     } else {
//         console.log(err);
//     }
//
//     let dbo = db.db("stat");
//     let objIns = [{
//         '2020-13-25': {
//             333333: {
//                 'AM': {
//                     '_102030': {
//                         'request': 141,
//                         'response': 140,
//                         'impression': 73,
//                     },
//                     '_102040': {
//                         'request': 150,
//                         'response': 148,
//                         'impression': 55,
//                     }
//                 },
//                 'RU': {
//                     '_102050': {
//                         'request': 150,
//                         'response': 140,
//                         'impression': 73,
//                     }
//                 }
//             }
//         }
//     },
//         {
//             '2020-13-25': {
//                 444444: {
//                     'AM': {
//                         '_102030': {
//                             'request': 141,
//                             'response': 140,
//                             'impression': 73,
//                         },
//                         '_102040': {
//                             'request': 150,
//                             'response': 148,
//                             'impression': 55,
//                         }
//                     },
//                     'RU': {
//                         '_102050': {
//                             'request': 150,
//                             'response': 140,
//                             'impression': 73,
//                         }
//                     }
//                 }
//             }
//         }
//     ];
//
// // dbo.createCollection("statistic", { autoIndexId: false }, function(err, res) {
// //     if (err) throw err;
// //     console.log("1 document inserted");
// //     db.close();
// // });
// //
//
//     let collection = dbo.collection("statistic");
//
//     for(let i = 0; i < 1; i++){
//         collection.insertMany(objIns, function (err, res) {
//             if (err) throw err;
//             console.log("1 document inserted");
//             db.close();
//         });
//     }
//
//
//
// // dbo.collection("statistic").find({}).toArray( function(err, result) {
// //     if (err) throw err;
// //     console.log(result);
// //     db.close();
// // });
// })
// ;
