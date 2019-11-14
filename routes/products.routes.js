var express = require('express');
var router = express.Router();

var productsController = require("../controllers/products.controller");

router.route('/')
    .post(productsController.addProduct);

router.route('/productsearch/:productName')
    .get(productsController.searchProductByName);

router.route('/:productId')
    .get(productsController.getProduct)
    .put(productsController.updateProduct)
    .delete(productsController.deleteProduct);


router.route('/fetchProducts')
    .post(productsController.getProducts);

module.exports = router;