var express = require('express');
var router = express.Router();

var orderController = require("../controllers/order.controller");


router.route('/:orderId')
    .get(orderController.fetchOrderDetailsById);


module.exports = router;