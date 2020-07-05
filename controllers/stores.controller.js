var mysql = require('mysql');
var jwt = require('jsonwebtoken');
var rp = require('request-promise');
var http = require('http');
var admin = require("firebase-admin");
var moment = require('moment');
var pool = mysql.createPool({
    connectionLimit: 10, 
    host: 'grostep-database.c8zeozlsfjcx.ap-south-1.rds.amazonaws.com',
    user: 'root',
    password: process.env.dbpassword,
    database: 'grostep'
});


exports.loginMerchant = function (req, res) {
    let sql = `CALL REGISTER_MERCHANT(?,?,?)`;
    const otp_number = Math.floor(1000 + Math.random() * 9000);
    let msgid = '';
    console.log(req.body);
    pool.getConnection(function (err, dbConn) {
        dbConn.query(sql, [req.body.phone, otp_number, req.body.token], function (err, merchant) {
            if (err) {
                res.json({
                    "status": 400,
                    "message": "merchant not registred",
                    "phone": 0,
                    "store_id": 0
                });
            }
            else {
                if (merchant[0].length > 0) {
                    let msg = `Hello merchant your generated otp is :${otp_number}`;
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
                        "message": "Merchant login successfully",
                        "phone": merchant[0][0].phone_number,
                        "store_id": merchant[0][0].store_id
                    });
                } else {
                    res.json({
                        "status": 400,
                        "message": "Merchant not found",
                        "phone": 0,
                        "store_id": 0
                    });
                }
            }
            dbConn.release();
        });
    });
}

exports.validateMerchant = function (req, res) {
    let sql = `CALL validateMerchant(?,?)`;
    pool.getConnection(function (err, dbConn) {
        dbConn.query(sql, [req.body.phone_number, req.body.otp_number], function (err, merchantData) {
            // res.json(employeeData);
            if (err) {
                res.json({
                    "status": 401,
                    "message": "Merchant Details not found",
                    "merchantData": merchantData[0]
                });
            }
            else {
                if (merchantData[0][0].login_status == 1) {
                    sendToken(merchantData[0][0], res);
                } else {
                    res.json({
                        "status": 204,
                        "message": "OTP not valid",
                        "token": "",
                        "merchantData": []
                    });
                }
                // res.json({
                //     "status": 200,
                //     "message": "Merchant Details",
                //     "employeeData": merchantData[0]
                // });
            }
            dbConn.release();
        });
    });

}

function sendToken(item, res) {
    var token = jwt.sign(item.store_id, "123");
    res.json({
        "status": 200,
        "message": "customer Details",
        "token": token,
        "merchantData": item
    });
}

exports.fetchAllStores = function (req, res) {
    let sql = `CALL GET_ALL_STORES_INFO(?,?,?)`;
    pool.getConnection(function (err, dbConn) {
        if (err) {
            console.error(err);
        } else {
            dbConn.query(sql, [+req.body.page_number, +req.body.page_size, req.body.filterBy],
                function (err, stores) {
                    if (err) {
                        console.log("error: ", err);
                    }
                    else {
                        res.json({
                            "message": "stores information",
                            "store": stores[0],
                            "store_total_count": stores[1][0]
                        });
                    }
                    dbConn.release();
                });
        }
    });
}
// getStoreDeliverySlots based on current time.
exports.getStoreDeliverySlots = function (req, res) {

    let sql = `CALL GET_STORE_INFO(?)`;
    pool.getConnection(function (err, dbConn) {
        dbConn.query(sql, [req.body.storeId], function (err, store) {
            if (err) {
                res.json({
                    status: 400,
                    "message": "Slots Information not found",
                    "slots": []
                });
            }
            else {
                let arr = [];
                let utcMoment = moment.utc();
                const timeoffset = req.body.offset;
                utcMoment.add(5, 'hours');
                utcMoment.add(30, 'minutes');
                let current_hour = utcMoment.hour();
                let current_mins = utcMoment.minutes();
                let store_opening_time = store[0][0].store_opening_time;
                let store_closing_time = store[0][0].store_closing_time;
                if (current_hour - store_opening_time > 0 && store_closing_time - current_hour > 0) {
                    let start_slot_index = 2;
                    if (current_mins > 30) {
                        start_slot_index = 3;
                    }
                    for (let i = start_slot_index, index = 0; current_hour + i < store_closing_time; i++) {
                        let slot = {};
                        let m1 = moment.utc();
                        m1.add(5, 'hours');
                        m1.add(30, 'minutes');
                        slot.slot_id = index++;
                        slot.start_time = current_hour + i;
                        slot.end_time = slot.start_time + 1;
                        slot.delivery_date = m1.add(i, 'hours').format("DD/MM/YYYY");
                        slot.utc_delivery_date = new Date(moment.utc().add(i, 'hours'));
                        // new Date(m1.add(i, 'hours'));
                        arr.push(slot);
                    }
                }
                console.log(arr);
                res.json({
                    status: 200,
                    "message": "delivery slots Information",
                    "slots": arr
                });
            }
            dbConn.release();
        });
    });
}

exports.updatestoreclosingstatus = function (req, res) {
    const updateStore = req.body;
    pool.getConnection(function (err, dbConn) {
        dbConn.query("UPDATE grostep.stores SET ? WHERE store_id = ?", [updateStore, +req.params.storeId], function (err, storeData) {
            if (err) {
                console.log("error: ", err);
                res.json({
                    status: 400,
                    "message": "store Information not updated",
                    "coupon": couponData
                });
            }
            else {
                res.json({
                    status: 200,
                    "message": "store Information updated",
                    "coupon": storeData
                });
            }
            dbConn.release();
        });
    });
}

// function calcTime(offset) {
//     var utcMoment = moment.utc();
//     utcMoment.add(5, 'hours');
//     utcMoment.add(30, 'minutes');
//     var utcDate = new Date(utcMoment.format());
//     console.log('utcMoment string = ' + utcMoment.format());
//     console.log(utcMoment.hour());
//     // console.log(utcDate.getMinutes());
//     console.log(new Date());
//     return utcDate;
// }

exports.fetchAllStoresBasedOnZipCode = function (req, res) {
    let sql = `CALL GET_ALL_STORES_ZIP_CODE(?,?,?,?,?)`;
    pool.getConnection(function (err, dbConn) {
        dbConn.query(sql, [req.body.filterBy, req.body.zipcode, +req.body.categoryId, +req.body.page_number, +req.body.page_size],
            function (err, stores) {
                if (err) {
                    // console.log("error: ", err);
                    res.json({
                        "status": 400,
                        "message": "stores information not found",
                        "store": [],
                        "store_total_count": {}
                    });
                }
                else {
                    filterStores(stores, req, res);
                }
                dbConn.release();
            });
    });
}



exports.fetchAllOngoingOrders = function (req, res) {
    let sql = `CALL GET_STORE_PENDINGORDERS(?,?,?,?)`;
    pool.getConnection(function (err, dbConn) {
        dbConn.query(sql, [+req.body.storeId, +req.body.page_number, +req.body.page_size, req.body.filterBy], function (err, ongoingorders) {
            if (err) {
                res.json({
                    status: 400,
                    "message": "ongoing orders Information not found",
                    "ongoing_orders_info": [],
                    "ongoing_order_count": []
                });
            }
            else {
                res.json({
                    status: 200,
                    "message": "ongoing orders Information",
                    "ongoing_orders_info": ongoingorders[0],
                    "ongoing_order_count": ongoingorders[1]
                });
            }
            dbConn.release();
        });
    });
}

exports.fetchAllBilledOrders = function (req, res) {
    pool.getConnection(function (err, dbConn) {
        dbConn.query("SELECT o.order_id ,o.total_item_count,o.total_amount AS 'order_amount',o.added_date AS 'order_placing_date',s.store_name  FROM grostep.orders o inner join stores s on o.store_id = s.store_id where o.store_id  = ? and o.order_merchant_status = 4;", req.params.storeId, function (err, billedOrders) {
            if (err) {
                res.json({
                    status: 400,
                    "message": "Billed Orders Information not found",
                    "billedOrders": []
                });
            }
            else {
                res.json({
                    status: 200,
                    "message": "Billed Orders Information",
                    "billedOrders": billedOrders
                });
            }
            dbConn.release();
        });
    });
}

exports.updateProductStock = function (req, res) {
    const updateStock = req.body;
    pool.getConnection(function (err, dbConn) {
        dbConn.query("UPDATE stores_products_mapping SET ? WHERE store_product_mapping_id = ?",
            [updateStock, req.params.id], function (err, updateStock) {
                if (err) {
                    console.log("error: ", err);
                }
                else {
                    let updated = false;
                    if (updateStock.affectedRows == 1) {
                        updated = true;
                    }
                    res.json({
                        "message": (updated) ? "stock updated successfully" : "invalid category id",
                        "status": (updated) ? 200 : 400,
                        "stock": updateStock,
                        "product_id": req.params.id
                    });
                }
                dbConn.release();
            });
    });
}

exports.editStoreProductInfoById = function (req, res) {
    const ProductInfo = req.body;
    pool.getConnection(function (err, dbConn) {
        dbConn.query("UPDATE grostep.stores_products_mapping SET ? WHERE store_product_mapping_id = ?",
            [ProductInfo, +req.params.productId], function (err, updatedProduct) {
                if (err) {
                    console.log("error: ", err);
                    res.json({
                        status: 400,
                        "message": "Product not updated",
                        "coupon": updatedProduct
                    });

                }
                else {
                    res.json({
                        status: 200,
                        "message": "coupon Information updated",
                        "coupon": updatedProduct
                    });
                }
                dbConn.release();
            });
    });
}

//to be deleted

exports.fetchStoreProductInfoById = function (req, res) {
    let sql = `CALL GET_STORE_PRODUCTINFO(?)`;
    pool.getConnection(function (err, dbConn) {
        dbConn.query(sql, [+req.params.id], function (err, productInfo) {
            if (err) {
                console.log("error: ", err);
                res.json({
                    status: 400,
                    "message": "Store products Information not found",
                    "products_info": productInfo[0],
                });
            }
            else {
                res.json({
                    status: 200,
                    "message": "Product Information",
                    "products_info": productInfo[0],
                });
            }
            dbConn.release();
        });
    });
}

exports.fetchStoreProductsById = function (req, res) {
    let sql = `CALL GET_STORE_PRODUCTS_ADMIN(?,?,?,?)`;
    pool.getConnection(function (err, dbConn) {
        dbConn.query(sql, [+req.body.storeId, +req.body.page_number, +req.body.page_size, req.body.filterBy], function (err, store) {
            if (err) {
                console.log("error: ", err);
                res.json({
                    status: 400,
                    "message": "Store products Information not found",
                    "store_products_info": store[0],
                    "store_products_count": store[1]
                });
            }
            else {
                res.json({
                    status: 200,
                    "message": "Store products Information",
                    "store_products_info": store[0],
                    "store_products_count": store[1]
                });
            }
            dbConn.release();
        });
    });
}

exports.storeClosingStatus = function (req, res) {
    pool.getConnection(function (err, dbConn) {
        dbConn.query("SELECT store_id,closed from grostep.stores where store_id  = ?;", req.params.storeId, function (err, storeInfo) {
            if (err) {
                res.json({
                    status: 400,
                    "message": "store Information not found",
                    "ongoingorders": []
                });
            }
            else {
                res.json({
                    status: 200,
                    "message": "store Information",
                    "storeInfo": storeInfo
                });
            }
            dbConn.release();
        });
    });
}


exports.fetchStoreProductsCategoryWise = function (req, res) {
    let sql = `CALL GET_STORE_PRODUCTS_CATEGORYWISE(?,?,?,?)`;
    pool.getConnection(function (err, dbConn) {
        dbConn.query(sql, [+req.body.category_mapping_id, +req.body.store_id, +req.body.page_number, +req.body.page_size, +req.body.sub_category_id],
            function (err, storeProducts) {
            if (err) {
                console.log("error: ", err);
                res.json({
                    status: 400,
                    "message": "Store products Information not found",
                    "store_sub_categories_info": [],
                    "store_products_info": [],
                    "store_products_count": []
                });
            }
            else {
                res.json({
                    status: 200,
                    "message": "Store products Information",
                    "store_sub_categories_info": storeProducts[0],
                    "store_products_info": storeProducts[1],
                    "store_products_count": storeProducts[2]
                });
            }
            dbConn.release();
        });
    });
}

exports.deleteStore = function (req, res) {
    pool.getConnection(function (err, dbConn) {
        dbConn.query("DELETE FROM stores WHERE store_id = ? ", req.params.storeId,
            function (err, storeData) {
                if (err) {
                    console.log("error: ", err);
                }
                else {
                    let deleted = false;
                    if (storeData.affectedRows == 1) {
                        deleted = true;
                    }
                    res.json({
                        "message": (deleted) ? "store sub Category deleted successfully" : "invalid category id",
                        "status": (deleted) ? 200 : 400,
                        "category_id": req.params.storeId
                    });
                }
                dbConn.release();
            });
    });
}

exports.deleteStoreProduct = function (req, res) {
    pool.getConnection(function (err, dbConn) {
        dbConn.query("DELETE FROM stores_products_mapping WHERE store_product_mapping_id = ? ", req.params.id,
            function (err, storeProductData) {
                if (err) {
                    console.log("error: ", err);
                }
                else {
                    let deleted = false;
                    if (storeProductData.affectedRows == 1) {
                        deleted = true;
                    }
                    res.json({
                        "message": (deleted) ? "store sub Category deleted successfully" : "invalid category id",
                        "status": (deleted) ? 200 : 400,
                        "category_id": req.params.id
                    });
                }
                dbConn.release();
            });
    });
}

exports.fetchAllPendingBilledOrders = function (req, res) {
    pool.getConnection(function (err, dbConn) {
        dbConn.query("SELECT o.order_id ,o.total_item_count,o.total_amount AS 'order_amount',o.added_date AS 'order_placing_date',s.store_name  FROM grostep.orders o inner join stores s on o.store_id = s.store_id where o.store_id  = ? and o.order_merchant_status = 4;", req.params.storeId, function (err, billedOrders) {
            if (err) {
                res.json({
                    status: 400,
                    "message": "Billed Orders Information not found",
                    "billedOrders": []
                });
            }
            else {
                res.json({
                    status: 200,
                    "message": "Billed Orders Information",
                    "billedOrders": billedOrders
                });
            }
            dbConn.release();
        });
    });
}

exports.fetchStoreOrderProductsById = function (req, res) {
    let sql = `CALL GET_ORDER_PRODUCTS(?)`;
    pool.getConnection(function (err, dbConn) {
        dbConn.query(sql, [+req.params.orderId],
            function (err, orderProducts) {
                if (err) {
                    console.log("error: ", err);
                    res.json({
                        status: 400,
                        "message": "Store products Information not found",
                        "order_products_info": []
                    });
                }
                else {
                    res.json({
                        status: 200,
                        "message": "Store products Information",
                        "order_products_info": orderProducts[0]
                    });
                }
                dbConn.release();
            });
    });
}

exports.fetchStorePastOrdersById = function (req, res) {
    let offStr = "";
    let offHrStr = parseInt(req.body.offset / 60) > 0 ? -parseInt(req.body.offset / 60) : Math.abs(parseInt(req.body.offset / 60));
    let offMinStr = Math.abs(req.body.offset % 60);
    offStr = offHrStr + ":" + offMinStr;
    // console.log(offStr.toString());
    let sql = `CALL GET_STORE_PAST_ORDERS(?,?,?,?,?,?)`;
    pool.getConnection(function (err, dbConn) {
        dbConn.query(sql, [+req.body.storeId, +req.body.page_number, +req.body.page_size, req.body.filterBy,
        req.body.order_type, offStr.toString()],
            function (err, storeOrders) {
                // console.log(sql);
                // console.log(storeOrders[1]);
                if (err) {
                    res.json({
                        status: 400,
                        "message": "Store orders Information not found",
                        "store_orders_info": [],
                        "store_order_count": [],
                        "orders_billing_amount": []
                    });
                }
                else {
                    res.json({
                        status: 200,
                        "message": "Store orders Information",
                        "store_orders_info": storeOrders[0],
                        "store_order_count": storeOrders[1],
                        "orders_billing_amount": storeOrders[2]
                    });
                }
                dbConn.release();
            });
    });
}

exports.fetchStoreOrdersById = function (req, res) {
    // console.log(req.body);
    // let offStr = "";
    // let offHrStr = parseInt(req.body.offset/60) > 0 ? -parseInt(req.body.offset/60) : Math.abs(parseInt(req.body.offset/60));
    // let offMinStr = Math.abs(req.body.offset%60);
    // offStr = offHrStr+":"+offMinStr;
    // console.log(offStr.toString());
    let sql = `CALL GET_STORE_ORDERS(?,?,?,?,?)`;
    pool.getConnection(function (err, dbConn) {
        dbConn.query(sql, [+req.body.storeId, +req.body.page_number, +req.body.page_size, req.body.filterBy,
        req.body.order_type],
            function (err, storeOrders) {
                if (err) {
                    res.json({
                        status: 400,
                        "message": "Store orders Information not found",
                        "store_orders_info": [],
                        "store_order_count": []
                    });
                }
                else {
                    res.json({
                        status: 200,
                        "message": "Store orders Information",
                        "store_orders_info": storeOrders[0],
                        "store_order_count": storeOrders[1]
                    });
                }
                dbConn.release();
            });
    });
}
exports.fetchStoreNewPickedOrdersById = function (req, res) {
    // console.log(req.body);
    let offStr = "";
    let offHrStr = parseInt(req.body.offset / 60) > 0 ? -parseInt(req.body.offset / 60) : Math.abs(parseInt(req.body.offset / 60));
    let offMinStr = Math.abs(req.body.offset % 60);
    offStr = offHrStr + ":" + offMinStr;
    console.log(offStr.toString());
    let sql = `CALL GET_STORE_NEW_PICKED_ORDERS(?,?,?,?,?,?)`;
    pool.getConnection(function (err, dbConn) {
        dbConn.query(sql, [+req.body.storeId, +req.body.page_number, +req.body.page_size, req.body.filterBy,
        req.body.order_type, offStr.toString()],
            function (err, storeOrders) {
                if (err) {
                    res.json({
                        status: 400,
                        "message": "Store orders Information not found",
                        "store_orders_info": [],
                        "store_order_count": []
                    });
                }
                else {
                    console.log(storeOrders[0][0]['order_placing_date']);
                    res.json({
                        status: 200,
                        "message": "Store orders Information",
                        "store_orders_info": storeOrders[0],
                        "store_order_count": storeOrders[1]
                    });
                }
                dbConn.release();
            });
    });
}

function filterStores(stores, req, res) {
    // console.log(stores[0]);
    let utcMoment = moment.utc();
    const timeoffset = req.body.offset;
    utcMoment.add(5, 'hours');
    utcMoment.add(30, 'minutes');
    let current_hour = utcMoment.hour();
    let current_mins = utcMoment.minutes();
    stores[0].forEach(data => {
        let store_opening_time = data.store_opening_time;
        let store_closing_time = data.store_closing_time;
        if ((store_opening_time <= current_hour) && (store_closing_time > current_hour)) {
            data.closed = 0;
        } else {
            data.closed = 1;
        }
    });
    // console.log(stores[0]);
    res.json({
        "status": 200,
        "message": "stores information",
        "store": stores[0],
        "store_total_count": stores[1][0]
    });
}

exports.fetchStoreById = function (req, res) {
    let sql = `CALL GET_STORE_INFO(?)`;
    pool.getConnection(function (err, dbConn) {
        dbConn.query(sql, [req.params.storeId], function (err, store) {
            if (err) {
                res.json({
                    status: 400,
                    "message": "Store Information not found",
                    "store": store[0]
                });
            }
            else {
                let utcMoment = moment.utc();
                const timeoffset = req.body.offset;
                utcMoment.add(5, 'hours');
                utcMoment.add(30, 'minutes');
                let current_hour = utcMoment.hour();
                let current_mins = utcMoment.minutes();
                let store_opening_time = store[0][0].store_opening_time;
                let store_closing_time = store[0][0].store_closing_time;
                if ((store_opening_time <= current_hour) && (store_closing_time > current_hour)) {
                    store[0][0].closed = 0;
                } else {
                    store[0][0].closed = 1;
                }
                // console.log(store[0]);
                res.json({
                    status: 200,
                    "message": "store Information",
                    "store": store[0]
                });
            }
            dbConn.release();
        });
    });
}

exports.addNewStore = function (req, res) {
    console.log('Hi');
    const newProduct = req.body;
    let sql = `CALL ADD_NEW_STORE(?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`;

    let storeName = req.body.storeName;
    let storeCategoryName = +req.body.storeCategoryName;

    let storeEmail = req.body.storeEmail;
    let storePhoneNumber = +req.body.storePhoneNumber;
    let storeAlternateNumber = +req.body.storeAlternateNumber;

    let storeLandlineNumber = +req.body.storeLandlineNumber;
    let country = req.body.country;
    let state = req.body.state;
    let city = req.body.city;

    let storeGSTNumber = req.body.storeGSTNumber;
    let storePANNumber = req.body.storePANNumber;
    let storeAddress = req.body.storeAddress;
    let pinCode = req.body.pinCode;

    let storeDescription = req.body.storeDescription;
    let storeRating = +req.body.storeRating;
    let latitude = req.body.latitude;
    let longitude = req.body.longitude;
    let openingTime = +req.body.openingTime;
    let closingTime = +req.body.closingTime;
    let openingTimeClock = req.body.openingTimeClock;
    let closingTimeClock = req.body.closingTimeClock;
    let status = +req.body.status;
    let password = req.body.password;

    // console.log(req.body);

    pool.getConnection(function (err, dbConn) {
        dbConn.query(sql, [storeName, storeEmail, storePhoneNumber, storeAlternateNumber,
            storeLandlineNumber, country, state, city, storeGSTNumber, storePANNumber,
            storeAddress, pinCode, storeDescription, storeRating, latitude, longitude,
            status, storeCategoryName, openingTime, closingTime, openingTimeClock, closingTimeClock, password],
            function (err, store) {
                if (err) {
                    console.log("error: ", err);
                    res.json({
                        "message": "store not added",
                        "status": 400,
                        "store_id": 0
                    });
                }
                else {
                    console.log(JSON.stringify(store));
                    res.json({
                        "status": 200,
                        "message": "store added",
                        "store_id": store[0][0]['store_id']
                    });
                }
                dbConn.release();
            });
    });
}

exports.addStoreProducts = function (req, res) {
    const newProduct = req.body;

    let sql = `CALL ADD_STORE_NEW_PRODUCT(?,?,?,?,?,?,?,?,?,?,?,?,?,?)`;

    let product_id = +req.body.product_id;
    let store_id = +req.body.store_id;
    let store_cost_price = +req.body.store_cost_price;
    let store_marked_price = +req.body.store_marked_price;
    let store_selling_price = +req.body.store_selling_price;
    let store_margin = +req.body.store_margin;
    let store_discount = +req.body.store_discount;
    let store_initial_quantity = +req.body.store_initial_quantity;
    let store_updated_quantity = +req.body.store_updated_quantity;
    let store_additional_quantity = +req.body.store_additional_quantity;
    let status = +req.body.status;
    let stock = + req.body.stock;

    let parent_category_id = + req.body.parent_category_id;
    let category_id = + req.body.category_id;
    pool.getConnection(function (err, dbConn) {
        dbConn.query(sql, [product_id, store_id, store_marked_price, store_cost_price, store_selling_price,
            store_margin, store_discount, store_initial_quantity, store_updated_quantity,
            store_additional_quantity, status, stock, parent_category_id, category_id],
            function (err, store) {
                if (err) {
                    console.log(err);
                    res.json({
                        "message": "store product not added",
                        "status": 400,
                        "store_product_mapping_id": 0
                    });
                }
                else {
                    console.log(JSON.stringify(store));
                    res.json({
                        "status": 200,
                        "message": "store product added successfully",
                        "store_product_mapping_id": store[0][0]['store_product_mapping_id']
                    });
                }
                dbConn.release();
            });
    });
}

exports.updateStore = function (req, res) {
    const updatedStore = req.body;
    // console.log(updatedStore);
    // console.log(req.params.storeId);
    pool.getConnection(function (err, dbConn) {
        dbConn.query("UPDATE stores SET ? WHERE store_id = ?", [updatedStore, req.params.storeId], function (err, store) {
            if (err) {
                console.log("error: ", err);
                res.json({
                    status: 400,
                    "message": "store Information not updated",
                    "store": store
                });

            }
            else {
                console.log(JSON.stringify(store));
                res.json({
                    status: 200,
                    "message": "store Information updated",
                    "store": store
                });
            }
            dbConn.release();
        });
    });
}

exports.updateStoreImages = function (store_id, imageUrl, req, res) {
    let sql = `CALL UPDATE_STORE_IMAGES(?,?,?)`;
    let storeId = +store_id;
    let image_url = imageUrl;
    let status = 1;
    pool.getConnection(function (err, dbConn) {
        dbConn.query(sql, [storeId, image_url, status],
            function (err, updatedStore) {
                if (err) {
                    console.log("error: ", err);
                    res.json({
                        "status": 400,
                        "message": "store images not updated",
                        "product_id": 0
                    })
                }
                else {
                    res.json({
                        "status": 200,
                        "message": "store detail",
                        "product": updatedStore[0][0]
                    });
                }
                dbConn.release();
            });
    });
}

exports.fetchStoreSubCategoriesInfoById = function (req, res) {
    let sql = `CALL GET_STORE_CATEGORIES(?)`;
    pool.getConnection(function (err, dbConn) {
        dbConn.query(sql,
            [req.params.storeId], function (err, storeCategory) {
                if (err) {
                    console.log("error: ", err);
                }
                else {
                    res.json({
                        status: 200,
                        "message": "Store Categories Information",
                        "store_categories": storeCategory[0],
                    });
                }
                dbConn.release();
            });
    });
}

exports.searchStoreAndProductsBasedOnName = function (req, res) {
    let sql = `CALL SEARCH_STORES_AND_PRODUCTS(?,?,?,?,?)`;
    pool.getConnection(function (err, dbConn) {
        dbConn.query(sql, [req.body.filterBy, req.body.zipcode, +req.body.categoryId, +req.body.storeId, req.body.storedCity.toLowerCase()],
            function (err, stores) {
                if (err) {
                    console.log("error: ", err);
                    res.json({
                        "status": 400,
                        "message": "stores information not found",
                        "store": []
                    });
                }
                else {
                    let storeProductsData = stores[1];
                    let map = new Map();
                    let mainCategoryResult = [];
                    for (const item of storeProductsData) {
                        if (!map.has(item.store_id)) {
                            map.set(item.store_id, true);
                            mainCategoryResult.push({
                                "store_name": item.store_name,
                                "store_id": item.store_id,
                                "store_image_url": item.store_image_url,
                                "token": item.token,
                                "store_address": item.address,
                                "store_opening_time": item.store_opening_time,
                                "store_opening_time_clock": item.store_opening_time_clock,
                                "store_closing_time": item.store_closing_time,
                                "store_closing_time_clock": item.store_closing_time_clock,
                                "closed": closingStatusOfStore(item),
                                "latitude": item.latitude,
                                "longitude": item.longitude,
                                "productsData": []
                            })
                        }
                    }
                    map.clear();

                    mainCategoryResult.forEach((data) => {
                        var newArray = storeProductsData
                            .filter((item) => {
                                return (item.store_id === data.store_id);
                            })
                        data['productsData'] = (newArray);
                    });


                    res.json({
                        "status": 200,
                        "message": "stores information",
                        "store": stores[0],
                        "products": mainCategoryResult
                    });
                }
                dbConn.release();
            });
    });
}

function closingStatusOfStore(store) {
    let utcMoment = moment.utc();
    // const timeoffset = req.body.offset;
    utcMoment.add(5, 'hours');
    utcMoment.add(30, 'minutes');
    let current_hour = utcMoment.hour();
    let current_mins = utcMoment.minutes();
    let store_opening_time = store.store_opening_time;
    let store_closing_time = store.store_closing_time;
    if ((store_opening_time <= current_hour) && (store_closing_time > current_hour)) {
        return closed = 0;
    } else {
        return closed = 1;
    }
}


exports.resendOTP = function (req, res) {
    let sql = `CALL RESEND_STORE_OTP(?,?)`;
    const otp_number = Math.floor(1000 + Math.random() * 9000);
    let msgid = '';
    pool.getConnection(function (err, dbConn) {
        dbConn.query(sql, [+req.params.storeId, otp_number],
            function (err, storeInfo) {
                if (err) {
                    console.log("error: ", err);
                    res.json({
                        "status": 400,
                        "message": "store not created",
                        "phone": 0,
                        "store_id": 0,
                        "msgid": ''
                    });
                }
                else {
                    let msg = `Hello your generated otp is :${otp_number}`;
                    var str = '';
                    let phone = storeInfo[0][0].phone_number;
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
                                "phone": storeInfo[0][0].phone_number,
                                "msgid": JSON.parse(str)[1]['msgid'],
                                "store_id": storeInfo[0][0].store_id
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