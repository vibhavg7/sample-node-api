var express = require('express');
var router = express.Router();

var productsController = require("../../controllers/v1/products.controller");
var authenticateToken = require('../../services/authenticateToken');

router.post('/', authenticateToken, productsController.addProduct );

router.get('/productsearch/:productName', authenticateToken, productsController.searchProductByName);

router.route('/:productId')
    .get(authenticateToken, productsController.getProduct)
    .put(authenticateToken,productsController.updateProduct)
    .delete(authenticateToken,productsController.deleteProduct);


router.route('/fetchProducts')
// authenticateToken, 
    .post(productsController.getProducts);

module.exports = router;