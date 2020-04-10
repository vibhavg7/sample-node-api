var express = require('express');
var router = express.Router();

var cartController = require("../controllers/cart.controller");

router.route('/validatecartitems')
    .post(cartController.validateCartItems);

module.exports = router;