var mysql = require('mysql');
var jwt = require('jsonwebtoken');
var rp = require('request-promise');
var admin = require("firebase-admin");

var pool = mysql.createPool({
    connectionLimit: 10,
    host: 'grostep-database.c8zeozlsfjcx.ap-south-1.rds.amazonaws.com',
    user: 'root',
    password: process.env.dbpassword,
    database: 'grostep'
});

exports.fetchAllNewOrders = function (req, res) {
    pool.getConnection(function (err, dbConn) {
        dbConn.query("SELECT o.order_id,o.total_amount,o.delivery_fee,o.discount_amount,o.payable_amount,o.status AS 'order_current_status',o.total_item_count,o.deliver_now,o.delivery_date,o.delivery_slot,o.instructions,o.order_deliveryperson_status,cda.customer_name,cda.phone AS 'customer_phone_number',cda.flatNumber AS 'customer_flatNumber',cda.landmark AS 'customer_landmark',cda.longitude AS 'customer_longitude',cda.latitude AS 'customer_latitude',cda.pincode AS 'customer_pincode',cda.city AS 'customer_city',cda.state AS 'customer_state',cda.country AS 'customer_country',cda.address AS 'customer_address',cda.address2 AS 'customer_address2',s.store_name,s.phone_number AS 'store_phone_number', s.alternative_number AS 'store_alternative_number',s.address AS 'store_address',s.state AS 'store_state',s.city AS 'store_city',s.country AS 'store_country', s.pin_code As 'store_pincode',s.latitude AS 'store_latitude', s.longitude AS 'store_longitude',pm.payment_method_name FROM grostep.orders o inner join stores s on o.store_id = s.store_id inner join payment_method pm on o.payment_mode = pm.payment_method_id inner join grostep.customer_delivery_address cda on o.delivery_address_id = cda.delivery_address_id where o.delivery_person_id = 0 and o.order_deliveryperson_status = 1 and o.order_merchant_status = 2", function (err, orders) {
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

exports.fetchAllRunningOrders = function (req, res) {
    pool.getConnection(function (err, dbConn) {
        dbConn.query("SELECT o.order_id,o.total_amount,o.delivery_fee,o.discount_amount,o.payable_amount,o.status AS 'order_current_status',o.total_item_count,o.deliver_now,o.delivery_date,o.delivery_slot,o.instructions,o.order_deliveryperson_status,cda.customer_name,cda.phone AS 'customer_phone_number',cda.flatNumber AS 'customer_flatNumber',cda.landmark AS 'customer_landmark',cda.longitude AS 'customer_longitude',cda.latitude AS 'customer_latitude',cda.pincode AS 'customer_pincode',cda.city AS 'customer_city',cda.state AS 'customer_state',cda.country AS 'customer_country',cda.address AS 'customer_address',cda.address2 AS 'customer_address2',s.store_name,s.phone_number AS 'store_phone_number', s.alternative_number AS 'store_alternative_number',s.address AS 'store_address',s.state AS 'store_state',s.city AS 'store_city',s.country AS 'store_country', s.pin_code As 'store_pincode',s.latitude AS 'store_latitude', s.longitude AS 'store_longitude',pm.payment_method_name FROM grostep.orders o inner join stores s on o.store_id = s.store_id inner join payment_method pm on o.payment_mode = pm.payment_method_id inner join grostep.customer_delivery_address cda on o.delivery_address_id = cda.delivery_address_id where o.delivery_person_id  = ? and o.order_deliveryperson_status BETWEEN 2 AND 6 ",req.params.deliveryPersonId, function (err, runningorders) {
            if (err) {
                res.json({
                    status: 400,
                    "message": "running orders Information not found",
                    "neworders": []
                });
            }
            else {
                res.json({
                    status: 200,
                    "message": "running orders Information",
                    "runningorders": runningorders
                });
            }
            dbConn.release();
        });
    });
}

exports.fetchRunningStatusByOrderId = function (req, res) {
    pool.getConnection(function (err, dbConn) {
        dbConn.query("SELECT o.order_id,o.order_merchant_status,o.total_amount,o.delivery_fee,o.discount_amount,o.payable_amount,o.status AS 'order_current_status',o.total_item_count,o.deliver_now,o.delivery_date,o.delivery_slot,o.instructions,o.order_deliveryperson_status,cda.customer_name,cda.phone AS 'customer_phone_number',cda.flatNumber AS 'customer_flatNumber',cda.landmark AS 'customer_landmark',cda.longitude AS 'customer_longitude',cda.latitude AS 'customer_latitude',cda.pincode AS 'customer_pincode',cda.city AS 'customer_city',cda.state AS 'customer_state',cda.country AS 'customer_country',cda.address AS 'customer_address',cda.address2 AS 'customer_address2',s.store_name,s.phone_number AS 'store_phone_number', s.alternative_number AS 'store_alternative_number',s.address AS 'store_address',s.state AS 'store_state',s.city AS 'store_city',s.country AS 'store_country', s.pin_code As 'store_pincode',s.latitude AS 'store_latitude', s.longitude AS 'store_longitude',pm.payment_method_name FROM grostep.orders o inner join stores s on o.store_id = s.store_id inner join payment_method pm on o.payment_mode = pm.payment_method_id inner join grostep.customer_delivery_address cda on o.delivery_address_id = cda.delivery_address_id where o.delivery_person_id  = ? and o.order_id = ?  ",[req.body.deliverypersonid, req.body.orderId], function (err, orderdata) {
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
    pool.getConnection(function (err, dbConn) {
        dbConn.query("SELECT o.order_id,o.total_amount,o.delivery_fee,o.discount_amount,o.payable_amount,o.status AS 'order_current_status',o.total_item_count,o.deliver_now,o.delivery_date,o.delivery_slot,o.instructions,o.order_deliveryperson_status,cda.customer_name,cda.phone AS 'customer_phone_number',cda.flatNumber AS 'customer_flatNumber',cda.landmark AS 'customer_landmark',cda.longitude AS 'customer_longitude',cda.latitude AS 'customer_latitude',cda.pincode AS 'customer_pincode',cda.city AS 'customer_city',cda.state AS 'customer_state',cda.country AS 'customer_country',cda.address AS 'customer_address',cda.address2 AS 'customer_address2',s.store_name,s.phone_number AS 'store_phone_number', s.alternative_number AS 'store_alternative_number',s.address AS 'store_address',s.state AS 'store_state',s.city AS 'store_city',s.country AS 'store_country', s.pin_code As 'store_pincode',s.latitude AS 'store_latitude', s.longitude AS 'store_longitude',pm.payment_method_name FROM grostep.orders o inner join stores s on o.store_id = s.store_id inner join payment_method pm on o.payment_mode = pm.payment_method_id inner join grostep.customer_delivery_address cda on o.delivery_address_id = cda.delivery_address_id where o.delivery_person_id  = ? and o.order_deliveryperson_status = 7 ",req.params.deliveryPersonId, function (err, deliveredorders) {
            if (err) {
                res.json({
                    status: 400,
                    "message": "delivered orders Information not found",
                    "neworders": []
                });
            }
            else {
                res.json({
                    status: 200,
                    "message": "delivered orders Information",
                    "deliveredorders": deliveredorders
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

exports.addDeliveryAreaCategory = function (req, res) {
    let sql = `CALL ADD_NEW_DeliveryArea_Category(?,?,?,?,?)`;

    let areaId = +req.body.areaId;
    let categoryId = +req.body.store_category_id;
    let status = +req.body.status;
    let category_text = req.body.category_text;
    let category_ranking = req.body.category_ranking;
    pool.getConnection(function (err, dbConn) {
        dbConn.query(sql, [areaId, categoryId, status,
            category_text,category_ranking],
            function (err, deliveryAreaCategory) {
                if (err) {
                    console.log("error: ", err);
                    res.json({
                        "message": "deliveryAreaCategory not added",
                        "status": 400,
                        "deliveryAreaCategory_id": 0
                    });
                }
                else {
                    console.log(JSON.stringify(deliveryAreaCategory));
                    res.json({
                        "status": 200,
                        "message": "deliveryAreaCategory added",
                        "deliveryAreaCategory_id": deliveryAreaCategory[0][0]['inserted_id']
                    });
                }
                dbConn.release();
            });
    });
}

exports.addDeliveryAreaBanner = function (req, res) {
    let sql = `CALL ADD_NEW_DeliveryArea_Banner(?,?,?,?)`;

    let areaId = +req.body.areaId;
    let bannerId = +req.body.banner_id;
    let status = +req.body.status;
    let banner_text = req.body.banner_text;
    pool.getConnection(function (err, dbConn) {
        dbConn.query(sql, [areaId, bannerId, status,
            banner_text],
            function (err, deliveryAreaBanner) {
                if (err) {
                    console.log("error: ", err);
                    res.json({
                        "message": "deliveryAreaBanner not added",
                        "status": 400,
                        "deliveryAreaBanner_id": 0
                    });
                }
                else {
                    console.log(JSON.stringify(deliveryAreaBanner));
                    res.json({
                        "status": 200,
                        "message": "delivery added",
                        "deliveryAreaBanner_id": deliveryAreaBanner[0][0]['inserted_id']
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

exports.fetchAllDeliveryAreas = function(req,res) {
    let sql = `CALL GET_ALL_DELIVERYAREAS(?,?,?)`;
    pool.getConnection(function (err, dbConn) {
        if (err) {
            console.error(err);
        } else {
            dbConn.query(sql, [+req.body.page_number, +req.body.page_size, req.body.filterBy],
                function (err, deliveryareas) {
                    if (err) {
                        console.log("error: ", err);
                    }
                    else {
                        res.json({
                            "message": "delivery areas information",
                            "deliveryareas": deliveryareas[0],
                            "deliveryareas_total_count": deliveryareas[1][0]
                        });
                    }
                    dbConn.release();
                });
        }
    });
}

exports.fetchDeliveryAreaInfoById = function (req, res) {
    pool.getConnection(function (err, dbConn) {
        dbConn.query("SELECT * FROM serviceable_areas WHERE serviceable_area_id = ? ", req.params.areaId, function (err, deliveryAreaData) {
            if (err) {
                res.json({
                    status: 400,
                    "message": "delivery Area Information not found",
                    "deliveryArea": []
                });
            }
            else {
                res.json({
                    status: 200,
                    "message": "delivery Area Information",
                    "deliveryArea": deliveryAreaData[0]
                });
            }
            dbConn.release();
        });
    });
}

exports.searchCategoryByName = function(req,res) {
    pool.getConnection(function (err, dbConn) {
        dbConn.query(`select mc.store_category_id,mc.store_category_name,mc.image_url from main_categories mc 
                        where LOWER(mc.store_category_name) 
                        LIKE CONCAT('%', ?, '%') and mc.status = 1;`, req.params.queryString.toLowerCase(), function (err, categoryData) {
            if (err) {
                res.json({
                    status: 400,
                    "message": "delivery Area categoryData not found",
                    "categoryData": []
                });
            }
            else {
                res.json({
                    status: 200,
                    "message": "delivery categoryData Information",
                    "categoryData": categoryData
                });
            }
            dbConn.release();
        });
    });
}

exports.searchBannerByName = function(req,res) {
    pool.getConnection(function (err, dbConn) {
        dbConn.query("select bi.banner_id,bi.banner_name,bi.image_url from banner_info bi where banner_name LIKE CONCAT('%', ?, '%') and bi.status = 1;", req.params.queryString, function (err, bannerData) {
            if (err) {
                res.json({
                    status: 400,
                    "message": "delivery Area bannerData not found",
                    "bannerData": []
                });
            }
            else {
                res.json({
                    status: 200,
                    "message": "delivery bannerData Information",
                    "bannerData": bannerData
                });
            }
            dbConn.release();
        });
    });
}

exports.fetchAllDeliveryAreaCategoriesByAreaId = function (req, res) {
    pool.getConnection(function (err, dbConn) {
        dbConn.query(`select sac.id,sac.serviceable_area_id,sac.store_category_id,sac.last_updated,sac.category_text,sac.status,
        sac.category_ranking,
        mc.store_category_name,mc.image_url,
        sa.city,sa.state,sa.country,sa.city_alternate_name
        from servicable_area_categories sac 
        left join main_categories mc on sac.store_category_id = mc.store_category_id
        left join grostep.serviceable_areas sa on sac.serviceable_area_id = sa.serviceable_area_id where sac.serviceable_area_id = ?`, req.body.areaId, function (err, categoryData) {
            if (err) {
                res.json({
                    status: 400,
                    "message": "delivery Area bannerData not found",
                    "categoryData": []
                });
            }
            else {
                res.json({
                    status: 200,
                    "message": "delivery categoryData Information",
                    "categoryData": categoryData
                });
            }
            dbConn.release();
        });
    });
}

exports.fetchAllDeliveryAreaBannersByAreaId = function (req, res) {
    pool.getConnection(function (err, dbConn) {
        dbConn.query("select sab.id,sab.serviceable_area_id,sab.banner_id,sab.last_updated,sab.banner_text,sab.status,sa.city,sa.state,sa.country,sa.city_alternate_name,bi.banner_name,bi.image_url from servicable_area_banners sab left join grostep.serviceable_areas sa on sab.serviceable_area_id = sa.serviceable_area_id left join banner_info bi on sab.banner_id = bi.banner_id where sab.serviceable_area_id = ?", req.body.areaId, function (err, bannerData) {
            if (err) {
                res.json({
                    status: 400,
                    "message": "delivery Area bannerData not found",
                    "bannerData": []
                });
            }
            else {
                res.json({
                    status: 200,
                    "message": "delivery bannerData Information",
                    "bannerData": bannerData
                });
            }
            dbConn.release();
        });
    });
}

exports.editDeliveryAreaCategory = function(req,res) {
    const categoryInfo = req.body;
    pool.getConnection(function (err, dbConn) {
        dbConn.query("UPDATE grostep.servicable_area_categories SET ? WHERE id = ?",
            [categoryInfo, +req.params.id], function (err, updatedDeliveryAreaCategory) {
                if (err) {
                    console.log("error: ", err);
                    res.json({
                        status: 400,
                        "message": "updatedDeliveryAreaCategory not updated",
                        "updatedDeliveryAreaCategory": []
                    });

                }
                else {
                    res.json({
                        status: 200,
                        "message": "updatedDeliveryAreaCategory Information updated",
                        "updatedDeliveryAreaCategory": updatedDeliveryAreaCategory
                    });
                }
                dbConn.release();
            });
    });
}

exports.editDeliveryAreaBanner = function(req,res) {
    const ProductInfo = req.body;
    pool.getConnection(function (err, dbConn) {
        dbConn.query("UPDATE grostep.servicable_area_banners SET ? WHERE id = ?",
            [ProductInfo, +req.params.id], function (err, updatedDeliveryAreaBanner) {
                if (err) {
                    console.log("error: ", err);
                    res.json({
                        status: 400,
                        "message": "DeliveryAreaBanner not updated",
                        "coupon": []
                    });

                }
                else {
                    res.json({
                        status: 200,
                        "message": "DeliveryAreaBanner Information updated",
                        "coupon": updatedDeliveryAreaBanner
                    });
                }
                dbConn.release();
            });
    });
}

exports.fetchAllDeliveryAreaCategoriesById = function(req,res) {
    console.log('Hi');
    pool.getConnection(function (err, dbConn) {
        dbConn.query(`select sac.id,sac.serviceable_area_id,sac.store_category_id,sac.last_updated,sac.category_text,sac.status,
                        sac.category_ranking,
                        mc.store_category_name,mc.image_url,
                        sa.city,sa.state,sa.country,sa.city_alternate_name
                        from servicable_area_categories sac 
                        left join main_categories mc on sac.store_category_id = mc.store_category_id
                        left join grostep.serviceable_areas sa on sac.serviceable_area_id = sa.serviceable_area_id where sac.id = ?`,
                        req.params.categoryId, 
                      function (err, categoryData) {
            if (err) {
                res.json({
                    status: 400,
                    "message": "delivery Area categoryData not found",
                    "categoryData": []
                });
            }
            else {
                res.json({
                    status: 200,
                    "message": "delivery categoryData Information",
                    "categoryData": categoryData
                });
            }
            dbConn.release();
        });
    });
}

exports.fetchAllDeliveryAreaBannersById = function (req, res) {
    pool.getConnection(function (err, dbConn) {
        dbConn.query(`select sab.serviceable_area_id,sab.banner_id,sab.last_updated,sab.banner_text,sab.status,
                      sa.city,sa.state,sa.country,sa.city_alternate_name,bi.banner_name,bi.image_url from servicable_area_banners 
                      sab left join grostep.serviceable_areas sa on sab.serviceable_area_id = sa.serviceable_area_id 
                      left join banner_info bi on sab.banner_id = bi.banner_id where sab.id = ?`, req.params.bannerId, 
                      function (err, bannerData) {
            if (err) {
                res.json({
                    status: 400,
                    "message": "delivery Area bannerData not found",
                    "bannerData": []
                });
            }
            else {
                res.json({
                    status: 200,
                    "message": "delivery bannerData Information",
                    "bannerData": bannerData
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

    let sql = `CALL UPDATE_ORDERSTATUS_BY_DELIVERYPERSON(?,?,?,?)`;

    pool.getConnection(function (err, dbConn) {
        dbConn.query(sql, [+req.body.deliverypersonid, +req.params.orderId, req.body.status, req.body.order_delivery_person_status],
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

                    if(req.body.order_delivery_person_status == 2) {
                        registrationTokens.push(customer_token);
                        registrationTokens.push(store_token);
                        messageTitle = 'Delivery Person assigned';
                        messageBody = `Hello ,Mr. ${orderData[0][0]['delivery_person_name']} having rating ${orderData[0][0]['rating']} have been sucessfully assigned for the order # ${orderData[0][0]['order_id']}.`;
                    } else if(req.body.order_delivery_person_status == 3) {
                        registrationTokens.push(customer_token); registrationTokens.push(store_token);
                        messageTitle = 'Delivery Person reached store and will start picking items';
                        messageBody = `Hello ,Mr. ${orderData[0][0]['delivery_person_name']} having rating ${orderData[0][0]['rating']} reached store and will start picking items for the order # ${orderData[0][0]['order_id']}.`;
                    } else if(req.body.order_delivery_person_status == 5) {
                        registrationTokens.push(customer_token);
                        messageTitle = 'Delivery Person picked the items';
                        messageBody = `Hello ,Mr. ${orderData[0][0]['delivery_person_name']} having rating ${orderData[0][0]['rating']} picked for the order # ${orderData[0][0]['order_id']}.`;
                    } else if(req.body.order_delivery_person_status == 4) {
                        registrationTokens.push(customer_token);
                        messageTitle = 'Waiting for bill confirmation';
                        messageBody = `Hello ,Mr. ${orderData[0][0]['delivery_person_name']} having rating ${orderData[0][0]['rating']} waiting for bill confirmation for the order # ${orderData[0][0]['order_id']}.`;
                    } else if(req.body.order_delivery_person_status == 6) {
                        registrationTokens.push(customer_token);
                        messageTitle = 'Delivery Person is on the way to deliver';
                        messageBody = `Hello ,Mr. ${orderData[0][0]['delivery_person_name']} having rating ${orderData[0][0]['rating']} reached store and will start picking items for the order # ${orderData[0][0]['order_id']}.`;
                    } else if(req.body.order_delivery_person_status == 7) {
                        registrationTokens.push(customer_token);
                        messageTitle = 'Order Successfully delivered';
                        messageBody = `Hello ,Mr. ${orderData[0][0]['delivery_person_name']} having rating ${orderData[0][0]['rating']} have sucessfully delivered the order # ${orderData[0][0]['order_id']}.`;
                    }

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

function sendToken(item, res) {
    var token = jwt.sign(item.delivery_person_id, "123");
    res.json({
        "status": 200,
        "message": "delivery person Details",
        "token": token,
        "deliveryPersonData": item
    });
}