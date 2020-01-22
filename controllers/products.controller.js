
var mysql = require('mysql');

var pool = mysql.createPool({
    connectionLimit: 10,
    host: process.env.dbhost,
    user: process.env.dbuser,
    password: process.env.dbpassword,
    database: process.env.database
});
exports.getProducts = function (req, res) {
    let sql = `CALL GET_PRODUCTSINFO(?,?,?)`;
    pool.getConnection(function (err, dbConn) {
        dbConn.query(sql, [+req.body.page_number, +req.body.page_size, req.body.filterBy], function (err, products) {
            if (err) {
                res.json({
                    "message": "Problem fetching Products list ",
                    "status": 400,
                    "product_id": 0
                });
            }
            else {
                res.json({
                    "message": "Product list",
                    "products": products[0],
                    "products_total_count": products[1][0]
                });
            }
            dbConn.release();
        });
    });
}

exports.searchProductByName = function (req, res) {
    let sql = `CALL FILTER_PRODUCTS_BYNAME(?)`;
    pool.getConnection(function (err, dbConn) {
        dbConn.query(sql, [req.params.productName],
            function (err, products) {
                if (err) {
                    res.json({
                        "message": "product information not found",
                        "status": 400,
                        "product_id": 0
                    });
                }
                else {
                    res.json({
                        "message": "products information",
                        "products": products[0],
                        "products_total_count": products[1][0]
                    });
                }
                dbConn.release();
            });
    });
}


exports.addProduct = function (req, res) {
    const newProduct = req.body;
    let sql = `CALL ADD_PRODUCT_DETAIL(?,?,?,?,?,?,?,?,?)`;

    let product_name = req.body.product_name;
    let product_price = +req.body.product_price;
    let weight_type = +req.body.weight_type;
    let category_id = +req.body.category_id;
    let product_code = req.body.product_code;
    let product_description = req.body.product_description;
    let product_rating = +req.body.product_rating;
    let product_weight = +req.body.product_weight;
    let status = +req.body.status;
    pool.getConnection(function (err, dbConn) {
        dbConn.query(sql, [product_name, product_price, weight_type, category_id,
            product_code, product_description, product_rating, status, product_weight],
            function (err, product) {
                if (err) {
                    console.log("error: ", err);
                    res.json({
                        "message": "product not added",
                        "status": 400,
                        "product_id": 0
                    });
                }
                else {
                    console.log(JSON.stringify(product));
                    res.json({
                        "status": 200,
                        "message": "Product added",
                        "product_id": product[0][0]['product_id']
                    });
                }
                dbConn.release();
            });
    });
}

exports.getProduct = function (req, res) {
    let sql = `CALL GET_PRODUCT_DETAIL(?)`;
    pool.getConnection(function (err, dbConn) {
        dbConn.query(sql, [req.params.productId], function (err, product) {
            if (err) {
                console.log("error: ", err);
            }
            else {
                res.json({
                    "message": "Product detail",
                    "product": product[0][0]
                });
            }
            dbConn.release();
        });
    });
}

exports.deleteProduct = function (req, res) {
    pool.getConnection(function (err, dbConn) {
        dbConn.query("DELETE FROM products WHERE product_id = ? ", req.params.productId, function (err, product) {
            if (err) {
                console.log("error: ", err);
            }
            else {
                console.log(JSON.stringify(product));
                res.json(product);
            }
            dbConn.release();
        });
    });
}

exports.updateProduct = function (req, res) {
    let sql = `CALL UPDATE_PRODUCT_INFO(?,?,?,?,?,?,?,?,?,?)`;
    let product_id = +req.body.product_id;
    let product_name = req.body.product_name;
    let product_price = +req.body.product_price;
    let weight_type = +req.body.weight_type;
    let category_id = +req.body.category_id;
    let product_code = req.body.product_code;
    let product_description = req.body.product_description;
    let product_rating = +req.body.product_rating;
    let product_weight = +req.body.product_weight;
    let status = +req.body.status;
    pool.getConnection(function (err, dbConn) {
        dbConn.query(sql, [product_id, product_name, product_price, status,
            weight_type, product_code, product_description, product_rating, category_id, product_weight],
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
                        "product": updatedProduct[0][0]["last_updated_product_id"]
                    });
                }
                dbConn.release();
            });
    });
}

exports.updateProductImages = function (productId, imageUrl, req, res) {
    let sql = `CALL UPDATE_PRODUCT_IMAGES(?,?,?)`;
    let product_id = +productId;
    let image_url = imageUrl;
    let status = 1;
    pool.getConnection(function (err, dbConn) {
    dbConn.query(sql, [product_id, image_url, status],
        function (err, updatedProduct) {
            if (err) {
                console.log("error: ", err);
                res.json({
                    "status": 400,
                    "message": "Product images not updated",
                    "product_id": 0
                })
            }
            else {
                res.json({
                    "status": 200,
                    'image_url': req.file.location,
                    "message": "Product detail",
                    "product": updatedProduct[0][0]
                });
            }
            dbConn.release();
        });
    });
}
