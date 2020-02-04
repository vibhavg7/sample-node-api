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

exports.fetchAllCustomers = function (req, res) {

    let sql = `CALL GET_ALL_CUSTOMERS(?,?,?)`;
    pool.getConnection(function (err, dbConn) {
        dbConn.query(sql, [+req.body.page_number, +req.body.page_size, req.body.filterBy],
            function (err, customers) {
                if (err) {
                    console.log("error: ", err);
                }
                else {
                    res.json({
                        "message": "customers information",
                        "customers": customers[0],
                        "customer_total_count": customers[1][0]
                    });
                }
                dbConn.release();
            });
    });
}

exports.adduserinfo = function (req, res) {

}

exports.registerCustomer = function (req, res) {    
    let sql = `CALL REGISTER_CUSTOMER(?,?,?)`;
    const otp_number = Math.floor(1000 + Math.random() * 9000);
    let msgid = '';
    console.log(req.body);
    console.log(otp_number);
    pool.getConnection(function (err, dbConn) {
        dbConn.query(sql, [req.body.phone, otp_number, req.body.token], function (err, customer) {
            if (err) {
                res.json({
                    "status": 400,
                    "message": "Customer not created",
                    "phone": 0,
                    "customer_id": 0
                });
            }
            else {
                let msg = `Hello your generated otp is :${otp_number}`;
                rp(`http://login.aquasms.com/sendSMS?username=vibhav&message=${msg}&sendername=GROSTP&smstype=TRANS&numbers=${req.body.phone}&apikey=2edaddf6-a3fa-40c5-a40d-3ce980b240fa`)
                    .then(function (res) {
                        // Process html...
                        console.log(res);
                        msgid = res[0]['msgid'];
                    })
                    .catch(function (err) {
                        // Crawling failed...
                        console.log(err);
                    });
                res.json({
                    "status": 200,
                    "message": "Customer created",
                    "phone": customer[0][0].phone,
                    "msgid": msgid,
                    "customer_id": customer[0][0].customer_id
                });
            }
            dbConn.release();
        });
    });
}

exports.updateSelectedAddress = function (req, res) {
    let sql = `CALL UPDATE_DELIVERY_ADDRESS(?,?)`;
    pool.getConnection(function (err, dbConn) {
        dbConn.query(sql, [+req.params.addressId, +req.body.customerId],
            function (err, address) {
                if (err) {
                    console.log("error: ", err);
                    res.json({
                        status: 400,
                        "message": "address not updated",
                        "address": ''
                    });
                }
                else {
                    console.log(JSON.stringify(address));
                    res.json({
                        status: 200,
                        "message": "address updated",
                        "address": address
                    });
                }
                dbConn.release();
            });
    });
}


exports.updateAddress = function (req, res) {
    const updateAddress = req.body;
    pool.getConnection(function (err, dbConn) {
        dbConn.query("UPDATE customer_delivery_address SET ? WHERE delivery_address_id = ?",
            [updateAddress, +req.params.addressId], function (err, address) {
                console.log(err);
                if (err) {
                    res.json({
                        status: 400,
                        "message": "address not updated",
                        "address": ''
                    });

                }
                else {
                    res.json({
                        status: 200,
                        "message": "address updated",
                        "address": address
                    });
                }
                dbConn.release();
            });
    });
}

exports.getAddressInfo = function (req, res) {
    pool.getConnection(function (err, dbConn) {
        dbConn.query("select * from customer_delivery_address cda INNER JOIN grostep.customer_address_type cdt on cda.address_type = cdt.address_type_id where cda.delivery_address_id = ?;",
            [req.params.addressId], function (err, addressInfo) {
                if (err) {
                    console.log("error: ", err);
                }
                else {
                    res.json({
                        status: 200,
                        "message": "customer address Information",
                        "addressInfo": addressInfo,
                    });
                }
                dbConn.release();
            });
    });
}

exports.addDelievryAddress = function (req, res) {

    let sql = `CALL ADD_NEW_DELIVERY_ADDRESS(?,?,?,?,?,?,?,?,?,?,?,?,?,?)`;
    pool.getConnection(function (err, dbConn) {
        dbConn.query(sql, [req.body.address, req.body.address2, req.body.city,
        req.body.state, req.body.country, +req.body.pincode,
        req.body.latitude, req.body.longitude, +req.body.address_type,
        req.body.landmark, req.body.phone, +req.body.customer_id,
        req.body.customer_name, req.body.flatNumber],
            function (err, address) {
                if (err) {
                    console.log("error: ", err);
                    res.json({
                        "message": "address not added",
                        "status": 400,
                        "banner_id": 0
                    });
                }
                else {
                    console.log(JSON.stringify(address));
                    res.json({
                        "status": 200,
                        "message": "address added",
                        "address_id": address[0][0]['address_id']
                    });
                }
                dbConn.release();
            });
    });
}

exports.deleteAddress = function (req, res) {
    pool.getConnection(function (err, dbConn) {
        dbConn.query("DELETE FROM customer_delivery_address WHERE delivery_address_id = ? ", req.params.addressId,
            function (err, addressData) {
                if (err) {
                    console.log("error: ", err);
                }
                else {
                    let deleted = false;
                    if (addressData.affectedRows == 1) {
                        deleted = true;
                    }
                    res.json({
                        "message": (deleted) ? "address deleted successfully" : "invalid address id",
                        "status": (deleted) ? 200 : 400,
                        "address_id": req.params.addressId
                    });
                }
                dbConn.release();
            });
    });
}

exports.validateCustomer = function (req, res) {
    let sql = `CALL validateCustomer(?,?)`;
    pool.getConnection(function (err, dbConn) {
        dbConn.query(sql, [req.body.phone_number, req.body.otp_number], function (err, customerData) {
            console.log(customerData);
            if (err) {
                res.json({
                    "status": 401,
                    "message": "customer Details not found",
                    "token": "",
                    "customerData": []
                });
            }
            else {
                if (customerData[0][0].status == 1) {
                    sendToken(customerData[0][0], res);
                } else {
                    res.json({
                        "status": 204,
                        "message": "OTP not valid",
                        "token": "",
                        "customerData": []
                    });
                }
            }
            dbConn.release();
        });
    });
}

function sendToken(item, res) {
    var token = jwt.sign(item.customer_id, "123");
    res.json({
        "status": 200,
        "message": "customer Details",
        "token": token,
        "customerData": item
    });
}



exports.fetchCustomerOrdersById = function (req, res) {
    let sql = `CALL GET_CUSTOMER_ORDERS(?,?,?,?)`;
    pool.getConnection(function (err, dbConn) {
        dbConn.query(sql, [+req.body.customerId, +req.body.page_number, +req.body.page_size, req.body.filterBy],
            function (err, customerOrders) {
                if (err) {
                    console.log("error: ", err);
                    res.json({
                        status: 400,
                        "message": "Customer orders Information not found",
                        "customer_orders_info": customerOrders[0],
                        "customer_order_count": customerOrders[1]
                    });
                }
                else {
                    res.json({
                        status: 200,
                        "message": "Customer orders Information",
                        "customer_orders_info": customerOrders[0],
                        "customer_order_count": customerOrders[1]
                    });
                }
                dbConn.release();
            });
    });
}

exports.getCustomer = function (req, res) {
    let sql = `CALL GET_CUSTOMER_DETAIL(?)`;
    pool.getConnection(function (err, dbConn) {
        dbConn.query(sql, req.params.customerId, function (err, customer) {
            if (err) {
                console.log("error: ", err);
            }
            else {
                res.json({
                    "message": "Customer Information",
                    "status": 200,
                    "customer_info": customer[0],
                    "customer_delivery_addresses": customer[1]
                });
                // res.json(customer);
            }
            dbConn.release();
        });
    });
}

exports.getCustomerAddresses = function (req, res) {
    pool.getConnection(function (err, dbConn) {
        dbConn.query("select cda.customer_name,cda.delivery_address_id,cda.address,cda.address2,cda.pincode,cda.landmark,cda.phone,cdt.type,cda.flatNumber,cda.status from customer_delivery_address cda INNER JOIN grostep.customer_address_type cdt on cda.address_type = cdt.address_type_id where cda.customer_id = ?",
            [req.params.customerId], function (err, addressInfo) {
                if (err) {
                    console.log("error: ", err);
                }
                else {
                    res.json({
                        status: 200,
                        "message": "customer address Information",
                        "addressInfo": addressInfo,
                    });
                }
                dbConn.release();
            });
    });
}


exports.deleteCustomer = function (req, res) {
    pool.getConnection(function (err, dbConn) {
        dbConn.query("DELETE FROM customer WHERE customer_id = ? ", req.params.customerId, function (err, customer) {
            if (err) {
                console.log("error: ", err);
            }
            else {
                console.log(JSON.stringify(customer));
                res.json(customer);
            }
            dbConn.release();
        });
    });
}

exports.updateCustomer = function (req, res) {
    const updateCustomer = req.body;
    console.log(updateCustomer);
    pool.getConnection(function (err, dbConn) {
        dbConn.query("UPDATE customer SET ? WHERE customer_id = ?", [updateCustomer, req.params.customerId], function (err, customer) {
            if (err) {
                console.log("error: ", err);
                res.json({
                    status: 400,
                    "message": "customer Information not updated",
                    "customer": customer
                });
            }
            else {
                let updated = false;
                if (customer.affectedRows == 1) {
                    updated = true;
                }
                res.json({
                    "message": (updated) ? "customer Information updated successfully" : "customer Information not updated",
                    "status": (updated) ? 200 : 400,
                    "customer": customer,
                    "customer_id": req.params.customerId
                });
            }
            dbConn.release();
        });
    });
}


exports.updateOrderStatusByCustomer = function (req, res) {

    let sql = `CALL UPDATE_ORDERSTATUS_BY_CUSTOMER(?,?)`;

    pool.getConnection(function (err, dbConn) {
        dbConn.query(sql, [+req.params.orderId, req.body.status],
            function (err, orderData) {
                if (err) {
                    console.log("error: ", err);
                    res.json({
                        status: 400,
                        "message": "order information not found",
                    });
                }
                else {
                    let store_token = orderData[0][0]['store_token'];
                    let delivery_person_token = orderData[0][0]['delivery_person_token'];
                    let registrationTokens = [];
                    let messageTitle = '';
                    let messageBody = '';

                    registrationTokens.push(store_token);
                    registrationTokens.push(delivery_person_token);
                    messageTitle = 'Bill accepted by customer';
                    messageBody = `Hello ,Bill has been accepted for the order # ${orderData[0][0]['order_id']}.Please proceed furthur`;

                    var payload = {
                        notification: {
                            title: messageTitle,
                            body: messageBody
                            // "This is the body of the notification message."
                        }
                    };

                    var options = {
                        priority: "high",
                        timeToLive: 60 * 60 * 24
                    };
                    admin.messaging().sendToDevice(registrationTokens, payload, options)
                        .then(function (response) {
                            // console.log("Successfully sent message:", response);
                        })
                        .catch(function (error) {
                            // console.log("Error sending message:", error);
                    });
                    res.json({
                        status: 200,
                        "message": "order Information updated",
                        "order": orderData[0][0]['order_id']
                    });
                }
                dbConn.release();
            });
    });


}