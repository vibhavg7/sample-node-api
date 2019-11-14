var mysql = require('mysql');
var dbConn = mysql.createConnection({
    host: 'vibhavg91.cce5kiug4ajr.us-east-2.rds.amazonaws.com',
    user: 'root',
    password: 'password',
    database: 'grostep'
});
// connect to database
dbConn.connect();


exports.fetchAllStores = function(req, res) {
    let sql = `CALL GET_ALL_STORES_INFO(?,?,?)`;
    dbConn.query(sql,[+req.body.page_number,+req.body.page_size,req.body.filterBy], 
        function (err, stores) {
        if (err) {
            console.log("error: ", err);
        }
        else {
            res.json({
                "message":"stores information",
                "store": stores[0],
                "store_total_count":stores[1][0]
            });
        }
    });
}

exports.fetchStoreProductsById = function(req,res) {
    let sql = `CALL GET_STORE_PRODUCTS(?,?,?,?)`;
    dbConn.query(sql,[+req.body.storeId,+req.body.page_number,+req.body.page_size,req.body.filterBy], function (err, store) {
        if (err) {
            console.log("error: ", err);
            res.json({
                status:400,
                "message":"Store products Information not found",
                "store_products_info": store[0],
                "store_products_count":store[1]
            });
        }
        else {
            res.json({
                status:200,
                "message":"Store products Information",
                "store_products_info": store[0],
                "store_products_count":store[1]
            });
        }
    });
}

exports.fetchStoreOrderProductsById = function(req,res) {
    let sql = `CALL GET_ORDER_PRODUCTS(?)`;
    dbConn.query(sql,[+req.params.orderId], 
        function (err, orderProducts) {
        if (err) {
            console.log("error: ", err);
            res.json({
                status:400,
                "message":"Store products Information not found",
                "order_products_info": []
                // "store_products_count":store[1]
            });
        }
        else {
            res.json({
                status:200,
                "message":"Store products Information",
                "order_products_info": orderProducts[0]
                // "order_products_count":store[1]
            });
        }
    });
}

exports.fetchStoreOrdersById = function(req,res) {
    let sql = `CALL GET_STORE_ORDERS(?,?,?,?)`;
    dbConn.query(sql,[+req.body.storeId,+req.body.page_number,+req.body.page_size,req.body.filterBy], function (err, storeOrders) {
        if (err) {
            console.log("error: ", err);
            res.json({
                status:400,
                "message":"Store orders Information not found",
                "store_orders_info": storeOrders[0],
                "store_order_count":storeOrders[1]
            });
        }
        else {
            res.json({
                status:200,
                "message":"Store orders Information",
                "store_orders_info": storeOrders[0],
                "store_order_count":storeOrders[1]
            });
        }
    });
}

exports.fetchStoreById = function(req, res) {
    let sql = `CALL GET_STORE_INFO(?)`;
    dbConn.query(sql,[req.params.storeId], function (err, store) {
        if (err) {
            res.json({
                status:400,
                "message":"Store Information not found",
                "store": store[0]
            });
        }
        else {
            res.json({
                status:200,
                "message":"store Information",
                "store": store[0]
            });
        }
    });
}

exports.addNewStore = function(req, res) {
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
    

    dbConn.query(sql, [storeName,storeEmail,storePhoneNumber,storeAlternateNumber,
        storeLandlineNumber,country,state,city,storeGSTNumber,storePANNumber,
        storeAddress,pinCode,storeDescription,storeRating,latitude,longitude,status,storeCategoryName], 
                     function (err, store) {
        if (err) {
            console.log("error: ", err);
            res.json({
                "message":"store not added",
                "status":400,
                "store_id":0
            });
        }
        else {
            console.log(JSON.stringify(store));
            res.json({
                "status":200,
                "message":"store added",
                "store_id":store[0][0]['store_id']
            });
        }
    });
}

exports.addStoreProducts = function(req, res) {
    const newProduct = req.body;

    let sql = `CALL ADD_STORE_NEW_PRODUCT(?,?,?,?,?,?,?,?,?,?,?,?)`;
    
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

    dbConn.query(sql, [product_id,store_id,store_marked_price,store_cost_price,store_selling_price,
        store_margin,store_discount,store_initial_quantity,store_updated_quantity,
        store_additional_quantity,status,stock], 
                     function (err, store) {
        if (err) {
            res.json({
                "message":"store product not added",
                "status":400,
                "store_product_mapping_id":0
            });
        }
        else {
            console.log(JSON.stringify(store));
            res.json({
                "status":200,
                "message":"store product added successfully",
                "store_product_mapping_id":store[0][0]['store_product_mapping_id']
            });
        }
    });
}

exports.updateStore = function(req, res) {
    const updateStore =  req.body;
    dbConn.query("UPDATE stores SET ? WHERE store_id = ?", [updateStore, req.params.storeId],function (err, store) {
        if (err) {
            console.log("error: ", err);
            res.json({
                status:400,
                "message":"store Information not updated",
                "store": store
            });

        }
        else {
            console.log(JSON.stringify(store));
            res.json({
                status:200,
                "message":"store Information updated",
                "store": store
            });
        }
    });
}

exports.updateStoreImages = function(store_id,imageUrl,req,res) {
    let sql = `CALL UPDATE_STORE_IMAGES(?,?,?)`;
    let storeId = +store_id;
    let image_url = imageUrl;    
    let status = 1;
    dbConn.query(sql, [storeId,image_url,status],
                     function (err, updatedStore) {     
        if (err) {
            console.log("error: ", err);
            res.json({
                "status":400,
                "message":"store images not updated",
                "product_id":0
            })
        }
        else {
            res.json({
                "status":200,
                "message":"store detail",
                "product": updatedStore[0][0]
            });
        }
    });
}