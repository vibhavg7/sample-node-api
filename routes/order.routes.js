var express = require('express');
var router = express.Router();

var orderController = require("../controllers/order.controller");

router.route('/orderinfo/orderbill/:orderId')
    .get(orderController.fetchOrderBillInformation);

router.route('/:orderId')
    .get(orderController.fetchOrderDetailsById);




module.exports = router;