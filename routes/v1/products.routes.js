var express = require('express');
var router = express.Router();

var productsController = require("../../controllers/v1/products.controller");

router.post('/', productsController.addProduct );

router.get('/productsearch/:productName', productsController.searchProductByName);

router.route('/:productId')
    .get(productsController.getProduct)
    .put(productsController.updateProduct)
    .delete(productsController.deleteProduct);


router.route('/fetchProducts')
    .post(productsController.getProducts);

module.exports = router;