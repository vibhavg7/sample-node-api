var mysql = require('mysql');
var jwt = require('jsonwebtoken');
var rp = require('request-promise');
var async = require("async");
var pool = mysql.createPool({
    connectionLimit: 10,
    host: 'grostep-database.c8zeozlsfjcx.ap-south-1.rds.amazonaws.com',
    user: 'root',
    password: process.env.dbpassword,
    database: 'grostep'
});

exports.validateCartItems = function (req, res) {
    let data = req.body;
    let updatedArray = [];
    var Select = 'SELECT store_product_mapping_id,stock ';
    var From = 'From `stores_products_mapping` ';
    var Where = 'WHERE store_product_mapping_id = ?';
    var sql = Select + From + Where;
    async.forEachOf(data, function (dataElement, i, inner_callback) {
        dataElement['available'] = 0;
        var inserts = [dataElement['store_product_id']];
        var ssql = mysql.format(sql, inserts);
        pool.getConnection(function (err, dbConn) {
            dbConn.query(ssql, function (err, rows, fields) {
                if (!err) {
                    dataElement['available'] = rows[0].stock;
                    updatedArray.push(dataElement);
                    inner_callback(null);
                } else {
                    console.log("Error while performing Query");
                    inner_callback(err);
                };
            });
        });

    }, function (err) {
        if (err) {
            //handle the error if the query throws an error
            res.json({
                "status": 400,
                "message": "no cart information",
                "cartInfo": []
            });
        } else {
            //whatever you wanna do after all the iterations are done
            res.json({
                "status": 200,
                "message": "cart information",
                "cartInfo": updatedArray
            });
            console.log(updatedArray);
        }
    });
}