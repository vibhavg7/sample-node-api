var mysql = require('mysql');
var rp = require('request-promise');
var admin = require("firebase-admin");


var pool = mysql.createPool({
    connectionLimit: 10,
    host: 'grostep-database.c8zeozlsfjcx.ap-south-1.rds.amazonaws.com',
    user: 'root',
    password: process.env.dbpassword,
    database: 'grostep'
});
exports.placeOrder = function (req, res) {
    let sql = `CALL PLACE_CUSTOMER_ORDER(?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`;
    pool.getConnection(function (err, dbConn) {
        dbConn.query(sql, [
            +req.body.customerid,
            +req.body.storeid,
            +req.body.deliverypersonid,
            +req.body.voucherid,
            +req.body.totalamount,
            +req.body.discountamount,
            +req.body.deliveryfee,
            +req.body.payableamount,
            +req.body.paymentmode,
            +req.body.deliveryaddressid,
            +req.body.totalitemcount,
            +req.body.delivernow,
            req.body.deliverydate,
            req.body.deliveryslot,
            req.body.instructions,
            req.body.payment_status],
            function (err, orderData) {
                if (err) {
                    console.log(err);
                    res.json({
                        status: 400,
                        "message": "order not placed",
                        "order_id": 0
                    });
                }
                else {
                    var token1 = orderData[0][0];
                    if (orderData[1][0]['order_id']) {                 
                        let newInsertProductData = [];
                        req.body.products.forEach((data) => {
                            let data1 = [];
                            data1.push(data.id);
                            data1.push(data.quantity);
                            data1.push(orderData[1][0]['order_id']);
                            newInsertProductData.push(data1);
                        });
                        console.log(newInsertProductData);
                        var sql = "INSERT INTO grostep.order_products_info (store_product_id, quantity,order_id) VALUES ?";
                        dbConn.query(sql, [newInsertProductData], function (err, results) {
                            if (err) {
                                res.json({
                                    status: 400,
                                    "message": "order not placed",
                                    "order_id": 0
                                });
                                // throw err;
                            } else {
                                console.log(results);
                                var registrationTokens = [
                                    token1['store_token'],
                                ];
                                let messageTitle = "New order recieved";
                                let messageBody = `Hello , ${orderData[0][0]['store_name']} you have recieved new order # ${orderData[1][0]['order_id']}. Click here for details.`;
                                sendMulticastToken(registrationTokens, messageTitle, messageBody);
                                res.json({
                                    "status": 200,
                                    "message": "order sucessfully placed added",
                                    "order_id": orderData[1][0]['order_id']
                                });
                            }
                            dbConn.release();
                        });
                    }
                }
            });
    });
}

function projectHost() {

}

exports.cancelOrderByCustomer = function (req, res) {
    let sql = `CALL CANCEL_ORDER_BY_CUSTOMER(?,?)`;
    let orderId = +req.params.orderId;
    let orderStatus = +req.body.status;
    if (orderStatus >= 3) {
        res.json({
            "status": 401,
            "message": "order can't be cancelled",
            "order": []
        });
    } else {
        pool.getConnection(function (err, dbConn) {
            dbConn.query(sql, [orderId, orderStatus],
                function (err, updatedOrder) {
                    if (err) {
                        console.log("error: ", err);
                        res.json({
                            "status": 400,
                            "message": "order not cancelled",
                            "order": []
                        })
                    }
                    else {
                        res.json({
                            "status": 200,
                            "message": "order cancelled",
                            "order": updatedOrder[0]
                        });
                    }
                    dbConn.release();
                });
        });
    }

}


exports.updateOrderBillImage = function (orderId, imageUrl, req, res) {
    let sql = `CALL UPDATE_ORDER_IMAGES(?,?)`;
    let image_url = imageUrl;
    pool.getConnection(function (err, dbConn) {
        dbConn.query(sql, [+orderId, image_url],
            function (err, updatedOrder) {
                if (err) {
                    console.log("error: ", err);
                    res.json({
                        "status": 400,
                        "message": "order images not updated",
                        "orderImage": {}
                    })
                }
                else {
                    res.json({
                        "status": 200,
                        "message": "bill image detail",
                        "orderImage": updatedOrder[0][0]
                    });
                }
                dbConn.release();
            });
    });
}

exports.fetchCustomerAllPaymentMethodsCityWise = function (req, res) {
    let sql = `CALL GET_CUSTOMER_PAYMENTMETHODSCITYWISE(?)`;
    console.log(req.body.city);
    pool.getConnection(function (err, dbConn) {
        console.error(err);
        dbConn.query(sql, [req.body.city],
            function (err, paymentMethodsData) {
                console.error(err);
                if (err) {
                    console.log("error: ", err);
                    res.json({
                        status: 400,
                        "message": "payment information method not found",
                    });
                }
                else {
                    res.json({
                        "message": "payment information",
                        "status": 200,
                        "paymentMethods": paymentMethodsData[0]
                    });
                }
                dbConn.release();
            });
    });
}

exports.fetchOrderBillInformation = function (req, res) {
    let sql = `CALL GET_ORDER_BILLINFO(?)`;

    pool.getConnection(function (err, dbConn) {
        dbConn.query(sql, [+req.params.orderId],
            function (err, orderData) {
                if (err) {
                    console.log("error: ", err);
                    res.json({
                        status: 400,
                        "message": "order bill information not found",
                    });
                }
                else {
                    res.json({
                        "message": "order bill information",
                        "status": 200,
                        "billInfo": orderData[0]
                    });
                }
                dbConn.release();
            });
    });
}

exports.updateOrder = function (req, res) {
    // const updatedOrder = req.body;
    let updatedOrder = {};
    updatedOrder.status = req.body.status;
    updatedOrder.order_merchant_status = req.body.order_merchant_status;

    pool.getConnection(function (err, dbConn) {
        dbConn.query("UPDATE orders SET ? WHERE order_id = ?", [updatedOrder, req.params.orderId], function (err, order) {
            if (err) {
                console.log("error: ", err);
                res.json({
                    status: 400,
                    "message": "order Information not updated",
                    "order": order
                });
            }
            else {
                var sql = "INSERT INTO grostep.order_merchant_info (merchant_id,order_id, status) VALUES(?,?,?)";
                let todo = [+req.body.storeId, +req.params.orderId, +req.body.order_merchant_status];
                dbConn.query(sql, todo, function (err, inserteddata) {
                    if (err) {
                        res.json({
                            status: 400,
                            "message": err.message,
                            "order": 0
                        });
                    } else {
                        res.json({
                            status: 200,
                            "message": "order Information updated",
                            "order": order
                        });
                    }
                });
            }
            dbConn.release();
        });
    });
}


exports.updateOrderStatusByMerchant = function (req, res) {

    let sql = `CALL UPDATE_ORDERSTATUS_BY_STORE(?,?,?,?,?,?)`;

    pool.getConnection(function (err, dbConn) {
        dbConn.query(sql, [+req.body.storeId, +req.params.orderId, +req.body.status,
        +req.body.order_merchant_status, req.body.bill_number, req.body.bill_amount],
            function (err, orderData) {
                if (err) {
                    console.log("error: ", err);
                    res.json({
                        status: 400,
                        "message": "order information not found",
                    });
                }
                else {
                    let deliveryPersonsTokens = [];
                    let customerToken = [];
                    if (req.body.order_merchant_status == 2 && orderData[0][0]['order_status'] != 12) {
                        dbConn.query("SELECT token FROM grostep.deliveryperson WHERE status = 1 and available = 1 and token is not null", function (err, deliverypersondata) {
                            if (err) {
                                res.json({
                                    status: 400,
                                    "message": "delivery person Information not found",
                                    "deliverypersondata": []
                                });
                            }
                            else {
                                deliverypersondata.forEach((data) => {
                                    deliveryPersonsTokens.push(data['token']);
                                });

                                customerToken.push(orderData[0][0]['customer_token']);
                                let messageBody = `Hello , ${orderData[0][0]['store_name']} have accepted the new order # ${orderData[0][0]['order_id']}. Click here to view details.`;
                                let messageTitle = 'Order Accepted';
                                sendTokenToCustomer(customerToken, messageTitle, messageBody);
                                sendMulticastToken(deliveryPersonsTokens, messageTitle, messageBody);
                                res.json({
                                    status: 200,
                                    "message": "order Information updated",
                                    "order": orderData[0][0]['order_id'],
                                    "order_status": orderData[0][0]['order_status']
                                });
                            }
                        });
                    } else if (req.body.order_merchant_status == 3 && orderData[0][0]['order_status'] != 12) {
                        let customer_token = orderData[0][0]['customer_token'];
                        let delivery_person_token = orderData[0][0]['delivery_person_token'];
                        registrationTokens.push(delivery_person_token);
                        var payload = {
                            notification: {
                                title: "Items confirmed by Merchant",
                                body: `Hello , ${orderData[0][0]['delivery_person_name']} items is confirmed for new order # ${orderData[0][0]['order_id']}. Click here to view the order.`
                            }
                        };

                        var options = {
                            priority: "high",
                            timeToLive: 60 * 60 * 24
                        };
                        admin.messaging().sendToDevice(registrationTokens, payload, options)
                            .then(function (response) {
                                console.log("Successfully sent message:", response);
                            })
                            .catch(function (error) {
                                console.log("Error sending message:", error);
                            });

                        res.json({
                            status: 200,
                            "message": "order Information updated",
                            "order": orderData[0][0]['order_id'],
                            "order_status": orderData[0][0]['order_status']
                        });

                    } else if (req.body.order_merchant_status == 4 && orderData[0][0]['order_status'] != 12) {
                        let customer_token = orderData[0][0]['customer_token'];
                        let delivery_person_token = orderData[0][0]['delivery_person_token'];
                        registrationTokens.push(delivery_person_token);
                        var payload = {
                            notification: {
                                title: "Items bill confirmed by Merchant",
                                body: `Hello , ${orderData[0][0]['delivery_person_name']} items bill is confirmed for new order # ${orderData[0][0]['order_id']}. Please proceed.`
                            }
                        };

                        var options = {
                            priority: "high",
                            timeToLive: 60 * 60 * 24
                        };
                        admin.messaging().sendToDevice(registrationTokens, payload, options)
                            .then(function (response) {
                                console.log("Successfully sent message:", response);
                            })
                            .catch(function (error) {
                                console.log("Error sending message:", error);
                            });

                        res.json({
                            status: 200,
                            "message": "order Information updated",
                            "order": orderData[0][0]['order_id'],
                            "order_status": orderData[0][0]['order_status']
                        });

                    } else {
                        res.json({
                            status: 200,
                            "message": "order cancelled by customer",
                            "order": orderData[0][0]['order_id'],
                            "order_status": orderData[0][0]['order_status']
                        });
                    }

                }
                dbConn.release();
            });
    });
}

function sendTokenToCustomer(registrationTokens, messageTitle, messageBody) {
    var payload = {
        notification: {
            title: messageTitle,
            body: messageBody
        }
    };

    var options = {
        priority: "high",
        timeToLive: 60 * 60 * 24
    };
    if (filter_token_array(registrationTokens).length > 0) {
        admin.messaging().sendToDevice(registrationTokens, payload, options)
            .then(function (response) {
                console.log("Successfully sent message:", response);
            })
            .catch(function (error) {
                console.log("Error sending message:", error);
            });
    }

}

function sendMulticastToken(registrationTokens, messageTitle, messageBody) {
    console.log(registrationTokens);
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
                console.log("Successfully sent message:", response);
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

exports.fetchDeliveryPersonOrdersInfoById = function (req, res) {
    let offStr = "";
    let offHrStr = parseInt(req.params.offset / 60) > 0 ? -parseInt(req.params.offset / 60) : Math.abs(parseInt(req.params.offset / 60));
    let offMinStr = Math.abs(req.params.offset % 60);
    offStr = offHrStr + ":" + offMinStr;

    let sql = `CALL GET_DELIVERYPERSON_ORDERS_COUNT(?,?)`;

    pool.getConnection(function (err, dbConn) {
        dbConn.query(sql, [+req.params.deliveryPersonId, offStr.toString()],
            function (err, orderData) {
                if (err) {
                    console.log("error: ", err);
                    res.json({
                        status: 400,
                        "message": "order count information not found",
                    });
                }
                else {
                    res.json({
                        "message": "orders counts information",
                        "status": 200,
                        "total_delivered_order_count": orderData[0],
                        "new_order_count": orderData[1],
                        "running_order_count": orderData[2],
                        "delivered_order_count": orderData[3],
                    });
                }
                dbConn.release();
            });
    });
}


exports.fetchMerchantOrderCountById = function (req, res) {
    // console.log('Hi');
    let offStr = "";
    let offHrStr = parseInt(req.params.offset / 60) > 0 ? -parseInt(req.params.offset / 60) : Math.abs(parseInt(req.params.offset / 60));
    let offMinStr = Math.abs(req.params.offset % 60);
    offStr = offHrStr + ":" + offMinStr;
    // console.log(offStr.toString());
    let sql = `CALL GET_MERCHANT_ORDERS_COUNT(?,?)`;

    pool.getConnection(function (err, dbConn) {
        dbConn.query(sql, [+req.params.storeId, offStr.toString()],
            function (err, orderData) {
                if (err) {
                    console.log("error: ", err);
                    res.json({
                        status: 400,
                        "message": "order count information not found",
                    });
                }
                else {
                    // console.log(orderData[0]);
                    res.json({
                        "message": "orders counts information",
                        "status": 200,
                        "new_order_count": orderData[0],
                        "pending_order_count": orderData[1],
                        "pending_billing_order_count": orderData[2],
                        "picked_order_count": orderData[3]
                    });
                }
                dbConn.release();
            });
    });
}


exports.fetchDeliveryBoyOrders = function (req, res) {
    let sql = `CALL GET_DELIVERYPERSON_ORDERS()`;

    pool.getConnection(function (err, dbConn) {
        dbConn.query(sql,
            function (err, orderData) {
                if (err) {
                    console.log("error: ", err);
                    res.json({
                        status: 400,
                        "message": "order count information not found",
                    });
                }
                else {
                    // console.log(orderData);
                    res.json({
                        "message": "orders counts information",
                        "status": 200,
                        "new_order_count": orderData[0],
                        "running_order_count": orderData[1],
                        "delivered_order_count": orderData[2]
                    });
                }
                dbConn.release();
            });
    });
}

exports.fetchOrderCount = function (req, res) {
    let sql = `CALL GET_ORDER_TYPE_COUNT(?)`;

    pool.getConnection(function (err, dbConn) {
        dbConn.query(sql, [+req.body.merchantId],
            function (err, orderCount) {
                if (err) {
                    console.log("error: ", err);
                    res.json({
                        status: 400,
                        "message": "order information not found",
                    });
                }
                else {
                    res.json({
                        "message": "orders count information",
                        "status": 200,
                        "new_orders_count": orderData[0],
                        "pending_orders_count": orderData[1],
                        "picked_orders_count": orderData[2]
                    });
                }
                dbConn.release();
            });
    });
}

exports.merchantBillconfirmation = function (req, res) {
    let sql = `CALL ORDER_BILL_CONFIRMATION(?,?,?)`;

    pool.getConnection(function (err, dbConn) {
        dbConn.query(sql, [+req.body.order_id, +req.body.bill_amount, +req.body.order_status],
            function (err, orderData) {
                if (err) {
                    console.log("error: ", err);
                    res.json({
                        status: 400,
                        "message": "order bill information not found",
                    });
                }
                else {
                    res.json({
                        "message": "order bill information",
                        "status": 200,
                        "billInfo": orderData[0]
                    });
                }
                dbConn.release();
            });
    });
}

exports.fetchCustomerLiveOrders = function (req, res) {
    let sql = `CALL GET_CUSTOMER_LIVEORDERS(?,?,?)`;
    pool.getConnection(function (err, dbConn) {
        dbConn.query(sql,
            [req.body.customerId, +req.body.page_number, +req.body.page_size], function (err, liveOrdersInfo) {
                if (err) {
                    console.log("error: ", err);
                }
                else {
                    res.json({
                        status: 200,
                        "message": "live orders Information",
                        "liveOrdersInfo": liveOrdersInfo[0],
                        "customer_liveorders_count": liveOrdersInfo[1]
                    });
                }
                dbConn.release();
            });
    });
}

exports.fetchCustomerLiveOrderCount = function (req, res) {
    pool.getConnection(function (err, dbConn) {
        dbConn.query("SELECT  COUNT(1) AS 'customer_liveorders_count' FROM grostep.orders WHERE customer_id = ? AND status BETWEEN 1 AND 10", req.params.customerId, function (err, liveOrderData) {
            if (err) {
                res.json({
                    status: 400,
                    "message": "Live orders Information not found",
                    "customer_liveorders_count": []
                });
            }
            else {
                res.json({
                    status: 200,
                    "message": "Live orders Information",
                    "customer_liveorders_count": liveOrderData[0]
                });
            }
            dbConn.release();
        });
    });
}

exports.fetchCustomerOrderDetailById = function (req, res) {
    let sql = `CALL GET_CUSTOMER_ORDER_DETAILBYID(?)`;
    pool.getConnection(function (err, dbConn) {
        dbConn.query(sql, [+req.params.orderId],
            function (err, customerOrderDetail) {
                let orderData = customerOrderDetail[0];
                let map = new Map();
                let mainOrderResult = [];
                let orderProductsResult = [];
                for (const item of orderData) {
                    if (!map.has(item.order_id)) {
                        map.set(item.order_id, true);
                        mainOrderResult.push({
                            "customer_id": item.customer_id,
                            "order_id": item.order_id,
                            "customer_name": item.customer_name,
                            "bill_amount": +item.merchant_bill_amount,
                            "order_amount": item.order_amount,
                            "bill_image_url": item.bill_image_url,
                            "discount_amount": item.discount_amount,
                            "final_amount": item.final_amount,
                            "order_placing_date": item.order_placing_date,
                            "payment_mode": item.payment_mode,
                            "voucher_code": item.voucher_code,
                            "voucher_amount": item.voucher_amount,
                            "registered_phone": item.registered_phone,
                            "email": item.email,
                            "delivery_address_id": item.delivery_address_id,
                            "cust_delivery_address": item.cust_delivery_address,
                            "cust_location": item.cust_location,
                            "cust_pincode": item.cust_pincode,
                            "cust_location": item.cust_location,
                            "delivery_amount": item.delivery_fee,
                            "cust_lat": item.cust_lat,
                            "cust_long": item.cust_long,
                            "address_type": item.address_type,
                            "landmark": item.landmark,
                            "delivery_phone_number": item.delivery_phone_number,
                            "store_name": item.store_name,
                            "store_phone_number": item.store_phone_number,
                            "store_address": item.store_address,
                            "store_location": item.store_location,
                            "delivery_phone_number": item.delivery_phone_number,
                            "delivery_phone_number": item.delivery_phone_number,
                            "order_status": item.order_status,
                            "order_status_type": item.order_status_type,
                            "payment_mode_type": item.payment_mode_type,
                            "payment_status": item.payment_status,
                            "products": []
                        })
                    }
                }
                map.clear();
                for (const item of orderData) {
                    orderProductsResult.push({
                        "order_id": item.order_id,
                        "product_id": item.product_id,
                        "store_product_mapping_id": item.store_product_mapping_id,
                        "product_image_url": item.product_image_url,
                        "store_cost_price": item.store_cost_price,
                        "store_selling_price": item.store_selling_price,
                        // "store_selling_price": item.store_selling_price,
                        "store_discount": item.store_discount,
                        "product_marked_price": item.product_marked_price,
                        "product_name": item.product_name,
                        // "product_marked_price": item.product_marked_price,
                        "quantity_buyed": item.quantity_buyed,
                        "weight": item.quantity,
                        "weight_text": item.weight_text,
                    });
                }

                mainOrderResult.forEach((data) => {
                    var newArray = orderProductsResult
                        .filter((item) => {
                            return (item.order_id === data.order_id);
                        })
                    data['products'] = (newArray);
                });

                // console.log(mainOrderResult);
                if (err) {
                    console.log("error: ", err);
                    res.json({
                        status: 400,
                        "message": "Customer orders Information not found",
                        "customer_orders_info": []
                    });
                }
                else {
                    res.json({
                        status: 200,
                        "message": "Customer orders Information",
                        "customer_orders_info": mainOrderResult,
                    });
                }
                dbConn.release();
            })
    });
}

exports.fetchCustomerLiveOrderDetailById = function (req, res) {
    let orderId = req.params.orderId;
    console.log(orderId);
    pool.getConnection(function (err, dbConn) {
        dbConn.query(`SELECT o.order_id,o.status AS 'order_current_status',dp.delivery_person_name,dp.phone,dp.rating,
                      s.latitude AS 'store_lat',s.longitude AS 'store_long',
                      cda.latitude AS 'customer_lat', cda.longitude AS 'customer_long',
                      o.bill_image_url FROM grostep.orders o 
                      left join deliveryperson dp on o.delivery_person_id = dp.delivery_person_id 
                      LEFT JOIN stores s on o.store_id = s.store_id
                      LEFT JOIN customer_delivery_address cda on o.delivery_address_id = cda.delivery_address_id
                      where o.order_id = ?;`, orderId, function (err, livecustomerorderdetail) {
                if (err) {
                    res.json({
                        status: 400,
                        "message": "customer live orders Information not found",
                        "livecustomerorderdetail": {}
                    });
                }
                else {
                    res.json({
                        status: 200,
                        "message": "customer live orders Information",
                        "livecustomerorderdetail": livecustomerorderdetail[0]
                    });
                }
                dbConn.release();
            });
    });
}


exports.fetchOrderDetailsById = function (req, res) {

    let sql = `CALL GET_ORDER_INFO(?)`;

    pool.getConnection(function (err, dbConn) {
        dbConn.query(sql, [+req.params.orderId],
            function (err, orderData) {
                if (err) {
                    console.log("error: ", err);
                    res.json({
                        status: 400,
                        "message": "order information not found",
                        "customerInfo": [],
                        "storeInfo": [],
                        "paymentInfo": []
                    });
                }
                else {
                    res.json({
                        "message": "order information",
                        "status": 200,
                        "customerInfo": orderData[0],
                        "storeInfo": orderData[1],
                        "paymentInfo": orderData[2]
                    });
                }
                dbConn.release();
            });

    });

}

exports.fetchAllOrders = function (req, res) {
    let sql = `CALL GET_STORE_ORDERS(?,?,?,?,?)`;
    pool.getConnection(function (err, dbConn) {
        dbConn.query(sql, [+req.body.storeId, +req.body.page_number, +req.body.page_size, req.body.filterBy, req.body.order_type],
            function (err, orders) {
                if (err) {
                    res.json({
                        status: 400,
                        "message": "Store orders Information not found",
                        "orders_info": [],
                        "order_count": []
                    });
                }
                else {
                    res.json({
                        status: 200,
                        "message": "Store orders Information",
                        "orders_info": orders[0],
                        "order_count": orders[1][0]
                    });
                }
                dbConn.release();
            });
    });
}

exports.fetchCustomerOrders = function (req, res) {
    let sql = `CALL GET_CUSTOMER_ORDERS(?,?,?,?)`;
    pool.getConnection(function (err, dbConn) {
        dbConn.query(sql, [+req.body.customerId, +req.body.page_number, +req.body.page_size, req.body.filterBy],
            function (err, customerOrders) {
                let orderData = customerOrders[0];

                if (err) {
                    console.log("error: ", err);
                    res.json({
                        status: 400,
                        "message": "Customer orders Information not found",
                        "customer_orders_info": [],
                        "customer_order_count": []
                    });
                }
                else {
                    res.json({
                        status: 200,
                        "message": "Customer orders Information",
                        "customer_orders_info": orderData,
                        "customer_order_count": customerOrders[1]
                    });
                }
                dbConn.release();
            });
    });
}