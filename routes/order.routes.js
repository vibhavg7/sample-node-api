var express = require('express');
var router = express.Router();

var orderController = require("../controllers/order.controller");

router.route('/orderinfo/orderbill/:orderId')
    .get(orderController.fetchOrderBillInformation);

router.route('/customerorders')
    .post(orderController.fetchCustomerOrders);

router.route('/orderinfo/orderbill/merchantconfirmation')
    .post(orderController.merchantBillconfirmation);

router.route('/placeorder')
    .post(orderController.placeOrder);

router.route('/:orderId')
    .get(orderController.fetchOrderDetailsById)
    .put(orderController.updateOrder);

module.exports = router;