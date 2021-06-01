var express = require('express');
var router = express.Router();

var cartController = require("../../controllers/v1/cart.controller");
var authenticateToken = require('../../services/authenticateToken');

router.route('/customercarts')
    .post(authenticateToken, cartController.fetchCustomerCarts);

router.route('/cartproducts/:cartId')
    .get(authenticateToken, cartController.fetchCartProducts);


router.route('/fetchallcart')
    .post(authenticateToken, cartController.fetchAllCartData);


router.route('/validateStoreCartProducts')
    .post(cartController.validateStoreCartProducts);

// router.route('/addNewProductsToCart')
//     .post(cartController.addNewProductsToCart);

// router.route('/updateProductToCart')
//     .put(cartController.updateProductToCart);

// router.route('/fetchCustomerCart')
//     .get(cartController.fetchCustomerCart);

// router.route('/deleteCustomerCart/:customerId')
//     .delete(cartController.deleteCustomerCart);

// router.route('/deleteProductFromCustomerCart/:customerId')
//     .delete(cartController.deleteProductFromCustomerCart);

// router.route('/')
//     .post(cartController.syncCartItems);

router.route('/cart')
    .post(cartController.createNewCustomerCart);

router.route('/cart/:cart_id')
    .put(cartController.updateCustomerCartById);

module.exports = router;