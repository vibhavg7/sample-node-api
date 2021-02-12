var express = require('express');
var router = express.Router();

var cartController = require("../controllers/cart.controller");


router.route('/validatecartitems')
    .post(cartController.validateCartItems);

router.route('/addNewProductsToCart')
    .post(cartController.addNewProductsToCart);

router.route('/updateProductToCart')
    .put(cartController.updateProductToCart);

router.route('/fetchCustomerCart')
    .get(cartController.fetchCustomerCart);

router.route('/deleteCustomerCart/:customerId')
    .delete(cartController.deleteCustomerCart);

router.route('/deleteProductFromCustomerCart/:customerId')
    .delete(cartController.deleteProductFromCustomerCart);

router.route('/')
    .post(cartController.syncCartItems);


module.exports = router;