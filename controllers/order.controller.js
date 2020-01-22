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

    let sql = `CALL PLACE_CUSTOMER_ORDER(?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`;

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
            req.body.instructions],
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
                    if (orderData[0][0]['order_id']) {
                        let keys = ['id', 'quantity', 'orderid']
                        let values = req.body.products.map((obj) => {
                            return keys.map((key) => {
                                if (key == 'orderid') {
                                    return orderData[0][0]['order_id'];
                                }
                                return obj[key];
                            })
                        });
                        var sql = "INSERT INTO grostep.order_products_info (store_product_id, quantity,order_id) VALUES ?";
                        dbConn.query(sql, [values], function (err) {
                            if (err) {
                                throw err;
                            } else {

                                // var payload = {
                                //     data: {
                                //       orderid: orderData[0][0]['order_id']
                                //     }
                                //   };

                                // var payload = {
                                //     data: {
                                //       score: '89355',
                                //       time: '2:45'
                                //     }
                                //   };

                                // var options = {
                                //     priority: 'high',
                                //     timeToLive: 60 * 60 * 24
                                // };

                                // console.log(req.body.storeToken);


                                // admin.messaging().sendToDevice(req.body.storeToken, payload, options)
                                //     .then(function (response) {
                                //         // See the MessagingDevicesResponse reference documentation for
                                //         // the contents of response.
                                //         console.log('Successfully sent message:', response);
                                //     })
                                //     .catch(function (error) {
                                //         console.log('Error sending message:', error);
                                //     });


                                // let msg = `Hello your order ${orderData[0][0]['order_id']} has been placed successfully`;
                                // rp(`http://login.aquasms.com/sendSMS?username=vibhav&message=${msg}&sendername=GROSTP&smstype=TRANS&numbers=${req.body.phone}&apikey=2edaddf6-a3fa-40c5-a40d-3ce980b240fa`)
                                //     .then(function (res) {
                                //         // Process html...
                                //         console.log(res);
                                //         msgid = res[0]['msgid'];
                                //     })
                                //     .catch(function (err) {
                                //         // Crawling failed...
                                //         console.log(err);
                                //     });
                                res.json({
                                    "status": 200,
                                    "message": "order sucessfully placed added",
                                    "order_id": orderData[0][0]['order_id']
                                });
                            }
                        });
                    }
                }

                // console.log(pool._freeConnections.indexOf(dbConn)); // -1

                dbConn.release();

                // console.log(pool._freeConnections.indexOf(dbConn)); // 0
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

exports.updateOrder = function(req, res) {
    const updatedOrder = req.body;
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
                console.log(JSON.stringify(order));
                res.json({
                    status: 200,
                    "message": "order Information updated",
                    "order": order
                });
            }
            dbConn.release();
        });
    });
}


exports.fetchMerchantOrderCountById = function (req, res) {
    let sql = `CALL GET_MERCHANT_ORDERS_COUNT(?)`;

    pool.getConnection(function (err, dbConn) {
        dbConn.query(sql, [+req.params.storeId],
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
                        "pending_order_count": orderData[1],
                        "picked_order_count": orderData[2]
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

exports.fetchCustomerOrders = function (req, res) {
    let sql = `CALL GET_CUSTOMER_ORDERS(?,?,?,?)`;

    pool.getConnection(function (err, dbConn) {
        dbConn.query(sql, [+req.body.customerId, +req.body.page_number, +req.body.page_size, req.body.filterBy],
            function (err, customerOrders) {
                let orderData = customerOrders[0];
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
                            "order_amount": item.order_amount,
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
                            "payment_mode_type": item.payment_mode_type,
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
                        "customer_orders_info": [],
                        "customer_order_count": []
                    });
                }
                else {
                    res.json({
                        status: 200,
                        "message": "Customer orders Information",
                        "customer_orders_info": mainOrderResult,
                        "customer_order_count": customerOrders[1]
                    });
                }
                dbConn.release();
            });
    });
}