var mysql = require('mysql');
var dbConn = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'root',
    database: 'grostep'
    // host: 'vibhavg91.cce5kiug4ajr.us-east-2.rds.amazonaws.com',
    // user: 'root',
    // password: 'password',
    // database: 'grostep'
});
// connect to database
dbConn.connect();


exports.validateMerchant = function (req, res) {
    let sql = `CALL validateMerchant(?,?)`;
    console.log(req.body.user_name + " " + req.body.password);
    dbConn.query(sql, [req.body.user_name, req.body.password], function (err, merchantData) {
        // res.json(employeeData);
        if (err) {
            res.json({
                "status": 401,
                "message": "Merchant Details not found",
                "employeeData": merchantData[0]
            });
        }
        else {
            res.json({
                "status": 200,
                "message": "Merchant Details",
                "employeeData": merchantData[0]
            });
        }
    });
}

exports.fetchAllStores = function (req, res) {
    let sql = `CALL GET_ALL_STORES_INFO(?,?,?)`;
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
        });
}

exports.fetchAllStoresBasedOnZipCode = function (req, res) {
    let sql = `CALL GET_ALL_STORES_ZIP_CODE(?)`;
    dbConn.query(sql, [req.body.filterBy],
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
        });
}

exports.updateProductStock = function (req, res) {
    const updateStock = req.body;
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
        });
}

exports.editStoreProductInfoById = function (req, res) {
    const ProductInfo = req.body;
    let sql = `CALL UPDATE_STORE_PRODUCT_INFO(?,?,?,?,?,?,?,?)`;
    let productId = +req.body.productId;
    let store_cost_price = +req.body.store_cost_price;
    let store_selling_price = +req.body.store_selling_price;
    let store_margin = +req.body.store_margin;
    let store_discount = +req.body.store_discount;
    let status = +req.body.status;
    let product_marked_price = +req.body.product_marked_price;
    let stock = +req.body.stock;
    dbConn.query(sql, [productId, store_cost_price, store_selling_price, store_margin,
        store_discount, status, product_marked_price, stock],
        function (err, updatedProduct) {
            if (err) {
                console.log("error: ", err);
                res.json({
                    "status": 400,
                    "message": "Product not updated",
                    "product_id": 0
                })
            }
            else {
                res.json({
                    "status": 200,
                    "message": "Product detail",
                    "product_id": productId
                });
            }
        });
}

exports.fetchStoreProductInfoById = function (req, res) {
    let sql = `CALL GET_STORE_PRODUCTINFO(?)`;
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
    });
}

exports.fetchStoreProductsById = function (req, res) {
    let sql = `CALL GET_STORE_PRODUCTS_ADMIN(?,?,?,?)`;
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
    });
}

exports.deleteStore = function (req, res) {
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
        });
}

exports.deleteStoreProduct = function (req, res) {
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
        });
}

exports.fetchStoreOrderProductsById = function (req, res) {
    let sql = `CALL GET_ORDER_PRODUCTS(?)`;
    dbConn.query(sql, [+req.params.orderId],
        function (err, orderProducts) {
            if (err) {
                console.log("error: ", err);
                res.json({
                    status: 400,
                    "message": "Store products Information not found",
                    "order_products_info": []
                    // "store_products_count":store[1]
                });
            }
            else {
                res.json({
                    status: 200,
                    "message": "Store products Information",
                    "order_products_info": orderProducts[0]
                    // "order_products_count":store[1]
                });
            }
        });
}

exports.fetchStoreOrdersById = function (req, res) {
    let sql = `CALL GET_STORE_ORDERS(?,?,?,?)`;
    // , req.body.order_type
    dbConn.query(sql, [+req.body.storeId, +req.body.page_number, +req.body.page_size, req.body.filterBy],
        function (err, storeOrders) {
            if (err) {
                console.log("error: ", err);
                res.json({
                    status: 400,
                    "message": "Store orders Information not found",
                    "store_orders_info": storeOrders[0],
                    "store_order_count": storeOrders[1]
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
        });
}

exports.fetchStoreById = function (req, res) {
    let sql = `CALL GET_STORE_INFO(?)`;
    dbConn.query(sql, [req.params.storeId], function (err, store) {
        if (err) {
            res.json({
                status: 400,
                "message": "Store Information not found",
                "store": store[0]
            });
        }
        else {
            res.json({
                status: 200,
                "message": "store Information",
                "store": store[0]
            });
        }
    });
}

exports.addNewStore = function (req, res) {
    const newProduct = req.body;
    let sql = `CALL ADD_NEW_STORE(?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`;

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
    let status = +req.body.status;


    dbConn.query(sql, [storeName, storeEmail, storePhoneNumber, storeAlternateNumber,
        storeLandlineNumber, country, state, city, storeGSTNumber, storePANNumber,
        storeAddress, pinCode, storeDescription, storeRating, latitude, longitude, status, storeCategoryName],
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

    dbConn.query(sql, [product_id, store_id, store_marked_price, store_cost_price, store_selling_price,
        store_margin, store_discount, store_initial_quantity, store_updated_quantity,
        store_additional_quantity, status, stock, parent_category_id, category_id],
        function (err, store) {
            if (err) {
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
        });
}

exports.updateStore = function (req, res) {
    const updateStore = req.body;
    dbConn.query("UPDATE stores SET ? WHERE store_id = ?", [updateStore, req.params.storeId], function (err, store) {
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
    });
}

exports.updateStoreImages = function (store_id, imageUrl, req, res) {
    let sql = `CALL UPDATE_STORE_IMAGES(?,?,?)`;
    let storeId = +store_id;
    let image_url = imageUrl;
    let status = 1;
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
        });
}

exports.fetchStoreSubCategoriesInfoById = function (req, res) {
    dbConn.query("select scm.store_category_mapping_id, c.category_id, c.name, c.store_category_id, c.image_url from store_category_mapping scm inner join categories c on scm.store_category_id = c.category_id where scm.store_id = ?;",
    [req.params.storeId], function (err, storeCategory) {
        if (err) {
            console.log("error: ", err);
        }
        else {                
            res.json({
                status: 200,
                "message": "Store Categories Information",
                "store_categories": storeCategory,
            });
        }
    });    
}

