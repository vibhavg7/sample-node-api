var jwt = require('jsonwebtoken');
var rp = require('request-promise');
var admin = require("firebase-admin");
var http = require('http');
var pool = require('../../utils/manageDB');
var createError = require('http-errors');

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

exports.resendOTP = function (req, res) {
    let sql = `CALL RESEND_OTP(?,?)`;
    const otp_number = Math.floor(1000 + Math.random() * 9000);
    let msgid = '';
    pool.getConnection(function (err, dbConn) {
        dbConn.query(sql, [+req.params.customerId, otp_number],
            function (err, customer) {
                if (err) {
                    console.log("error: ", err);
                    res.json({
                        "status": 400,
                        "message": "Customer not created",
                        "phone": 0,
                        "customer_id": 0,
                        "msgid": ''
                    });
                }
                else {
                    // Dear Customer, use OTP code ${otp_number} to verify your account. Grostep, We Shop For You 
                    let msg = `Dear Customer, use OTP code ${otp_number} to verify your account. Grostep, We Shop For You`;
                    var str = '';
                    let phone = customer[0][0].phone;
                    var options = {
                        host: 'login.aquasms.com',
                        port: 80,
                        path: encodeURI('/sendSMS?username=vibhav&message=' + msg + '&sendername=GROSTP&smstype=TRANS&numbers=' + phone + '&apikey=2edaddf6-a3fa-40c5-a40d-3ce980b240fa'),
                        method: 'GET'
                    };
                    var reqGet = http.request(options, function (res1) {
                        res1.on('data', function (chunk) {
                            str += chunk;
                        });
                        res1.on('end', function () {
                            console.log(JSON.parse(str)[1]['msgid']);
                            // return str;
                            return res.json({
                                "status": 200,
                                "message": "Customer created",
                                "phone": customer[0][0].phone,
                                "msgid": JSON.parse(str)[1]['msgid'],
                                "customer_id": customer[0][0].customer_id
                            });
                        });
                    }).end();
                    reqGet.on('error', function (e) {
                        console.error(e);
                    });
                }
                dbConn.release();
            });
    });
}

exports.updateCustomerFromAdminPanel = function (req, res) {
    const updateCustomer = req.body;
    pool.getConnection(function (err, dbConn) {
        dbConn.query("UPDATE grostep.customer SET ? WHERE customer_id = ?", [updateCustomer, +req.params.customerId], function (err, customer) {
            if (err) {
                console.log("error: ", err);
                res.json({
                    status: 400,
                    "message": "customer Information not updated",
                    "customer": customer
                });

            }
            else {
                console.log(JSON.stringify(customer));
                res.json({
                    status: 200,
                    "message": "customer Information updated",
                    "customer": customer
                });
            }
            dbConn.release();
        });
    });
}

exports.registerCustomerFromAdminPanel = function (req, res) {
    var sql = `INSERT INTO customer 
            (
                customer_name, customer_dob, phone, status,personal_info_added
            )
            VALUES
            (
                ?, ?, ?, ?, ?
            )`;
    pool.getConnection(function (err, dbConn) {
        dbConn.query(sql, [req.body.customerName, req.body.customerDOB, req.body.customerPhone,
        +req.body.status, 1],
            function (err, customerData) {
                if (err) {
                    console.log("error: ", err);
                    res.json({
                        status: 400,
                        "message": "customer not added",
                        "customer_id": 0
                    });
                }
                else {
                    res.json({
                        "status": 200,
                        "message": "Customer registered",
                        "product": customerData[0]
                    });
                }
                dbConn.release();
            })
    });
}

exports.registerCustomer = function (req, res) {
    let sql = `CALL REGISTER_CUSTOMER(?,?,?)`;
    const otp_number = Math.floor(1000 + Math.random() * 9000);
    let msgid = '';
    if (isNumeric(req.body.phone) && (req.body.phone).length === 10) {
        pool.getConnection(function (err, dbConn) {
            dbConn.query(sql, [req.body.phone, otp_number, req.body.token], function (err, customer) {
                if (err) {
                    res.json({
                        "status": 400,
                        "message": "Customer not created",
                        "phone": 0,
                        "customer_id": 0,
                        "msgid": ''
                    });
                }
                else {
                    // Dear Customer, use OTP code ${otp_number} to verify your account. Grostep, We Shop For You
                    let msg = `Dear Customer, use OTP code ${otp_number} to verify your account. Grostep, We Shop For You`;
                    var str = '';
                    let phone = +req.body.phone;
                    var options = {
                        host: 'login.aquasms.com',
                        port: 80,
                        path: encodeURI('/sendSMS?username=vibhav&message=' + msg + '&sendername=GROSTP&smstype=TRANS&numbers=' + phone + '&apikey=2edaddf6-a3fa-40c5-a40d-3ce980b240fa'),
                        method: 'GET'
                    };
                    var reqGet = http.request(options, function (res1) {
                        res1.on('data', function (chunk) {
                            str += chunk;
                        });
                        res1.on('end', function () {
                            console.log(JSON.parse(str)[1]['msgid']);
                            // return str;
                            return res.json({
                                "status": 200,
                                "message": "Customer created",
                                "phone": customer[0][0].phone,
                                "msgid": JSON.parse(str)[1]['msgid'],
                                "customer_id": customer[0][0].customer_id
                            });
                        });
                    }).end();
                    reqGet.on('error', function (e) {
                        console.error(e);
                    });
                }
                dbConn.release();
            });
        });
    } else {
        console.log('Bye');
        return res.json({
            "status": 400,
            "message": "Phone number is incorrect",
            "phone": req.body.phone,
            "customer_id": 0,
            "msgid": ''
        });
    }
}

function isNumeric(num) {
    return !isNaN(num)
}

exports.updateSelectedAddress = function (req, res) {
    let sql = `CALL UPDATE_DELIVERY_ADDRESS(?,?,?)`;
    pool.getConnection(function (err, dbConn) {
        dbConn.query(sql, [+req.params.addressId, +req.body.customerId, req.body.city],
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

exports.authenticateservicelocation = function (req, res) {
    let sql = `CALL CHECK_SERVICE_LOCATION(?,?,?,?)`;
    pool.getConnection(function (err, dbConn) {
        dbConn.query(sql, [req.body.zipcode, req.body.city, req.body.state, req.body.country],
            function (err, servicableareainfo) {
                if (err) {
                    console.log("error: ", err);
                    res.json({
                        "message": "area not servicable",
                        "status": 400,
                        "locationresponse": 0
                    });
                }
                else {
                    if (servicableareainfo[0][0]['servicable_area_check'] == 0) {
                        res.json({
                            "status": 200,
                            "message": "area not servicable",
                            "locationresponse": servicableareainfo[0][0]
                        });
                    } else {
                        res.json({
                            "status": 200,
                            "message": "area servicable",
                            "locationresponse": servicableareainfo[0][0]
                        });
                    }

                }
                dbConn.release();
            });
    });
}

exports.addCustomerFeedback = function (req, res) {
    let sql = `CALL ADD_CUSTOMER_FEEDBACK(?,?,?,?,?,?,?,?,?,?)`;
    pool.getConnection(function (err, dbConn) {
        dbConn.query(sql, [+req.body.customer_id, req.body.name, req.body.email,
        +req.body.phone, req.body.message,
        +req.body.actionBy, req.body.customerCity,
        +req.body.ticketMode, +req.body.status, +req.body.feedbackId],
            function (err, feedback) {
                if (err) {
                    console.log("error: ", err);
                    res.json({
                        "message": "feedback not added",
                        "status": 400,
                        "feedback_id": 0
                    });
                }
                else {
                    res.json({
                        "status": 200,
                        "message": "feedback added",
                        "feedback_id": feedback[0][0]['feedback_message_id']
                    });
                }
                dbConn.release();
            });
    });
}

exports.getCustomerFeedbacks = function (req, res) {
    let sql = `CALL GET_ALL_CUSTOMER_FEEDBACKS(?,?,?,?)`;
    pool.getConnection(function (err, dbConn) {
        dbConn.query(sql, [+req.body.page_number, +req.body.page_size, req.body.filterBy, +req.body.customerId],
            function (err, customerFeedbacks) {
                if (err) {
                    console.log("error: ", err);
                    res.json({
                        status: 400,
                        "message": "Feedbacks Information not found",
                        "customer_feedback_info": [],
                        "customer_feedback_count": []
                    });
                }
                else {
                    res.json({
                        status: 200,
                        "message": "Feedbacks Information",
                        "customer_feedback_info": customerFeedbacks[0],
                        "customer_feedback_count": customerFeedbacks[1]
                    });
                }
                dbConn.release();
            });
    });
}

exports.getFeedbackDetailById = function (req, res) {
    let sql = `CALL GET_FEEDBACK_DETAIL(?)`;
    pool.getConnection(function (err, dbConn) {
        dbConn.query(sql, [+req.params.feedBackId],
            function (err, customerFeedback) {
                if (err) {
                    console.log("error: ", err);
                    res.json({
                        status: 400,
                        "message": "feedbacks Information not found",
                        "customer_feedback_info": []
                    });
                }
                else {
                    res.json({
                        status: 200,
                        "message": "feedbacks Information",
                        "customer_feedback_info": customerFeedback[0]
                    });
                }
                dbConn.release();
            });
    });
}

exports.addDelievryAddress = function (req, res) {

    let sql = `CALL ADD_NEW_DELIVERY_ADDRESS(?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`;
    pool.getConnection(function (err, dbConn) {
        dbConn.query(sql, [req.body.address, req.body.address2, req.body.city, req.body.state,
        req.body.country, +req.body.pincode, req.body.latitude, req.body.longitude,
        +req.body.address_type, req.body.landmark, req.body.phone, +req.body.customer_id,
        req.body.customer_name, req.body.flatNumber, req.body.locality, req.body.stateShortName,
        req.body.countryShortName],
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

exports.validateCustomer = async function (req, res, next) {

    const newStoreCategory = req.body;
    let sql = `CALL validateCustomer(?,?)`;

    try {
        const customerData = await pool.query(sql, [req.body.phone_number, req.body.otp_number]);
        if (customerData[0][0].status == 1) {
            sendToken(customerData[0][0], res);
        } else {
            res.json({
                "status": 400,
                "message": "OTP not valid",
                "token": "",
                "customerData": []
            });
        }
    }
    catch (err) {
        next(createError(401, err));
    } finally {
        // pool.end();
    }
}

function sendToken(item, res) {
    const user = {name: item.customer_id};
    var acesssToken = jwt.sign(user, process.env.ACCESS_TOKEN_SECRET);
    // var token = jwt.sign(item.customer_id, "123");
    res.json({
        "status": 200,
        "message": "customer Details",
        "token": acesssToken,
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

exports.getCustomerSelectedAddressCityWise = function (req, res) {
    let sql = `CALL GET_CUSTOMER_SELECTEDADDRESSESCITYWISE(?,?)`;
    pool.getConnection(function (err, dbConn) {
        dbConn.query(sql,
            [req.params.customerId, req.body.city], function (err, addressInfo) {
                if (err) {
                    console.log("error: ", err);
                }
                else {
                    res.json({
                        status: 200,
                        "message": "customer address Information",
                        "addressInfo": addressInfo[0],
                        "customer_address_count": addressInfo[1],
                    });
                }
                dbConn.release();
            });
    });
}

exports.getCustomerAddresses = function (req, res) {
    let sql = `CALL GET_CUSTOMER_ADDRESSESBYID(?,?,?,?)`;
    pool.getConnection(function (err, dbConn) {
        dbConn.query(sql,
            [req.params.customerId, req.body.city.toLowerCase(), +req.body.page_number, +req.body.page_size], function (err, addressInfo) {
                if (err) {
                    console.log("error: ", err);
                }
                else {
                    res.json({
                        status: 200,
                        "message": "customer address Information",
                        "addressInfo": addressInfo[0],
                        "customer_address_count": addressInfo[1],
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


exports.getSubcriptions = async function (req, res, next) {
    let sql = `CALL GET_ALL_SUBSCRIPTION(?,?,?)`;

    try {
        const subscriptionsInfo = await pool.query(sql, [+req.body.pageNumber, +req.body.pageSize, req.body.filterBy]);
        res.json({
            status: 200,
            "message": "Subscription Information",
            "subscriptions_info": subscriptionsInfo[0],
            "subscriptions_count": subscriptionsInfo[1]
        });
    }
    catch (err) {
        next(createError(401, err));
    } finally {
        // pool.end();
    }
}

exports.getSubscriptionDetailById = function (req, res) {

}


exports.sendUserNotificationFromAdminPanel = function (req, res) {
    let notificationType = +req.body.notificationType; // 1-> push notification 2 -> SMS
    let customerIds = filter_token_array(req.body.customerIds);
    let messageTitle = req.body.messageTitle;
    let messageBody = req.body.messageBody;
    var queryData = [customerIds];
    pool.getConnection(function (err, dbConn) {
        dbConn.query("select customer_id,customer_name,phone,token from customer where customer_id in  (?);",
            queryData, function (err, customerInfo) {
                if (err) {
                    console.log("error: ", err);
                }
                else {
                    if (notificationType === 1) {
                        const registrationTokens = [];
                        customerInfo.forEach(customer => {
                            registrationTokens.push(customer.token);
                        });
                        sendMulticastToken(filter_token_array(registrationTokens), messageTitle, messageBody, res);
                    } else if (notificationType === 2) {
                        const registeredPhones = [];
                        customerInfo.forEach(customer => {
                            registeredPhones.push(customer.phone);
                        });
                        let phone = filter_token_array(registeredPhones).toString();
                        let msg = messageBody;
                        console.log(msg);
                        var str = '';
                        var options = {
                            host: 'login.aquasms.com',
                            port: 80,
                            path: encodeURI('/sendSMS?username=vibhav&message=' + msg + '&sendername=GROSTP&smstype=TRANS&numbers=' + phone + '&apikey=2edaddf6-a3fa-40c5-a40d-3ce980b240fa'),
                            method: 'GET'
                        };
                        var reqGet = http.request(options, function (res1) {
                            res1.on('data', function (chunk) {
                                str += chunk;
                            });
                            res1.on('end', function () {
                                console.log(JSON.parse(str)[1]['msgid']);
                                res.json({
                                    "status": 200,
                                    "message": "message sent"
                                    // "msgid": JSON.parse(str)[1]['msgid']
                                });
                            });
                        }).end();
                        reqGet.on('error', function (e) {
                            console.error(e);
                        });
                    }
                    // res.json({
                    //     status: 200,
                    //     "message": "customer Information",
                    //     "customerInfo": customerInfo,
                    // });
                }
                dbConn.release();
            });
    });
}

function projectHost() {

}

function sendMulticastToken(registrationTokens, messageTitle, messageBody, res) {
    // console.log(registrationTokens);
    let message = {
        notification: {
            title: messageTitle,
            body: messageBody
        },
        android: {
            notification: {
                defaultSound: true,
                notificationCount: 1,
                sound: 'emergency.mp3',
                channelId: 'fcm_emergency_channel',
                icon: `${projectHost()}/android-chrome-192x192.png`,
            },
            ttl: 20000
        },
        webpush: {
            notification: {
                icon: `${projectHost()}/android-chrome-192x192.png`
            },
            fcm_options: {
                link: projectHost()
            }
        },
        apns: {
            payload: {
                aps: {
                    sound: 'emergency.aiff'
                }
            }
        },
        tokens: registrationTokens
    }
    if (filter_token_array(registrationTokens).length > 0) {
        admin.messaging().sendMulticast(message)
            .then(function (response) {
                // console.log("Successfully sent message:", response);
                res.json({
                    "status": 200,
                    "message": "message sent"
                    // "msgid": JSON.parse(str)[1]['msgid']
                });
            })
            .catch(function (error) {
                console.log("Error sending message:", error);
            });
    }
}

function filter_token_array(test_array) {
    // console.log(test_array);
    var index = -1,
        arr_length = test_array ? test_array.length : 0,
        resIndex = -1,
        result = [];

    while (++index < arr_length) {
        var value = test_array[index];

        if (value) {
            result[++resIndex] = value;
        }
    }
    // console.log(result);
    return result;
}

exports.subscribeUser = function (req, res) {
    let sql = `CALL ADD_SUBSCRIBED_USER(?)`;
    pool.getConnection(function (err, dbConn) {
        dbConn.query(sql,
            [req.body.subscription], function (err, subscriptionData) {
                if (err) {
                    console.log("error: ", err);
                    res.json({
                        status: 400,
                        "message": "customer Information not added successfully",
                        "subscriptionData": []
                    });
                }
                else {
                    // Thank you for subscribing the application. Click here to download Grostep :{#var#} . 
                    const url_link = 'https://bit.ly/317aftF';
                    let msg = `Thank you for subscribing the application. Click here to download Grostep :${url_link} .`;
                    var str = '';
                    let phone = +req.body.subscription;
                    var options = {
                        host: 'login.aquasms.com',
                        port: 80,
                        path: encodeURI('/sendSMS?username=vibhav&message=' + msg + '&sendername=GROSTP&smstype=TRANS&numbers=' + phone + '&apikey=2edaddf6-a3fa-40c5-a40d-3ce980b240fa'),
                        method: 'GET'
                    };
                    var reqGet = http.request(options, function (res1) {
                        res1.on('data', function (chunk) {
                            str += chunk;
                        });
                        res1.on('end', function () {
                            console.log(JSON.parse(str)[1]['msgid']);
                            // return str;
                            return res.json({
                                "status": 200,
                                "message": "customer Information added successfully",
                                "subscriptionData": subscriptionData[0],
                                "msgid": JSON.parse(str)[1]['msgid']
                            });
                        });
                    }).end();
                    reqGet.on('error', function (e) {
                        console.error(e);
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