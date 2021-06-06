var pool = require('../../utils/manageDB');
var createError = require('http-errors')

exports.getProducts = async function (req, res, next) {
    let sql = `CALL GET_PRODUCTSINFO(?,?,?)`;
    try {
        const products = await pool.query(sql, [+req.body.page_number, +req.body.page_size, req.body.filterBy]);
        res.json({
            "status": 200,
            "message": "Product list",
            "products": products[0],
            "products_total_count": products[1][0]
        });
    }
    catch (err) {
        next(createError(401, err));
    } finally {
        // pool.end();
    }
}

exports.searchProductByName = async function (req, res, next) {
    let sql = `CALL FILTER_PRODUCTS_BYNAME(?)`;
    try {
        const products = await pool.query(sql, [req.params.productName]);
        res.json({
            "message": "products information",
            "products": products[0],
            "products_total_count": products[1][0]
        });
    } catch (err) {
        next(createError(401, err));
    } finally {
        // pool.end();
    }
}


exports.addProduct = async function (req, res, next) {
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
    try {
        const product = await pool.query(sql, [product_name, product_price, weight_type, category_id,
            product_code, product_description, product_rating, status, product_weight]);
        res.json({
            "status": 200,
            "message": "Product added",
            "product_id": product[0][0]['product_id']
        });
    }
    catch (err) {
        next(createError(401, err));
    } finally {
        // pool.end();
    }
}

exports.getProduct = async function (req, res, next) {
    let sql = `CALL GET_PRODUCT_DETAIL(?)`;
    try {
        const product = await pool.query(sql, [req.params.productId]);
        res.json({
            "status": 200,
            "message": "Product detail",
            "product": product[0][0]
        });
    }
    catch (err) {
        next(createError(401, err));
    } finally {
        // pool.end();
    }
}

exports.deleteProduct = async function (req, res, next) {
    const updateProduct = {
        status: 0
    };
    let sql = `UPDATE grostep.products SET ? WHERE product_id = ?`;
    try {
        const product = await pool.query(sql, [updateProduct, +req.params.productId]);
        res.json({
            status: 200,
            "message": "product Information updated",
            "product": product
        });
    }
    catch (err) {
        next(createError(401, err));
    } finally {
        // pool.end();
    }
    // try {
    //     const product = await pool.query("DELETE FROM products WHERE product_id = ? ", req.params.productId);
    //     res.json({
    //         "status": 200,
    //         "message": "Product detail",
    //         "product": product
    //     });
    // }
    // catch (err) {
    //     next(createError(401, err));
    // } finally {
    //     // pool.end();
    // }
}

exports.updateProduct = async function (req, res, next) {
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
    try {
        const updatedProduct = await pool.query(sql, [product_id, product_name, product_price, status,
            weight_type, product_code, product_description, product_rating, category_id, product_weight]);
        res.json({
            "status": 200,
            "message": "Product detail",
            "product": updatedProduct[0][0]["last_updated_product_id"]
        });
    }
    catch (err) {
        next(createError(401, err));
    } finally {
        // pool.end();
    }
}

exports.updateProductImages = async function (productId, imageUrl, req, res, next) {
    let sql = `CALL UPDATE_PRODUCT_IMAGES(?,?,?)`;
    let product_id = +productId;
    let image_url = imageUrl;
    let status = 1;
    try {
        const updatedProduct = await pool.query(sql, [product_id, image_url, status]);
        res.json({
            "status": 200,
            'image_url': req.file.location,
            "message": "Product detail",
            "product": updatedProduct[0][0]
        });
    }
    catch (err) {
        next(createError(401, err));
    } finally {
        // pool.end();
    }
}
