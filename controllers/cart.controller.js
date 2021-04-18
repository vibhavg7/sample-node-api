var mysql = require('mysql');
var jwt = require('jsonwebtoken');
var rp = require('request-promise');
var async = require("async");
var moment = require('moment');
var pool = mysql.createPool({
    connectionLimit: 10,
    host: 'grostep-database.c8zeozlsfjcx.ap-south-1.rds.amazonaws.com',
    user: 'root',
    password: process.env.dbpassword,
    database: 'grostep'
});


exports.updateProductToCart = function (req, res) {

}

exports.fetchCustomerCart = function (req, res) {
    let sql = `CALL FETCH_CUSTOMER_CART(?)`;
    let customer_id = +req.query.customerId;
    pool.getConnection(function (err, dbConn) {
        dbConn.query(sql, [customer_id],
            function (err, customerCart) {
                if (err) {
                    console.log("error: ", err);
                    res.json({
                        "status": 400,
                        "message": "Unable to fetch customer cart",
                        "product_id": 0
                    })
                }
                else {

                    let cartProducts = [];

                    customerCart[0].forEach(cartInfo => {
                        let obj = {};
                        obj.cart_item_id = cartInfo.cart_item_id;
                        obj.product_mapping_id = cartInfo.product_mapping_id;
                        obj.quantity_purchased = cartInfo.quantity_purchased;
                        obj.product_id = cartInfo.product_id;
                        obj.store_selling_price = cartInfo.store_selling_price;
                        obj.stock = cartInfo.stock;
                        obj.product_marked_price = cartInfo.product_marked_price;
                        obj.store_product_caping = cartInfo.store_product_caping;
                        obj.store_product_status = cartInfo.store_product_status;
                        obj.product_discount = cartInfo.store_discount;
                        obj.product_name = cartInfo.product_name;
                        obj.product_weight = cartInfo.product_weight;
                        obj.weight_text = cartInfo.weight_text;
                        cartProducts.push(obj);
                    });

                    res.json({
                        "status": 200,
                        "store_name": customerCart[0][0].store_name,
                        "cart_id": customerCart[0][0].cart_id,
                        "customer_id": customerCart[0][0].customer_id,
                        "instructions": customerCart[0][0].instructions,
                        "cart_added_date": customerCart[0][0].added_date,
                        "cart_last_updated": customerCart[0][0].last_updated,
                        "cart_status": customerCart[0][0].status,
                        "store_opening_time": customerCart[0][0].store_opening_time,
                        "store_opening_time_clock": customerCart[0][0].store_opening_time_clock,
                        "store_closing_time": customerCart[0][0].store_closing_time,
                        "store_closing_time_clock": customerCart[0][0].store_closing_time_clock,
                        "store_closing_status": customerCart[0][0].closed,
                        "store_status": customerCart[0][0].store_status,
                        "customer_name": customerCart[0][0].customer_name,
                        "customer_phone_number": customerCart[0][0].customer_phone_number,
                        'cart_product_info': cartProducts,
                        "message": "customer cart detail"
                    });
                }
                dbConn.release();
            });
    });
}

exports.deleteCustomerCart = function (req, res) {
    pool.getConnection(function (err, dbConn) {
        dbConn.query("DELETE customer_cart , customer_cart_items FROM customer_cart  LEFT JOIN customer_cart_items  ON customer_cart.cart_id= customer_cart_items.shopping_cart_id WHERE customer_cart.customer_id = ?; ", req.params.customerId,
            function (err, customerCartData) {
                if (err) {
                    console.log("error: ", err);
                }
                else {
                    let deleted = false;
                    if (customerCartData.affectedRows == 1) {
                        deleted = true;
                    }
                    res.json({
                        "message": (deleted) ? "customer cart deleted successfully" : "invalid customer id",
                        "status": (deleted) ? 200 : 400,
                        "customer_id": req.params.customerId
                    });
                }
                dbConn.release();
            });
    });
}


exports.deleteProductFromCustomerCart = function (req, res) {
    let sql = `CALL DELETE_PRODUCT_CUSTOMER_CART(?,?,?)`;
    pool.getConnection(function (err, dbConn) {
        dbConn.query(sql, [+req.params.customerId, +req.body.productId, req.body.cartId],
            function (err, customerCartData) {
                if (err) {
                    console.log("error: ", err);
                }
                else {
                    res.json({
                        "message": "customer cart information",
                        "status": 200,
                        "customerCartData": customerCartData[0],
                        "customer_cart_total_products_count": customerCartData[1][0]
                    });
                }
                dbConn.release();
            });
    });
}

exports.validateStoreCartProducts = function (req, res) {
    let cartData = [...req.body.cartData];
    // let customer_id = +req.body.customer_id;
    let storeId = +req.body.storeId;
    let sql = `CALL VALIDATE_CUSTOMER_CART_ITEMS(?,?)`;
    pool.getConnection(function (err, dbConn) {
        dbConn.query(sql,
            [cartData.toString(),storeId ], function (err, customerCartItems) {
                if (err) {
                    console.log("error: ", err);
                }
                else {
                    let storeInfo = customerCartItems[0];
                    let cartData = customerCartItems[1];
                    let utcMoment = moment.utc();
                    const timeoffset = req.body.offset;
                    utcMoment.add(5, 'hours');
                    utcMoment.add(30, 'minutes');
                    let current_hour = utcMoment.hour();
                    let current_mins = utcMoment.minutes();
                    let store_opening_time = storeInfo[0].store_opening_time;
                    let store_closing_time = storeInfo[0].store_closing_time;
                    if ((store_opening_time <= current_hour) && (store_closing_time > current_hour)) {
                        storeInfo[0].closed = 0;
                    } else {
                        storeInfo[0].closed = 1;
                    }
                    console.log(current_hour);
                    res.json({
                        status: 200,
                        "message": "cart products",
                        "storeData": storeInfo,
                        "cartData": cartData
                    });
                }
                dbConn.release();
            });
    });
}


exports.syncCartItems = function (req, res) {
    let customer_id = +req.body.customer_id;
    let inputcartData = [];
    let cartData = [...req.body.cartData];
    let outputCartData = [];
    let inputStoreId = req.body.cartData.length > 0 ? cartData[0].store_id : 0;
    let sql = `CALL FETCH_CUSTOMER_CART(?,?)`;
    pool.getConnection(function (err, dbConn) {
        dbConn.query(sql, [customer_id, inputStoreId],
            function (err, customerCart) {
                if (err) {
                    console.log("error: ", err);
                    res.json({
                        "status": 400,
                        "message": "Unable to fetch customer cart",
                        "cart_id": 0
                    })
                }
                else {
                    let savedCustomerCart = customerCart[0];
                    let cart_id = 0;
                    if (typeof savedCustomerCart !== 'undefined' && savedCustomerCart.length > 0) {
                        cart_id = savedCustomerCart[0].cart_id;
                        if ((typeof cartData !== 'undefined' && cartData.length > 0)) {
                            savedCustomerCart.forEach((data) => {
                                let index = cartData.findIndex(x => +x.store_product_mapping_id === +data.store_product_mapping_id);
                                if (index != -1) {
                                    cartData[index].quantity = +cartData[index].quantity + (+data.quantity);
                                } else {
                                    let obj = {};
                                    obj.store_product_mapping_id = +data.store_product_mapping_id;
                                    obj.quantity = +data.quantity;
                                    cartData.push(obj);
                                }
                            });
                            if (cartData.length > 0) {
                                dbConn.query("DELETE FROM customer_cart_items WHERE shopping_cart_id = ?; ", cart_id,
                                    function (err, customerCartData) {
                                        if (err) {
                                            console.log("error: ", err);
                                            res.json({
                                                "status": 400,
                                                "message": "Unable to delete customer cart items",
                                                "cart_id": 0
                                            })
                                        }
                                        else {
                                            let deleted = false;

                                            deleted = true;

                                            let insertedCartId = cart_id;
                                            let newInsertProductData = [];
                                            cartData.forEach((data) => {
                                                let data1 = [];
                                                data1.push(+data.store_product_mapping_id);
                                                data1.push(+data.quantity);
                                                data1.push(insertedCartId);
                                                newInsertProductData.push(data1);
                                            });
                                            var sql = "INSERT INTO grostep.customer_cart_items (store_product_mapping_id, quantity,shopping_cart_id) VALUES ?";
                                            dbConn.query(sql, [newInsertProductData], function (err) {
                                                if (err) {
                                                    console.error(err);
                                                    res.json({
                                                        status: 400,
                                                        "message": "products not added to cart",
                                                        "cart_id": 0
                                                    });
                                                } else {
                                                    let sql = `CALL FETCH_CUSTOMER_CART(?,?)`;
                                                    dbConn.query(sql, [customer_id, 0],
                                                        function (err, customerCart) {
                                                            if (err) {
                                                                console.log("error: ", err);
                                                                res.json({
                                                                    "status": 400,
                                                                    "message": "Unable to fetch customer cart",
                                                                    "product_id": 0
                                                                })
                                                            }
                                                            else {
                                                                sendCartData(customerCart, res);
                                                            }
                                                        });
                                                    dbConn.release();
                                                }
                                            });
                                        }
                                    });
                            }
                        } else {
                            let sql = `CALL FETCH_CUSTOMER_CART(?,?)`;
                            dbConn.query(sql, [customer_id, 0],
                                function (err, customerCart) {
                                    if (err) {
                                        console.log("error: ", err);
                                        res.json({
                                            "status": 400,
                                            "message": "Unable to fetch customer cart",
                                            "product_id": 0
                                        })
                                    }
                                    else {
                                        sendCartData(customerCart, res);
                                    }
                                })
                            dbConn.release();
                        }
                    } else {
                        if ((typeof cartData !== 'undefined' && cartData.length > 0)) {
                            // only apply insert operation in the cart table
                            var sql = `INSERT INTO customer_cart 
                                                        (
                                                            customer_id, store_id, status
                                                        )
                                                        VALUES
                                                        (
                                                            ?, ?, ?
                                                        )`;
                            dbConn.query(sql, [customer_id, inputStoreId, 1],
                                function (err, customerCartData) {
                                    if (err) {
                                        console.log("error: ", err);
                                        res.json({
                                            status: 400,
                                            "message": "customer cart not added",
                                            "cart_id": 0
                                        });
                                    }
                                    else {
                                        let insertedCartId = customerCartData.insertId;
                                        let newInsertProductData = [];
                                        cartData.forEach((data) => {
                                            let data1 = [];
                                            data1.push(+data.store_product_mapping_id);
                                            data1.push(+data.quantity);
                                            data1.push(+insertedCartId);
                                            newInsertProductData.push(data1);
                                        });

                                        var sql = "INSERT INTO grostep.customer_cart_items (store_product_mapping_id, quantity,shopping_cart_id) VALUES ?";
                                        dbConn.query(sql, [newInsertProductData], function (err) {
                                            if (err) {
                                                console.error(err);
                                                res.json({
                                                    status: 400,
                                                    "message": "products not added to cart",
                                                    "cart_id": 0
                                                });
                                            } else {
                                                let sql = `CALL FETCH_CUSTOMER_CART(?,?)`;
                                                dbConn.query(sql, [customer_id, 0],
                                                    function (err, customerCart) {
                                                        if (err) {
                                                            console.log("error: ", err);
                                                            res.json({
                                                                "status": 400,
                                                                "message": "Unable to fetch customer cart",
                                                                "product_id": 0
                                                            })
                                                        }
                                                        else {
                                                            sendCartData(customerCart, res);
                                                            // sendToken(customerData[0][0], customerCart, res);
                                                        }
                                                        dbConn.release();
                                                    });
                                            }
                                        })

                                    }
                                }
                            );
                        } else {
                            res.json({
                                "status": 200,
                                "message": "No cart data found",
                                "cartData": []
                            })
                        }
                    }
                }
            }
        )
    });
}

exports.addNewProductsToCart = function (req, res) {

    let sql = `CALL CHECK_NEW_CART(?,?,?,?)`;
    pool.getConnection(function (err, dbConn) {
        dbConn.query(sql, [+req.params.customerId, +req.body.flushFirst, req.body.instructions, +req.body.storeId],
            function (err, customerCartData) {
                if (err) {
                    console.log("error: ", err);
                    res.json({
                        status: 400,
                        "message": "cart not created",
                        "cart_id": 0
                    });
                }
                else {

                    let newInsertProductData = [];
                    req.body.products.forEach((data) => {
                        let data1 = [];
                        data1.push(data.product_mapping_id);
                        data1.push(data.quantity);
                        data1.push(customerCartData[0][0]['cart_id']);
                        newInsertProductData.push(data1);
                    });
                    var sql = "INSERT INTO grostep.customer_cart_items (product_mapping_id, quantity,shopping_cart_id) VALUES ?";

                    dbConn.query(sql, [newInsertProductData], function (err) {
                        if (err) {
                            console.error(err);
                            res.json({
                                status: 400,
                                "message": "product not added to cart",
                                "cart_id": 0
                            });
                        } else {
                            let sql = `CALL FETCH_CUSTOMER_CART(?)`;
                            let customer_id = +req.query.customerId;
                            pool.getConnection(function (err, dbConn) {
                                dbConn.query(sql, [customer_id],
                                    function (err, customerCart) {
                                        if (err) {
                                            console.log("error: ", err);
                                            res.json({
                                                "status": 400,
                                                "message": "Unable to fetch customer cart",
                                                "product_id": 0
                                            })
                                        }
                                        else {
                                            let cartProducts = [];
                                            customerCart[0].forEach(cartInfo => {
                                                let obj = {};
                                                obj.cart_item_id = cartInfo.cart_item_id;
                                                obj.product_mapping_id = cartInfo.product_mapping_id;
                                                obj.quantity_purchased = cartInfo.quantity_purchased;
                                                obj.product_id = cartInfo.product_id;
                                                obj.store_selling_price = cartInfo.store_selling_price;
                                                obj.stock = cartInfo.stock;
                                                obj.product_marked_price = cartInfo.product_marked_price;
                                                obj.store_product_caping = cartInfo.store_product_caping;
                                                obj.store_product_status = cartInfo.store_product_status;
                                                obj.product_discount = cartInfo.store_discount;
                                                obj.product_name = cartInfo.product_name;
                                                obj.product_weight = cartInfo.product_weight;
                                                obj.weight_text = cartInfo.weight_text;
                                                cartProducts.push(obj);
                                            });
                                            res.json({
                                                "status": 200,
                                                "store_name": customerCart[0][0].store_name,
                                                "cart_id": customerCart[0][0].cart_id,
                                                "customer_id": customerCart[0][0].customer_id,
                                                "instructions": customerCart[0][0].instructions,
                                                "cart_added_date": customerCart[0][0].added_date,
                                                "cart_last_updated": customerCart[0][0].last_updated,
                                                "cart_status": customerCart[0][0].status,
                                                "store_opening_time": customerCart[0][0].store_opening_time,
                                                "store_opening_time_clock": customerCart[0][0].store_opening_time_clock,
                                                "store_closing_time": customerCart[0][0].store_closing_time,
                                                "store_closing_time_clock": customerCart[0][0].store_closing_time_clock,
                                                "store_closing_status": customerCart[0][0].closed,
                                                "store_status": customerCart[0][0].store_status,
                                                "customer_name": customerCart[0][0].customer_name,
                                                "customer_phone_number": customerCart[0][0].customer_phone_number,
                                                'cart_product_info': cartProducts,
                                                "message": "customer cart detail"
                                            });
                                        }
                                    })
                            });
                        }
                    });
                }
                dbConn.release();
            });
    });

}


exports.createNewCustomerCart = function (req, res) {
    let customer_id = +req.body.customer_id;
    let cartData = [...req.body.items];
    let deliveryInstructions = req.body.deliveryInstructions;
    let inputStoreId = req.body.items.length > 0 ? cartData[0].store_id : 0;
    var sql = `INSERT INTO customer_cart 
            (
                customer_id, store_id, status, instructions
            )
            VALUES
            (
                ?, ?, ?, ?
            )`;
    pool.getConnection(function (err, dbConn) {
        dbConn.query(sql, [customer_id, inputStoreId, 1, deliveryInstructions],
            function (err, customerCartData) {
                if (err) {
                    console.log("error: ", err);
                    res.json({
                        status: 400,
                        "message": "customer cart not added",
                        "cart_id": 0
                    });
                }
                else {
                    let insertedCartId = customerCartData.insertId;
                    let newInsertProductData = [];
                    cartData.forEach((data) => {
                        let data1 = [];
                        data1.push(+data.store_product_mapping_id);
                        data1.push(+data.quantity);
                        data1.push(+insertedCartId);
                        newInsertProductData.push(data1);
                    });
                    var sql = "INSERT INTO grostep.customer_cart_items (store_product_mapping_id, quantity,shopping_cart_id) VALUES ?";
                    dbConn.query(sql, [newInsertProductData], function (err) {
                        if (err) {
                            console.error(err);
                            res.json({
                                status: 400,
                                "message": "products not added to cart",
                                "cart_id": 0
                            });
                        } else {
                            let sql = `CALL FETCH_CART_DETAIL(?)`;
                            dbConn.query(sql, [insertedCartId],
                                function (err, customerCart) {
                                    if (err) {
                                        console.log("error: ", err);
                                        res.json({
                                            "status": 400,
                                            "message": "Unable to fetch cart detail",
                                        })
                                    }
                                    else {
                                        let cartProducts = [];
                                        customerCart[0].forEach(cartInfo => {
                                            let obj = {};
                                            obj.cart_id = cartInfo.cart_id;
                                            obj.cart_item_id = cartInfo.cart_item_id;
                                            obj.store_product_mapping_id = cartInfo.store_product_mapping_id;
                                            obj.quantity = cartInfo.quantity;
                                            obj.instructions = cartInfo.instructions;
                                            obj.store_selling_price = cartInfo.store_selling_price;
                                            obj.stock = cartInfo.stock;
                                            obj.store_name = cartInfo.store_name;
                                            obj.store_id = cartInfo.store_id;
                                            obj.store_latitude = cartInfo.store_latitude;
                                            obj.store_longitude = cartInfo.store_longitude;
                                            obj.store_city = cartInfo.store_city;
                                            obj.product_marked_price = cartInfo.product_marked_price;
                                            obj.store_product_caping = cartInfo.store_product_caping;
                                            obj.store_product_status = cartInfo.store_product_status;
                                            obj.stock = cartInfo.stock;
                                            // obj.product_discount = cartInfo.store_discount;
                                            obj.product_name = cartInfo.product_name;
                                            obj.image_url = cartInfo.image_url;
                                            obj.weight = cartInfo.weight;
                                            obj.weight_text = cartInfo.weight_text;
                                            cartProducts.push(obj);
                                        });
                                        res.json({
                                            "status": 200,
                                            "message": "customer cart Details",
                                            "cart_id" : insertedCartId,
                                            "customerCart": cartProducts
                                        });
                                        // sendCartData(customerCart,insertedCartId, res);
                                    }
                                });
                        }
                    });
                }
                dbConn.release();
            });
    });
}

exports.updateCustomerCartById = function(req,res) {
    let customer_id = +req.body.customer_id;
    let cart_id = +req.params.cart_id;
    let cartData = [...req.body.items];
    let inputStoreId = req.body.items.length > 0 ? cartData[0].store_id : 0;
    let deliveryInstructions =  req.body.deliveryInstructions;
    let sql = `CALL UPDATE_CUSTOMER_CART(?,?)`;
    pool.getConnection(function (err, dbConn) {
        dbConn.query(sql, [cart_id, deliveryInstructions],
            function (err, customerCartData) {
                if (err) {
                    console.log("error: ", err);
                    res.json({
                        "status": 400,
                        "message": "Unable to delete customer cart items",
                        "cart_id": cart_id
                    })
                }
                else {
                    let insertedCartId = cart_id;
                    let newInsertProductData = [];
                    cartData.forEach((data) => {
                        let data1 = [];
                        data1.push(+data.store_product_mapping_id);
                        data1.push(+data.quantity);
                        data1.push(insertedCartId);
                        newInsertProductData.push(data1);
                    });
                    var sql = "INSERT INTO grostep.customer_cart_items (store_product_mapping_id, quantity,shopping_cart_id) VALUES ?";
                    dbConn.query(sql, [newInsertProductData], function (err) {
                        if (err) {
                            console.error(err);
                            res.json({
                                status: 400,
                                "message": "products not added to cart",
                                "cart_id": 0
                            });
                        } else {
                            let sql = `CALL FETCH_CART_DETAIL(?)`;
                            dbConn.query(sql, [insertedCartId],
                                function (err, customerCart) {
                                    if (err) {
                                        console.log("error: ", err);
                                        res.json({
                                            "status": 400,
                                            "message": "Unable to fetch cart detail",
                                        })
                                    }
                                    else {
                                        let cartProducts = [];
                                        customerCart[0].forEach(cartInfo => {
                                            let obj = {};
                                            obj.cart_id = cartInfo.cart_id;
                                            obj.cart_item_id = cartInfo.cart_item_id;
                                            obj.store_product_mapping_id = cartInfo.store_product_mapping_id;
                                            obj.quantity = cartInfo.quantity;
                                            obj.instructions = cartInfo.instructions;
                                            obj.store_selling_price = cartInfo.store_selling_price;
                                            obj.stock = cartInfo.stock;
                                            obj.store_name = cartInfo.store_name;
                                            obj.store_id = cartInfo.store_id;
                                            obj.store_latitude = cartInfo.store_latitude;
                                            obj.store_longitude = cartInfo.store_longitude;
                                            obj.store_city = cartInfo.store_city;
                                            obj.product_marked_price = cartInfo.product_marked_price;
                                            obj.store_product_caping = cartInfo.store_product_caping;
                                            obj.store_product_status = cartInfo.store_product_status;
                                            obj.stock = cartInfo.stock;
                                            // obj.product_discount = cartInfo.store_discount;
                                            obj.product_name = cartInfo.product_name;
                                            obj.image_url = cartInfo.image_url;
                                            obj.weight = cartInfo.weight;
                                            obj.weight_text = cartInfo.weight_text;
                                            cartProducts.push(obj);
                                        });
                                        res.json({
                                            "status": 200,
                                            "message": "customer cart Details",
                                            "cart_id" : cart_id,
                                            "customerCart": cartProducts
                                        });
                                        // sendCartData(customerCart,insertedCartId, res);
                                    }
                                });
                        }
                    });
                }
                dbConn.release();
            });
        });
}





function sendCartData(customerCart, res) {
    let cartProducts = [];
    customerCart[0].forEach(cartInfo => {
        let obj = {};
        obj.cart_id = cartInfo.cart_id;
        obj.cart_item_id = cartInfo.cart_item_id;
        obj.store_product_mapping_id = cartInfo.store_product_mapping_id;
        obj.quantity = cartInfo.quantity;
        // obj.product_id = cartInfo.product_id;
        obj.store_selling_price = cartInfo.store_selling_price;
        obj.stock = cartInfo.stock;
        obj.store_name = cartInfo.store_name;
        obj.store_id = cartInfo.store_id;
        obj.store_name = cartInfo.store_name;
        obj.product_marked_price = cartInfo.product_marked_price;
        obj.store_product_caping = cartInfo.store_product_caping;
        obj.store_product_status = cartInfo.store_product_status;
        obj.stock = cartInfo.stock;
        // obj.product_discount = cartInfo.store_discount;
        obj.product_name = cartInfo.product_name;
        obj.image_url = cartInfo.image_url;
        obj.weight = cartInfo.weight;
        obj.weight_text = cartInfo.weight_text;
        cartProducts.push(obj);
    });
    res.json({
        "status": 200,
        "message": "customer cart Details",
        "customerCart": cartProducts
    });
}