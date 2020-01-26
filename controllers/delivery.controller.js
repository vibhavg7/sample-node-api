var mysql = require('mysql');
var jwt = require('jsonwebtoken');
var rp = require('request-promise');

var pool = mysql.createPool({
    connectionLimit: 10,
    host: 'grostep-database.c8zeozlsfjcx.ap-south-1.rds.amazonaws.com',
    user: 'root',
    password: process.env.dbpassword,
    database: 'grostep'
});

exports.fetchAllDeliveryPersons = function (req, res) {

    let sql = `CALL GET_ALL_DELIVERYPERSONS(?,?,?)`;
    pool.getConnection(function (err, dbConn) {
        dbConn.query(sql, [+req.body.page_number, +req.body.page_size, req.body.filterBy],
            function (err, delivery) {
                if (err) {
                    console.log("error: ", err);
                }
                else {
                    res.json({
                        "message": "delivery information",
                        "delivery": delivery[0],
                        "delivery_total_count": delivery[1][0]
                    });
                }
                dbConn.release();
            });
    });
}

exports.addNewDeliveryPerson = function (req, res) {
    let sql = `CALL ADD_NEW_DeliveryPerson(?,?,?,?,?,?)`;

    let deliveryPersonName = req.body.deliveryPersonName;
    let aadharNumber = req.body.aadharNumber;
    let status = +req.body.status;
    let panNumber = req.body.panNumber;
    let phone = +req.body.phone;
    let email = req.body.email;

    pool.getConnection(function (err, dbConn) {
        dbConn.query(sql, [deliveryPersonName, aadharNumber, status, 
                            panNumber, phone, email],
            function (err, delivery) {
                if (err) {
                    console.log("error: ", err);
                    res.json({
                        "message": "delivery not added",
                        "status": 400,
                        "delivery_person_id": 0
                    });
                }
                else {
                    console.log(JSON.stringify(delivery));
                    res.json({
                        "status": 200,
                        "message": "delivery added",
                        "delivery_id": delivery[0][0]['delivery_id']
                    });
                }
                dbConn.release();
            });
    });
}

exports.updateDeliveryPerson = function (req, res) {
    const updateDeliveryPerson = req.body;
    pool.getConnection(function (err, dbConn) {
        dbConn.query("UPDATE grostep.deliveryperson SET ? WHERE delivery_person_id = ?", [updateDeliveryPerson, +req.params.deliveryPersonId], function (err, delivery) {
            if (err) {
                console.log("error: ", err);
                res.json({
                    status: 400,
                    "message": "delivery Information not updated",
                    "delivery": ''
                });

            }
            else {
                console.log(JSON.stringify(delivery));
                res.json({
                    status: 200,
                    "message": "delivery Information updated",
                    "delivery": delivery
                });
            }
            dbConn.release();
        });
    });
}

exports.fetchDeliveryPersonInfoById = function (req, res) {
    pool.getConnection(function (err, dbConn) {
        dbConn.query("SELECT * FROM deliveryperson WHERE delivery_person_id = ? ", req.params.deliveryPersonId, function (err, deliveryPersonData) {
            if (err) {
                res.json({
                    status: 400,
                    "message": "Delivery Person Information not found",
                    "deliveryPersonData": deliveryPersonData[0]
                });
            }
            else {
                res.json({
                    status: 200,
                    "message": "Delivery Person Information",
                    "deliveryPersonData": deliveryPersonData[0]
                });
            }
            dbConn.release();
        });
    });
}