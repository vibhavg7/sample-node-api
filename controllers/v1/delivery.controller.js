var jwt = require('jsonwebtoken');
var rp = require('request-promise');
var admin = require("firebase-admin");
var http = require('http');
var pool = require('../../utils/manageDB');
var createError = require('http-errors');

exports.fetchAllNewOrders = function (req, res) {
    let sql = `CALL GET_DELIVERY_NEWORDERS(?,?)`;
    pool.getConnection(function (err, dbConn) {
        dbConn.query(sql, [+req.body.page_number, +req.body.page_size],
            function (err, newOrders) {
                if (err) {
                    res.json({
                        status: 400,
                        "message": "orders Information not found",
                        "new_orders_info": [],
                        "new_order_count": []
                    });
                }
                else {
                    res.json({
                        status: 200,
                        "message": "New orders Information",
                        "new_orders_info": newOrders[0],
                        "new_order_count": newOrders[1]
                    });
                }
                dbConn.release();
            });
    });
}

// fetchAllNewOrdersCount

exports.fetchAllRunningOrders = async function (req, res, next) {
    let sql = `CALL GET_DELIVERY_ONGOINGORDERS(?,?,?)`;
    try {
        const ongoingOrders = await pool.query(sql, [+req.params.deliveryPersonId, +req.body.page_number, +req.body.page_size]);
        res.json({
            status: 200,
            "message": "Ongoing orders Information",
            "ongoing_orders_info": ongoingOrders[0],
            "ongoing_order_count": ongoingOrders[1]
        });
    }
    catch (err) {
        next(createError(401, err));
    } finally {
        // pool.end();
    }
}

exports.fetchDeliveryPersonAllPastOrders = async function (req, res, next) {

    let sql = `CALL FETCH_DELIVERYPERSON_ALL_PAST_ORDERS(?,?,?)`;
    try {
        const pastOrders = await pool.query(sql, [+req.body.deliveryPersonId, +req.body.page_number, +req.body.page_size]);
        res.json({
            status: 200,
            "message": "DP past orders Information",
            "deliveryperson_pastorders_info": pastOrders[0],
            "deliveryperson_pastorders_count": pastOrders[1]
        });
    }
    catch (err) {
        next(createError(401, err));
    } finally {
        // pool.end();
    }
}

exports.fetchpastorders = function (req, res) {
    let offStr = "";
    let offHrStr = parseInt(req.body.offset / 60) > 0 ? -parseInt(req.body.offset / 60) : Math.abs(parseInt(req.body.offset / 60));
    let offMinStr = Math.abs(req.body.offset % 60);
    offStr = offHrStr + ":" + offMinStr;
    console.log(offStr.toString());
    let sql = `CALL GET_DP_PAST_ORDERS(?,?,?,?,?,?)`;
    pool.getConnection(function (err, dbConn) {
        dbConn.query(sql, [+req.body.deliverypersonid, +req.body.page_number, +req.body.page_size, req.body.filterBy,
        req.body.order_type, offStr.toString()],
            function (err, pastOrders) {
                // console.log(sql);
                console.log(pastOrders);
                if (err) {
                    console.log(err);
                    res.json({
                        status: 400,
                        "message": "DP orders Information not found",
                        "dp_orders_info": [],
                        "dp_order_count": [],
                        // "orders_billing_amount": []
                    });
                }
                else {
                    res.json({
                        status: 200,
                        "message": "DP orders Information",
                        "dp_orders_info": pastOrders[0],
                        "dp_order_count": pastOrders[1],
                        // "orders_billing_amount": storeOrders[2]
                    });
                }
                dbConn.release();
            });
    });
}

exports.fetchRunningStatusByOrderId = function (req, res) {
    pool.getConnection(function (err, dbConn) {
        // CASE WHEN is_order_edit = 1 THEN merchant_bill_amount WHEN is_order_edit = 0 THEN payable_amount ELSE payable_amount END AS 'payable_amount'
        dbConn.query("SELECT o.order_id,o.order_merchant_status,o.total_amount,o.delivery_fee,o.discount_amount,o.payable_amount AS 'payable_amount',o.status AS 'order_current_status',o.total_item_count,o.deliver_now,o.delivery_date,o.delivery_slot,o.instructions,o.order_deliveryperson_status,cda.customer_name,cda.phone AS 'customer_phone_number',cda.flatNumber AS 'customer_flatNumber',cda.landmark AS 'customer_landmark',cda.longitude AS 'customer_longitude',cda.latitude AS 'customer_latitude',cda.pincode AS 'customer_pincode',cda.city AS 'customer_city',cda.state AS 'customer_state',cda.country AS 'customer_country',cda.address AS 'customer_address',cda.address2 AS 'customer_address2',s.store_name,s.phone_number AS 'store_phone_number', s.alternative_number AS 'store_alternative_number',s.address AS 'store_address',s.state AS 'store_state',s.city AS 'store_city',s.country AS 'store_country', s.pin_code As 'store_pincode',s.latitude AS 'store_latitude', s.longitude AS 'store_longitude',pm.payment_method_name FROM grostep.orders o inner join stores s on o.store_id = s.store_id inner join payment_method pm on o.payment_mode = pm.payment_method_id inner join grostep.customer_delivery_address cda on o.delivery_address_id = cda.delivery_address_id where o.delivery_person_id  = ? and o.order_id = ?  ", [req.body.deliverypersonid, req.body.orderId], function (err, orderdata) {
            if (err) {
                res.json({
                    status: 400,
                    "message": "order Information not found",
                    "orderdata": []
                });
            }
            else {
                res.json({
                    status: 200,
                    "message": "running order Information",
                    "orderdata": orderdata
                });
            }
            dbConn.release();
        });
    });
}

exports.fetchAllDeliveredOrders = function (req, res) {
    let offStr = "";
    let offHrStr = parseInt(req.body.offset / 60) > 0 ? -parseInt(req.body.offset / 60) : Math.abs(parseInt(req.body.offset / 60));
    let offMinStr = Math.abs(req.body.offset % 60);
    offStr = offHrStr + ":" + offMinStr;
    let sql = `CALL GET_DELIVERY_DELIVEREDORDERS(?,?,?,?)`;
    pool.getConnection(function (err, dbConn) {
        dbConn.query(sql, [+req.params.deliveryPersonId, +req.body.page_number, +req.body.page_size, offStr.toString()],
            function (err, deliveredOrders) {
                if (err) {
                    res.json({
                        status: 400,
                        "message": "Delivered orders Information not found",
                        "delivered_orders_info": [],
                        "delivered_order_count": []
                    });
                }
                else {
                    res.json({
                        status: 200,
                        "message": "Delivered orders Information",
                        "delivered_orders_info": deliveredOrders[0],
                        "delivered_order_count": deliveredOrders[1]
                    });
                }
                dbConn.release();
            });
    });
}

exports.fetchActiveDeliveryPersons = async function(req, res, next) {
    let sql = `CALL FETCH_AVAILABLE_DP()`;
    try {
        const delivery = await pool.query(sql, []);
        res.json({
            "message": "delivery information",
            "delivery": delivery[0]
        });
    }
    catch (err) {
        next(createError(401, err));
    } finally {
        // pool.end();
    }
}

exports.fetchAllDeliveryPersons = async function (req, res, next) {

    let sql = `CALL GET_ALL_DELIVERYPERSONS(?,?,?)`;
    try {
        const delivery = await pool.query(sql, [+req.body.page_number, +req.body.page_size, req.body.filterBy]);
        res.json({
            "message": "delivery information",
            "delivery": delivery[0],
            "delivery_total_count": delivery[1][0]
        });
    }
    catch (err) {
        next(createError(401, err));
    } finally {
        // pool.end();
    }
}

exports.fetchDeliveryRatesAndFeesCityWise = function (req, res) {

    let sql = `CALL FETCH_DeliveryRatesAndFeesCityWise(?,?)`;
    pool.getConnection(function (err, dbConn) {
        dbConn.query(sql, [req.body.city, req.body.state],
            function (err, deliveryRatesAndFees) {
                if (err) {
                    console.log("error: ", err);
                    res.json({
                        "message": "no delivery rates and fees information",
                        "deliveryRatesAndFees": [],
                    });
                }
                else {
                    res.json({
                        "message": "delivery rates and fees information",
                        "deliveryRatesAndFees": deliveryRatesAndFees[0],
                    });
                }
                dbConn.release();
            });
    });
}

exports.addDeliveryAreaCategory = async function (req, res, next) {
    let sql = `CALL ADD_NEW_DeliveryArea_Category(?,?,?,?,?)`;
    let areaId = +req.body.areaId;
    let categoryId = +req.body.store_category_id;
    let status = +req.body.status;
    let category_text = req.body.category_text;
    let category_ranking = req.body.category_ranking;
    try {
        const deliveryAreaCategory = await pool.query(sql, [areaId, categoryId, status,
            category_text, category_ranking]);
            res.json({
                "status": 200,
                "message": "deliveryAreaCategory added",
                "deliveryAreaCategory_id": deliveryAreaCategory[0][0]['inserted_id']
            });
    }
    catch (err) {
        next(createError(401, err));
    } finally {
        // pool.end();
    }
}

exports.addDeliveryAreaBanner = async function (req, res, next) {
    let sql = `CALL ADD_NEW_DeliveryArea_Banner(?,?,?,?)`;
    let areaId = +req.body.areaId;
    let bannerId = +req.body.banner_id;
    let status = +req.body.status;
    let banner_text = req.body.banner_text;

    try {
        const deliveryAreaBanner = await pool.query(sql, [areaId, bannerId, status, banner_text]);
        res.json({
            "status": 200,
            "message": "delivery added",
            "deliveryAreaBanner_id": deliveryAreaBanner[0][0]['inserted_id']
        });
    }
    catch (err) {
        next(createError(401, err));
    } finally {
        // pool.end();
    }
}


exports.addNewDeliveryPerson = async function (req, res, next) {
    let sql = `CALL ADD_NEW_DeliveryPerson(?,?,?,?,?,?)`;

    let deliveryPersonName = req.body.deliveryPersonName;
    let aadharNumber = req.body.aadharNumber;
    let status = +req.body.status;
    let panNumber = req.body.panNumber;
    let phone = +req.body.phone;
    let email = req.body.email;

    try {
        const delivery = await pool.query(sql, [deliveryPersonName, aadharNumber, status,
            panNumber, phone, email]);
        res.json({
            "status": 200,
            "message": "delivery added",
            "delivery_id": delivery[0][0]['delivery_id']
        });
    }
    catch (err) {
        next(createError(401, err));
    } finally {
        // pool.end();
    }
}

exports.updateAreaTiming = async function(req, res, next) {
    const openingTime = req.body.openingtime;
    const closingtime = req.body.closingtime;
    const val1 = openingTime.hour + ':' + openingTime.minute;
    const val2 = closingtime.hour + ':' + closingtime.minute;

    let sql = `CALL Update_Area_Timing(?,?,?)`;

    try {
        const deliveryareaData = await pool.query(sql, [+req.params.areaId, val1, val2]);
        res.json({
            "status": 200,
            "message": "delivery areas information",
            "deliveryareaData": deliveryareaData[0]
        });
    }
    catch (err) {
        next(createError(401, err));
    } finally {
        // pool.end();
    }
    // const updateServicableArea = {
    //     opening_time: val1,
    //     closing_time: val2
    // };
    // let sql = `UPDATE grostep.serviceable_areas SET ? WHERE serviceable_area_id = ?`;
    // try {
    //     const delivery = await pool.query(sql, [updateServicableArea, +req.params.areaId]);
    //     res.json({
    //         status: 200,
    //         "message": "servicable Information updated sucessfully",
    //         "delivery": delivery
    //     });
    // }
    // catch (err) {
    //     next(createError(401, err));
    // } finally {
    //     // pool.end();
    // }
}

exports.updateDeliveryPerson = async function (req, res, next) {
    const updateDeliveryPerson = req.body;
    let sql = `UPDATE grostep.deliveryperson SET ? WHERE delivery_person_id = ?`;
    try {
        const delivery = await pool.query(sql, [updateDeliveryPerson, +req.params.deliveryPersonId]);
        res.json({
            status: 200,
            "message": "delivery Information updated",
            "delivery": delivery
        });
    }
    catch (err) {
        next(createError(401, err));
    } finally {
        // pool.end();
    }
}

exports.fetchDeliveryPersonInfoById = async function (req, res, next) {

    let sql = `SELECT * FROM deliveryperson WHERE delivery_person_id = ?`;
    try {
        const deliveryPersonData = await pool.query(sql, [req.params.deliveryPersonId]);
        res.json({
            status: 200,
            "message": "Delivery Person Information",
            "deliveryPersonData": deliveryPersonData[0]
        });
    }
    catch (err) {
        next(createError(401, err));
    } finally {
        // pool.end();
    }
}

exports.fetchAllDeliveryAreas = async function (req, res, next) {
    let sql = `CALL GET_ALL_DELIVERYAREAS(?,?,?)`;

    try {
        const deliveryareas = await pool.query(sql, [+req.body.page_number, +req.body.page_size, req.body.filterBy]);
        res.json({
            "message": "delivery areas information",
            "deliveryareas": deliveryareas[0],
            "deliveryareas_total_count": deliveryareas[1][0]
        });
    }
    catch (err) {
        next(createError(401, err));
    } finally {
        // pool.end();
    }
}

exports.fetchDeliveryAreaInfoById = async function (req, res, next) {

    let sql = `SELECT * FROM serviceable_areas WHERE serviceable_area_id = ?`;

    try {
        const deliveryAreaData = await pool.query(sql, [req.params.areaId]);
        res.json({
            status: 200,
            "message": "delivery Area Information",
            "deliveryArea": deliveryAreaData[0]
        });
    }
    catch (err) {
        next(createError(401, err));
    } finally {
        // pool.end();
    }
}

exports.searchCategoryByName = async function (req, res, next) {
    let sql = `select mc.store_category_id,mc.store_category_name,mc.image_url from main_categories mc 
                where LOWER(mc.store_category_name) 
                LIKE CONCAT('%', ?, '%') and mc.status = 1;`;

    try {
        const categoryData = await pool.query(sql, [req.params.queryString.toLowerCase()]);
        res.json({
            status: 200,
            "message": "delivery categoryData Information",
            "categoryData": categoryData
        });
    }
    catch (err) {
        next(createError(401, err));
    } finally {
        // pool.end();
    }
}

exports.searchBannerByName = async function (req, res, next) {

    let sql = `select bi.banner_id,bi.banner_name,bi.image_url from banner_info bi 
                where banner_name LIKE CONCAT('%', ?, '%') and bi.status = 1;`;

    try {
        const bannerData = await pool.query(sql, [req.params.queryString]);
        res.json({
            status: 200,
            "message": "delivery bannerData Information",
            "bannerData": bannerData
        });
    }
    catch (err) {
        next(createError(401, err));
    } finally {
        // pool.end();
    }
}

exports.fetchAllDeliveryAreaCategoriesByAreaId = async function (req, res, next) {

    let sql = `select sac.id,sac.serviceable_area_id,sac.store_category_id,sac.last_updated,sac.category_text,sac.status,
                sac.category_ranking,
                mc.store_category_name,mc.image_url,
                sa.city,sa.state,sa.country,sa.city_alternate_name
                from servicable_area_categories sac 
                left join main_categories mc on sac.store_category_id = mc.store_category_id
                left join grostep.serviceable_areas sa on sac.serviceable_area_id = sa.serviceable_area_id 
                where sac.serviceable_area_id = ?`;

    try {
        const categoryData = await pool.query(sql, [+req.body.areaId]);
        res.json({
            status: 200,
            "message": "delivery categoryData Information",
            "categoryData": categoryData
        });
    }
    catch (err) {
        next(createError(401, err));
    } finally {
        // pool.end();
    }
}

exports.fetchAllDeliveryAreaBannersByAreaId = async function (req, res, next) {
    let sql = `select sab.id,sab.serviceable_area_id,sab.banner_id,sab.last_updated,sab.banner_text,
                sab.status,sa.city,sa.state,sa.country,sa.city_alternate_name,bi.banner_name,bi.image_url 
                from servicable_area_banners sab 
                left join grostep.serviceable_areas sa on sab.serviceable_area_id = sa.serviceable_area_id left join banner_info bi 
                on sab.banner_id = bi.banner_id where sab.serviceable_area_id = ?`;
    try {
        const bannerData = await pool.query(sql, [req.body.areaId]);
        res.json({
            status: 200,
            "message": "bannerData Information",
            "bannerData": bannerData
        });
    }
    catch (err) {
        next(createError(401, err));
    } finally {
        // pool.end();
    }
}

exports.editDeliveryAreaCategory = async function (req, res, next) {
    const categoryInfo = req.body;
    let sql = `UPDATE grostep.servicable_area_categories SET ? WHERE id = ?`;

    try {
        const updatedDeliveryAreaCategory = await pool.query(sql, [categoryInfo, +req.params.id]);
        res.json({
            status: 200,
            "message": "updatedDeliveryAreaCategory Information updated",
            "updatedDeliveryAreaCategory": updatedDeliveryAreaCategory
        });
    }
    catch (err) {
        next(createError(401, err));
    } finally {
        // pool.end();
    }
}

exports.editDeliveryAreaBanner = async function (req, res, next) {
    const ProductInfo = req.body;
    let sql = `UPDATE grostep.servicable_area_banners SET ? WHERE id = ?`;

    try {
        const updatedDeliveryAreaBanner = await pool.query(sql, [ProductInfo, +req.params.id]);
        res.json({
            status: 200,
            "message": "DeliveryAreaBanner Information updated",
            "coupon": updatedDeliveryAreaBanner
        });
    }
    catch (err) {
        next(createError(401, err));
    } finally {
        // pool.end();
    }
}

exports.fetchAllDeliveryAreaCategoriesById = async function (req, res, next) {

    let sql = `select sac.id,sac.serviceable_area_id,sac.store_category_id,sac.last_updated,sac.category_text,sac.status,
                sac.category_ranking,
                mc.store_category_name,mc.image_url,
                sa.city,sa.state,sa.country,sa.city_alternate_name
                from servicable_area_categories sac 
                left join main_categories mc on sac.store_category_id = mc.store_category_id
                left join grostep.serviceable_areas sa on sac.serviceable_area_id = sa.serviceable_area_id where sac.id = ?`;

    try {
        const categoryData = await pool.query(sql, [req.params.categoryId]);
        res.json({
            status: 200,
            "message": "delivery categoryData Information",
            "categoryData": categoryData
        });
    }
    catch (err) {
        next(createError(401, err));
    } finally {
        // pool.end();
    }
}

exports.fetchAllDeliveryAreaBannersById = async function (req, res, next) {

    let sql = `select sab.serviceable_area_id,sab.banner_id,sab.last_updated,sab.banner_text,sab.status,
                sa.city,sa.state,sa.country,sa.city_alternate_name,bi.banner_name,bi.image_url from servicable_area_banners 
                sab left join grostep.serviceable_areas sa on sab.serviceable_area_id = sa.serviceable_area_id 
                left join banner_info bi on sab.banner_id = bi.banner_id where sab.id = ?`;

    try {
        const bannerData = await pool.query(sql, [+req.params.bannerId]);
        res.json({
            status: 200,
            "message": "delivery bannerData Information",
            "bannerData": bannerData
        });
    }
    catch (err) {
        next(createError(401, err));
    } finally {
        // pool.end();
    }
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
                if (deliveryPerson[0].length > 0) {
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


exports.updateOrderStatusByDeliveryPerson = function (req, res) {

    let sql = `CALL UPDATE_ORDERSTATUS_BY_DELIVERYPERSON(?,?,?,?,?,?,?)`;

    pool.getConnection(function (err, dbConn) {
        dbConn.query(sql, [
            +req.body.deliverypersonid,
            +req.params.orderId,
            +req.body.status,
            +req.body.order_delivery_person_status,
            +req.body.bill_amount,
            +req.body.bill_number,
            +req.body.is_order_editable],
            function (err, orderData) {
                if (err) {
                    console.log("error: ", err);
                    res.json({
                        status: 400,
                        "message": "order information not found",
                    });
                }
                else {
                    let customer_token = orderData[0][0]['customer_token'];
                    let store_token = orderData[0][0]['store_token'];
                    let registrationTokens = [];
                    let messageTitle = '';
                    let messageBody = '';

                    if (req.body.order_delivery_person_status == 2 && orderData[0][0]['order_status'] != 12) {
                        registrationTokens.push(customer_token);
                        registrationTokens.push(store_token);
                        messageTitle = 'Delivery Person assigned';
                        messageBody = `Hello ,Mr. ${orderData[0][0]['delivery_person_name']} having rating ${orderData[0][0]['rating']} have been sucessfully assigned for the order # ${orderData[0][0]['order_id']}.`;
                        sendNotification(registrationTokens, messageTitle, messageBody, orderData[0][0]['order_id'], orderData[0][0]['order_status'], res);
                    } else if (req.body.order_delivery_person_status == 3 && orderData[0][0]['order_status'] != 12) {
                        registrationTokens.push(customer_token); registrationTokens.push(store_token);
                        messageTitle = 'Delivery Person reached store and will start picking items';
                        messageBody = `Hello ,Mr. ${orderData[0][0]['delivery_person_name']} having rating ${orderData[0][0]['rating']} reached store and will start picking items for the order # ${orderData[0][0]['order_id']}.`;
                        sendNotification(registrationTokens, messageTitle, messageBody, orderData[0][0]['order_id'], orderData[0][0]['order_status'], res);
                    } else if (req.body.order_delivery_person_status == 5 && orderData[0][0]['order_status'] != 12) {
                        registrationTokens.push(customer_token);
                        messageTitle = 'Delivery Person picked the items';
                        messageBody = `Hello ,Mr. ${orderData[0][0]['delivery_person_name']} having rating ${orderData[0][0]['rating']} picked for the order # ${orderData[0][0]['order_id']}.`;
                        sendNotification(registrationTokens, messageTitle, messageBody, orderData[0][0]['order_id'], orderData[0][0]['order_status'], res);
                    } else if (req.body.order_delivery_person_status == 4 && orderData[0][0]['order_status'] != 12) {
                        registrationTokens.push(customer_token);
                        messageTitle = 'Waiting for bill confirmation';
                        messageBody = `Hello ,Mr. ${orderData[0][0]['delivery_person_name']} having rating ${orderData[0][0]['rating']} waiting for bill confirmation for the order # ${orderData[0][0]['order_id']}.`;
                        sendNotification(registrationTokens, messageTitle, messageBody, orderData[0][0]['order_id'], orderData[0][0]['order_status'], res);
                    } else if (req.body.order_delivery_person_status == 6 && orderData[0][0]['order_status'] != 12) {
                        registrationTokens.push(customer_token);
                        messageTitle = 'Delivery Person is on the way to deliver';
                        messageBody = `Hello ,Mr. ${orderData[0][0]['delivery_person_name']} having rating ${orderData[0][0]['rating']} is on the way to deliver the order # ${orderData[0][0]['order_id']}.`;
                        sendNotification(registrationTokens, messageTitle, messageBody, orderData[0][0]['order_id'], orderData[0][0]['order_status'], res);
                    } else if (req.body.order_delivery_person_status == 7 && orderData[0][0]['order_status'] != 12) {
                        registrationTokens.push(customer_token);
                        messageTitle = 'Order Successfully delivered';
                        messageBody = `Hello ,Mr. ${orderData[0][0]['delivery_person_name']} having rating ${orderData[0][0]['rating']} have sucessfully delivered the order # ${orderData[0][0]['order_id']}.`;
                        sendNotification(registrationTokens, messageTitle, messageBody, orderData[0][0]['order_id'], orderData[0][0]['order_status'], res);
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

function filter_token_array(test_array) {
    console.log(test_array);
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
    console.log(result);
    return result;
}

function sendNotification(registrationTokens, messageTitle, messageBody, order_id, order_status, res) {
    console.log(registrationTokens);
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
    if (filter_token_array(registrationTokens).length > 0) {
        admin.messaging().sendToDevice(filter_token_array(registrationTokens), payload, options)
            .then(function (response) {
                console.log("Successfully sent message:", response);
            })
            .catch(function (error) {
                console.log("Error sending message:", error);
            });
    }
    res.json({
        status: 200,
        "message": "order Information updated",
        "order": order_id,
        "order_status": order_status
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


exports.loginDeliveryPerson = function (req, res) {
    let sql = `CALL REGISTER_DELIVERYPERSON(?,?,?)`;
    const otp_number = Math.floor(1000 + Math.random() * 9000);
    let msgid = '';
    // console.log(req.body);
    pool.getConnection(function (err, dbConn) {
        dbConn.query(sql, [req.body.phone, otp_number, req.body.token], function (err, deliveryPersonData) {
            if (err) {
                res.json({
                    "status": 400,
                    "message": "delivery person not registred",
                    "phone": 0,
                    "delivery_person_id": 0
                });
            }
            else {
                if (deliveryPersonData[0].length > 0) {
                    let msg = `Hello Sir your generated otp is :${otp_number}`;
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
                        "phone": deliveryPersonData[0][0].phone,
                        "delivery_person_id": deliveryPersonData[0][0].delivery_person_id
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


exports.resendOTP = function (req, res) {
    let sql = `CALL RESEND_DELIVERYPERSON_OTP(?,?)`;
    const otp_number = Math.floor(1000 + Math.random() * 9000);
    let msgid = '';
    pool.getConnection(function (err, dbConn) {
        dbConn.query(sql, [+req.params.deliveryPersonId, otp_number],
            function (err, deliveryPersonInfo) {
                if (err) {
                    console.log("error: ", err);
                    res.json({
                        "status": 400,
                        "message": "delivery person not created",
                        "phone": 0,
                        "delivery_person_id": 0,
                        "msgid": ''
                    });
                }
                else {
                    let msg = `Hello Sir your generated otp is :${otp_number}`;
                    var str = '';
                    let phone = deliveryPersonInfo[0][0].phone;
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
                            console.log('hi');
                            console.log(JSON.parse(str)[1]['msgid']);
                            // return str;
                            return res.json({
                                "status": 200,
                                "message": "Delivery person created",
                                "phone": deliveryPersonInfo[0][0].phone,
                                "msgid": JSON.parse(str)[1]['msgid'],
                                "delivery_person_id": deliveryPersonInfo[0][0].delivery_person_id
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