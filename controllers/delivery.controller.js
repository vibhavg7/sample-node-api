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

exports.fetchAllNewOrders = function(req,res) {
    pool.getConnection(function (err, dbConn) {
        dbConn.query("SELECT * FROM orders where delivery_person_id = 0 and order_deliveryperson_status = 1", function (err, orders) {
            if (err) {
                res.json({
                    status: 400,
                    "message": "orders Information not found",
                    "neworders": []
                });
            }
            else {
                res.json({
                    status: 200,
                    "message": "new orders Information",
                    "neworders": orders
                });
            }
            dbConn.release();
        });
    });
}

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

exports.registerDeliveryPerson = function (req, res) {
    let sql = `CALL REGISTER_DeliveryPerson(?,?,?)`;
    const otp_number = Math.floor(1000 + Math.random() * 9000);
    let msgid = '';
    // console.log(req.body);
    pool.getConnection(function (err, dbConn) {
        dbConn.query(sql, [req.body.phone, otp_number, req.body.token], function (err, deliveryPerson) {
            if (err) {
                res.json({
                    "status": 400,
                    "message": "Delivery Person not registred",
                    "phone": 0,
                    "delivery_person_id": 0
                });
            }
            else {
                if(deliveryPerson[0].length > 0) {
                    let msg = `Hello Delivery Person your generated otp is :${otp_number}`;
                     rp(`http://login.aquasms.com/sendSMS?username=vibhav&message=${msg}&sendername=GROSTP&smstype=TRANS&numbers=${req.body.phone}&apikey=2edaddf6-a3fa-40c5-a40d-3ce980b240fa`)
                    .then(function (res) {
                        // Process html...
                        // console.log(res);
                        msgid = res[0]['msgid'];
                    })
                    .catch(function (err) {
                        // Crawling failed...
                        console.log(err);
                    });
                    res.json({
                        "status": 200,
                        "message": "Delivery Person login successfully",
                        "phone": deliveryPerson[0][0].phone,
                        "delivery_person_id": deliveryPerson[0][0].delivery_person_id,
                        // "msg": msg
                    });
                } else {
                    res.json({
                        "status": 400,
                        "message": "Delivery Person not found",
                        "phone": 0,
                        "delivery_person_id": 0
                    });
                }
            }
            dbConn.release();
        });
    });
}

exports.validateDeliveryPerson = function (req, res) {
    let sql = `CALL validateDeliveryPerson(?,?)`;
    pool.getConnection(function (err, dbConn) {
        dbConn.query(sql, [req.body.phone_number, req.body.otp_number], function (err, deliveryPersonData) {
            // res.json(employeeData);
             console.log(err);
            if (err) {
                res.json({
                    "status": 401,
                    "message": "DeliveryPerson Details not found",
                    "deliveryPersonData": []
                });
            }
            else {
                if (deliveryPersonData[0][0].status == 1) {
                    sendToken(deliveryPersonData[0][0], res);
                } else {
                    res.json({
                        "status": 204,
                        "message": "OTP not valid",
                        "token": "",
                        "deliveryPersonData": []
                    });
                }
            }
            dbConn.release();
        });
    });

}

function sendToken(item, res) {
    var token = jwt.sign(item.delivery_person_id, "123");
    res.json({
        "status": 200,
        "message": "delivery person Details",
        "token": token,
        "deliveryPersonData": item
    });
}