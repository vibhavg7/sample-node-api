var jwt = require('jsonwebtoken');
var rp = require('request-promise');
var async = require("async");
var moment = require('moment');
var pool = require('../../utils/manageDB');
var jwt = require('jsonwebtoken');
var createError = require('http-errors');


exports.fetchCartDetailsById = async function(req, res, next) {
    let sql = `CALL GET_CART_INFO(?)`;
    try {
        const cartData = await pool.query(sql, [+req.params.cartId]);
        res.json({
            "message": "order information",
            "status": 200,
            "customerInfo": cartData[0],
            "storeInfo": cartData[1],
            "cart_id": cartData[2][0].cart_id,
            "coupon_code": cartData[2][0].coupon_code,
            "order_amount": cartData[2][0].order_amount,
            "delivery_cost": cartData[2][0].delivery_cost,
            "discount_amount": cartData[2][0].voucher_amount,
            "last_updated": cartData[2][0].last_updated,
            "instructions": cartData[2][0].instructions,
            "status": cartData[2][0].status

        });
    }  catch (err) {
        next(createError(401, err));
    } finally {
        // pool.end();
    }
}

exports.fetchcartsinfo = async function (req, res, next) {
    let sql = `CALL GET_CUSTOMER_CARTS(?,?,?,?)`;
    try {
        const cartData = await pool.query(sql, [+req.body.page_number, +req.body.page_size, +req.body.customerId, req.body.filterBy]);
        let uniqueArr = [];
        let cartData1 = cartData[0];

        for (let i = 0; i < cartData1.length; i++) {
            let cartData = cartData1[i];
            if (uniqueArr.filter(value => value.cart_id == cartData.cart_id).length == 0) {
                let itemArr = cartData1.filter(val => val.cart_id == cartData.cart_id)
                    .map(obj => (
                        {
                            "store_product_mapping_id": obj.store_product_mapping_id,
                            "quantity": obj.quantity,
                            "image_url": obj.image_url,
                            "weight_type_id": obj.weight_type_id,
                            "weight_text": obj.weight_text,
                            "product_id": obj.product_id,
                            "product_name": obj.product_name,
                            "product_weight": obj.product_weight,
                            "store_selling_price": obj.store_selling_price,
                            // "buying_date": obj.order_placing_date,
                        }));
                let newItem = {};
                let customer_info = {};
                let store_info = {};

                newItem.cart_id = cartData.cart_id;
                newItem.instructions = cartData.instructions;
                newItem.added_date = cartData.added_date;
                newItem.last_updated = cartData.last_updated;
                newItem.order_amount = cartData.order_amount;
                newItem.delivery_cost = cartData.delivery_cost;
                newItem.discount_amount = cartData.voucher_amount;
                newItem.coupon_code = cartData.coupon_code;
                newItem.delivery_slot = cartData.delivery_slot;
                newItem.delivery_type = cartData.delivery_type;
                newItem.total = newItem.order_amount + newItem.delivery_cost - newItem.discount_amount;
                newItem.status = cartData.status;
                newItem.store_id = cartData.store_id;
                newItem.store_name = cartData.store_name;

                newItem.customerInfo = [];
                newItem.storeInfo = [];


                customer_info.customer_id = cartData.customer_id;
                customer_info.customer_name = cartData.customer_name;
                customer_info.registered_number = cartData.customer_phone;
                customer_info.customer_email = cartData.customer_email;

                store_info.store_id = cartData.store_id;
                store_info.store_name = cartData.store_name;
                store_info.store_email = cartData.store_email;
                store_info.phone_number = cartData.store_phone_number;
                store_info.alternative_number = cartData.store_alternative_number;
                store_info.country = cartData.country;
                store_info.state = cartData.state;
                store_info.city = cartData.city;
                store_info.pin_code = cartData.store_pin_code;
                store_info.latitude = cartData.store_latitude;
                store_info.longitude = cartData.store_longitude;
                store_info.address = cartData.store_address;

                newItem.cartproducts = (itemArr);
                newItem.customerInfo.push(customer_info);
                newItem.storeInfo.push(store_info);
                uniqueArr.push(newItem);

            }
        }

        res.json({
            status: 200,
            "message": "cart Information",
            "carts_info": uniqueArr,
            "cart_total_count": cartData[1]
        });
    }
    catch (err) {
        next(createError(401, err));
    } finally {
        // pool.end();
    }
}

// exports.updateProductToCart = function (req, res) {

// }

// exports.fetchCustomerCart = function (req, res) {
//     let sql = `CALL FETCH_CUSTOMER_CART(?)`;
//     let customer_id = +req.query.customerId;
//     pool.getConnection(function (err, dbConn) {
//         dbConn.query(sql, [customer_id],
//             function (err, customerCart) {
//                 if (err) {
//                     console.log("error: ", err);
//                     res.json({
//                         "status": 400,
//                         "message": "Unable to fetch customer cart",
//                         "product_id": 0
//                     })
//                 }
//                 else {

//                     let cartProducts = [];

//                     customerCart[0].forEach(cartInfo => {
//                         let obj = {};
//                         obj.cart_item_id = cartInfo.cart_item_id;
//                         obj.product_mapping_id = cartInfo.product_mapping_id;
//                         obj.quantity_purchased = cartInfo.quantity_purchased;
//                         obj.product_id = cartInfo.product_id;
//                         obj.store_selling_price = cartInfo.store_selling_price;
//                         obj.stock = cartInfo.stock;
//                         obj.product_marked_price = cartInfo.product_marked_price;
//                         obj.store_product_caping = cartInfo.store_product_caping;
//                         obj.store_product_status = cartInfo.store_product_status;
//                         obj.product_discount = cartInfo.store_discount;
//                         obj.product_name = cartInfo.product_name;
//                         obj.product_weight = cartInfo.product_weight;
//                         obj.weight_text = cartInfo.weight_text;
//                         cartProducts.push(obj);
//                     });

//                     res.json({
//                         "status": 200,
//                         "store_name": customerCart[0][0].store_name,
//                         "cart_id": customerCart[0][0].cart_id,
//                         "customer_id": customerCart[0][0].customer_id,
//                         "instructions": customerCart[0][0].instructions,
//                         "cart_added_date": customerCart[0][0].added_date,
//                         "cart_last_updated": customerCart[0][0].last_updated,
//                         "cart_status": customerCart[0][0].status,
//                         "store_opening_time": customerCart[0][0].store_opening_time,
//                         "store_opening_time_clock": customerCart[0][0].store_opening_time_clock,
//                         "store_closing_time": customerCart[0][0].store_closing_time,
//                         "store_closing_time_clock": customerCart[0][0].store_closing_time_clock,
//                         "store_closing_status": customerCart[0][0].closed,
//                         "store_status": customerCart[0][0].store_status,
//                         "customer_name": customerCart[0][0].customer_name,
//                         "customer_phone_number": customerCart[0][0].customer_phone_number,
//                         'cart_product_info': cartProducts,
//                         "message": "customer cart detail"
//                     });
//                 }
//                 dbConn.release();
//             });
//     });
// }

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


// exports.deleteProductFromCustomerCart = function (req, res) {
//     let sql = `CALL DELETE_PRODUCT_CUSTOMER_CART(?,?,?)`;
//     pool.getConnection(function (err, dbConn) {
//         dbConn.query(sql, [+req.params.customerId, +req.body.productId, req.body.cartId],
//             function (err, customerCartData) {
//                 if (err) {
//                     console.log("error: ", err);
//                 }
//                 else {
//                     res.json({
//                         "message": "customer cart information",
//                         "status": 200,
//                         "customerCartData": customerCartData[0],
//                         "customer_cart_total_products_count": customerCartData[1][0]
//                     });
//                 }
//                 dbConn.release();
//             });
//     });
// }

exports.validateStoreCartProducts = function (req, res) {
    let cartData = [...req.body.cartData];
    // let customer_id = +req.body.customer_id;
    let storeId = +req.body.storeId;
    let sql = `CALL VALIDATE_CUSTOMER_CART_ITEMS(?,?)`;
    console.log(cartData.toString());
    pool.getConnection(function (err, dbConn) {
        dbConn.query(sql,
            [cartData.toString(), storeId], function (err, customerCartItems) {
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
                    // if ((store_opening_time <= current_hour) && (store_closing_time > current_hour)) {
                    //     storeInfo[0].closed = 0;
                    // } else {
                    //     storeInfo[0].closed = 1;
                    // }
                    // console.log(current_hour);
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

exports.fetchCartProducts = async function (req, res, next) {
    let sql = `CALL GET_CART_PRODUCTS(?)`;
    try {
        const cartProducts = await pool.query(sql, [+req.params.cartId]);
        res.json({
            "status": 200,
            "message": "Cart Product list",
            "cartproducts": cartProducts[0],
            "cart_products_total_count": cartProducts[1][0]
        });
    }
    catch (err) {
        next(createError(401, err));
    } finally {
        // pool.end();
    }
}


exports.fetchCustomerCarts = async function (req, res, next) {
    let sql = `CALL GET_CUSTOMER_CARTS(?,?)`;
    try {
        const customerCarts = await pool.query(sql, [+req.body.customerId, req.body.filterBy]);
        let uniqueArr = [];

        let customerCarts1 = customerCarts[0];

        for (let i = 0; i < customerCarts1.length; i++) {
            let customerCartData = customerCarts1[i];
            if (uniqueArr.filter(value => value.cart_id == customerCartData.cart_id).length == 0) {
                let itemArr = customerCarts1.filter(val => val.cart_id == customerCartData.cart_id)
                    .map(obj => (
                        {
                            "store_product_mapping_id": obj.store_product_mapping_id,
                            "quantity": obj.quantity,
                            "image_url": obj.image_url,
                            "weight": obj.weight,
                            "weight_text": obj.weight_text,
                            "product_name": obj.product_name,
                            "store_selling_price": obj.store_selling_price,
                            "stock": obj.stock,
                            "store_product_status": obj.store_product_status,
                            "store_discount": obj.store_discount
                        }));
                let newItem = {};
                // console.log(customerCartData.total);
                newItem.cart_id = customerCartData.cart_id;
                newItem.customer_id = customerCartData.customer_id;
                newItem.instructions = customerCartData.instructions;
                newItem.store_id = customerCartData.store_id;
                newItem.store_name = customerCartData.store_name;
                newItem.store_phone_number = customerCartData.store_phone_number;
                newItem.added_date = new Date(customerCartData.added_date).toISOString();
                // customerCartData.added_date;
                newItem.last_updated = new Date(customerCartData.last_updated).toISOString();
                // customerCartData.last_updated;
                newItem.customer_name = customerCartData.customer_name;
                newItem.customer_phone_number = customerCartData.customer_phone_number;
                newItem.order_amount = customerCartData.order_amount ? customerCartData.order_amount : 0;
                newItem.delivery_slot = customerCartData.delivery_slot;
                newItem.delivery_type = customerCartData.delivery_type;
                newItem.discount_amount = customerCartData.voucher_amount ? customerCartData.voucher_amount : 0;
                newItem.delivery_cost = customerCartData.delivery_cost ? customerCartData.delivery_cost : 0;
                newItem.voucher_code = customerCartData.voucher_code;
                newItem.total = customerCartData.total ? customerCartData.total : newItem.order_amount + newItem.delivery_cost - newItem.discount_amount;
                newItem.status = customerCartData.status;
                // newItem.cart_products = [];
                newItem.cart_products_info = (itemArr);
                uniqueArr.push(newItem);
            }
        }
        res.json({
            status: 200,
            "message": "Customer carts Information",
            "customer_carts_info": uniqueArr,
            "customer_carts_count": customerCarts[1][0]
        });
    }
    catch (err) {
        next(createError(401, err));
    } finally {
        // pool.end();
    }
}


// exports.syncCartItems = function (req, res) {
//     let customer_id = +req.body.customer_id;
//     let inputcartData = [];
//     let cartData = [...req.body.cartData];
//     let outputCartData = [];
//     let inputStoreId = req.body.cartData.length > 0 ? cartData[0].store_id : 0;
//     let sql = `CALL FETCH_CUSTOMER_CART(?,?)`;
//     pool.getConnection(function (err, dbConn) {
//         dbConn.query(sql, [customer_id, inputStoreId],
//             function (err, customerCart) {
//                 if (err) {
//                     console.log("error: ", err);
//                     res.json({
//                         "status": 400,
//                         "message": "Unable to fetch customer cart",
//                         "cart_id": 0
//                     })
//                 }
//                 else {
//                     let savedCustomerCart = customerCart[0];
//                     let cart_id = 0;
//                     if (typeof savedCustomerCart !== 'undefined' && savedCustomerCart.length > 0) {
//                         cart_id = savedCustomerCart[0].cart_id;
//                         if ((typeof cartData !== 'undefined' && cartData.length > 0)) {
//                             savedCustomerCart.forEach((data) => {
//                                 let index = cartData.findIndex(x => +x.store_product_mapping_id === +data.store_product_mapping_id);
//                                 if (index != -1) {
//                                     cartData[index].quantity = +cartData[index].quantity + (+data.quantity);
//                                 } else {
//                                     let obj = {};
//                                     obj.store_product_mapping_id = +data.store_product_mapping_id;
//                                     obj.quantity = +data.quantity;
//                                     cartData.push(obj);
//                                 }
//                             });
//                             if (cartData.length > 0) {
//                                 dbConn.query("DELETE FROM customer_cart_items WHERE shopping_cart_id = ?; ", cart_id,
//                                     function (err, customerCartData) {
//                                         if (err) {
//                                             console.log("error: ", err);
//                                             res.json({
//                                                 "status": 400,
//                                                 "message": "Unable to delete customer cart items",
//                                                 "cart_id": 0
//                                             })
//                                         }
//                                         else {
//                                             let deleted = false;

//                                             deleted = true;

//                                             let insertedCartId = cart_id;
//                                             let newInsertProductData = [];
//                                             cartData.forEach((data) => {
//                                                 let data1 = [];
//                                                 data1.push(+data.store_product_mapping_id);
//                                                 data1.push(+data.quantity);
//                                                 data1.push(insertedCartId);
//                                                 newInsertProductData.push(data1);
//                                             });
//                                             var sql = "INSERT INTO grostep.customer_cart_items (store_product_mapping_id, quantity,shopping_cart_id) VALUES ?";
//                                             dbConn.query(sql, [newInsertProductData], function (err) {
//                                                 if (err) {
//                                                     console.error(err);
//                                                     res.json({
//                                                         status: 400,
//                                                         "message": "products not added to cart",
//                                                         "cart_id": 0
//                                                     });
//                                                 } else {
//                                                     let sql = `CALL FETCH_CUSTOMER_CART(?,?)`;
//                                                     dbConn.query(sql, [customer_id, 0],
//                                                         function (err, customerCart) {
//                                                             if (err) {
//                                                                 console.log("error: ", err);
//                                                                 res.json({
//                                                                     "status": 400,
//                                                                     "message": "Unable to fetch customer cart",
//                                                                     "product_id": 0
//                                                                 })
//                                                             }
//                                                             else {
//                                                                 sendCartData(customerCart, res);
//                                                             }
//                                                         });
//                                                     dbConn.release();
//                                                 }
//                                             });
//                                         }
//                                     });
//                             }
//                         } else {
//                             let sql = `CALL FETCH_CUSTOMER_CART(?,?)`;
//                             dbConn.query(sql, [customer_id, 0],
//                                 function (err, customerCart) {
//                                     if (err) {
//                                         console.log("error: ", err);
//                                         res.json({
//                                             "status": 400,
//                                             "message": "Unable to fetch customer cart",
//                                             "product_id": 0
//                                         })
//                                     }
//                                     else {
//                                         sendCartData(customerCart, res);
//                                     }
//                                 })
//                             dbConn.release();
//                         }
//                     } else {
//                         if ((typeof cartData !== 'undefined' && cartData.length > 0)) {
//                             // only apply insert operation in the cart table
//                             var sql = `INSERT INTO customer_cart 
//                                                         (
//                                                             customer_id, store_id, status
//                                                         )
//                                                         VALUES
//                                                         (
//                                                             ?, ?, ?
//                                                         )`;
//                             dbConn.query(sql, [customer_id, inputStoreId, 1],
//                                 function (err, customerCartData) {
//                                     if (err) {
//                                         console.log("error: ", err);
//                                         res.json({
//                                             status: 400,
//                                             "message": "customer cart not added",
//                                             "cart_id": 0
//                                         });
//                                     }
//                                     else {
//                                         let insertedCartId = customerCartData.insertId;
//                                         let newInsertProductData = [];
//                                         cartData.forEach((data) => {
//                                             let data1 = [];
//                                             data1.push(+data.store_product_mapping_id);
//                                             data1.push(+data.quantity);
//                                             data1.push(+insertedCartId);
//                                             newInsertProductData.push(data1);
//                                         });

//                                         var sql = "INSERT INTO grostep.customer_cart_items (store_product_mapping_id, quantity,shopping_cart_id) VALUES ?";
//                                         dbConn.query(sql, [newInsertProductData], function (err) {
//                                             if (err) {
//                                                 console.error(err);
//                                                 res.json({
//                                                     status: 400,
//                                                     "message": "products not added to cart",
//                                                     "cart_id": 0
//                                                 });
//                                             } else {
//                                                 let sql = `CALL FETCH_CUSTOMER_CART(?,?)`;
//                                                 dbConn.query(sql, [customer_id, 0],
//                                                     function (err, customerCart) {
//                                                         if (err) {
//                                                             console.log("error: ", err);
//                                                             res.json({
//                                                                 "status": 400,
//                                                                 "message": "Unable to fetch customer cart",
//                                                                 "product_id": 0
//                                                             })
//                                                         }
//                                                         else {
//                                                             sendCartData(customerCart, res);
//                                                             // sendToken(customerData[0][0], customerCart, res);
//                                                         }
//                                                         dbConn.release();
//                                                     });
//                                             }
//                                         })

//                                     }
//                                 }
//                             );
//                         } else {
//                             res.json({
//                                 "status": 200,
//                                 "message": "No cart data found",
//                                 "cartData": []
//                             })
//                         }
//                     }
//                 }
//             }
//         )
//     });
// }

// exports.addNewProductsToCart = function (req, res) {

//     let sql = `CALL CHECK_NEW_CART(?,?,?,?)`;
//     pool.getConnection(function (err, dbConn) {
//         dbConn.query(sql, [+req.params.customerId, +req.body.flushFirst, req.body.instructions, +req.body.storeId],
//             function (err, customerCartData) {
//                 if (err) {
//                     console.log("error: ", err);
//                     res.json({
//                         status: 400,
//                         "message": "cart not created",
//                         "cart_id": 0
//                     });
//                 }
//                 else {

//                     let newInsertProductData = [];
//                     req.body.products.forEach((data) => {
//                         let data1 = [];
//                         data1.push(data.product_mapping_id);
//                         data1.push(data.quantity);
//                         data1.push(customerCartData[0][0]['cart_id']);
//                         newInsertProductData.push(data1);
//                     });
//                     var sql = "INSERT INTO grostep.customer_cart_items (product_mapping_id, quantity,shopping_cart_id) VALUES ?";

//                     dbConn.query(sql, [newInsertProductData], function (err) {
//                         if (err) {
//                             console.error(err);
//                             res.json({
//                                 status: 400,
//                                 "message": "product not added to cart",
//                                 "cart_id": 0
//                             });
//                         } else {
//                             let sql = `CALL FETCH_CUSTOMER_CART(?)`;
//                             let customer_id = +req.query.customerId;
//                             pool.getConnection(function (err, dbConn) {
//                                 dbConn.query(sql, [customer_id],
//                                     function (err, customerCart) {
//                                         if (err) {
//                                             console.log("error: ", err);
//                                             res.json({
//                                                 "status": 400,
//                                                 "message": "Unable to fetch customer cart",
//                                                 "product_id": 0
//                                             })
//                                         }
//                                         else {
//                                             let cartProducts = [];
//                                             customerCart[0].forEach(cartInfo => {
//                                                 let obj = {};
//                                                 obj.cart_item_id = cartInfo.cart_item_id;
//                                                 obj.product_mapping_id = cartInfo.product_mapping_id;
//                                                 obj.quantity_purchased = cartInfo.quantity_purchased;
//                                                 obj.product_id = cartInfo.product_id;
//                                                 obj.store_selling_price = cartInfo.store_selling_price;
//                                                 obj.stock = cartInfo.stock;
//                                                 obj.product_marked_price = cartInfo.product_marked_price;
//                                                 obj.store_product_caping = cartInfo.store_product_caping;
//                                                 obj.store_product_status = cartInfo.store_product_status;
//                                                 obj.product_discount = cartInfo.store_discount;
//                                                 obj.product_name = cartInfo.product_name;
//                                                 obj.product_weight = cartInfo.product_weight;
//                                                 obj.weight_text = cartInfo.weight_text;
//                                                 cartProducts.push(obj);
//                                             });
//                                             res.json({
//                                                 "status": 200,
//                                                 "store_name": customerCart[0][0].store_name,
//                                                 "cart_id": customerCart[0][0].cart_id,
//                                                 "customer_id": customerCart[0][0].customer_id,
//                                                 "instructions": customerCart[0][0].instructions,
//                                                 "cart_added_date": customerCart[0][0].added_date,
//                                                 "cart_last_updated": customerCart[0][0].last_updated,
//                                                 "cart_status": customerCart[0][0].status,
//                                                 "store_opening_time": customerCart[0][0].store_opening_time,
//                                                 "store_opening_time_clock": customerCart[0][0].store_opening_time_clock,
//                                                 "store_closing_time": customerCart[0][0].store_closing_time,
//                                                 "store_closing_time_clock": customerCart[0][0].store_closing_time_clock,
//                                                 "store_closing_status": customerCart[0][0].closed,
//                                                 "store_status": customerCart[0][0].store_status,
//                                                 "customer_name": customerCart[0][0].customer_name,
//                                                 "customer_phone_number": customerCart[0][0].customer_phone_number,
//                                                 'cart_product_info': cartProducts,
//                                                 "message": "customer cart detail"
//                                             });
//                                         }
//                                     })
//                             });
//                         }
//                     });
//                 }
//                 dbConn.release();
//             });
//     });

// }


exports.createNewCustomerCart = function (req, res) {
    let customer_id = +req.body.customer_id;
    let cartData = [...req.body.items];
    let deliveryInstructions = req.body.deliveryInstructions;
    let inputStoreId = req.body.items.length > 0 ? cartData[0].store_id : 0;
    let delivery_address_id = +req.body.delivery_address_id;
    let orderTotal = cartData.reduce((sum, current) => {
        return sum + (current.store_selling_price * current.quantity);
    }, 0);

    var sql = `INSERT INTO customer_cart 
            (
                customer_id, store_id, status, instructions, order_amount, customer_delivery_address_id
            )
            VALUES
            (
                ?, ?, ?, ?, ?, ?
            )`;
    pool.getConnection(function (err, dbConn) {
        dbConn.query(sql, [customer_id, inputStoreId, 1, deliveryInstructions, orderTotal, delivery_address_id],
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
                                        cartInformation(customerCart, res);
                                    }
                                });
                        }
                    });
                }
                dbConn.release();
            });
    });
}

function cartInformation(customerCart, res) {
    let cartProducts = [];
    let cartInfo = {};
    let slot = {};
    let cartId;
    slot.delivery_type = customerCart[0][0].delivery_type;
    slot.delivery_slot = customerCart[0][0].delivery_slot;
    cartInfo.cart_id = customerCart[0][0].cart_id;
    cartInfo.customer_id = customerCart[0][0].customer_id;
    cartInfo.instructions = customerCart[0][0].instructions;
    cartInfo.store_id = customerCart[0][0].store_id;
    cartInfo.customer_delivery_address_id = customerCart[0][0].customer_delivery_address_id;

    cartInfo.slot = slot;
    cartInfo.delivery_cost = customerCart[0][0].delivery_cost;
    cartInfo.order_amount = customerCart[0][0].order_amount;
    cartInfo.total = customerCart[0][0].total;
    cartId = customerCart[0][0].cart_id;

    customerCart[1].forEach(cartInfo => {
        let obj = {};
        obj.cart_id = cartInfo.cart_id;
        obj.cart_item_id = cartInfo.cart_item_id;
        obj.store_product_mapping_id = cartInfo.store_product_mapping_id;
        obj.quantity = cartInfo.quantity;
        // obj.instructions = cartInfo.instructions;
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
        "cart_id": cartId,
        "cartInfo": cartInfo,
        "customerCart": cartProducts
    });

}

exports.updateCustomerCartById = function (req, res) {
    let customer_id = +req.body.customer_id;
    let cart_id = +req.params.cart_id;
    let cartData = [...req.body.items];
    let inputStoreId = req.body.items.length > 0 ? cartData[0].store_id : 0;
    let deliveryInstructions = req.body.deliveryInstructions;
    let delivery_address_id = +req.body.delivery_address_id;
    let sql = `CALL UPDATE_CUSTOMER_CART(?,?, ?)`;
    pool.getConnection(function (err, dbConn) {
        dbConn.query(sql, [cart_id, deliveryInstructions, delivery_address_id],
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
                                        cartInformation(customerCart, res);
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


// exports.fetchCustomerCarts = async function (req, res, next) {
//     let sql = `CALL GET_CUSTOMER_CARTS(?,?)`;
//     try {
//         const customerCarts = await pool.query(sql, [+req.body.customerId, req.body.filterBy]);
//         res.json({
//             status: 200,
//             "message": "Customer carts Information",
//             "customer_carts_info": customerCarts[0],
//             "customer_carts_count": customerCarts[1]
//         });
//     }
//     catch (err) {
//         next(createError(401, err));
//     } finally {
//         // pool.end();
//     }
// }