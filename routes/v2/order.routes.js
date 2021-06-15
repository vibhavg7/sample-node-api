var express = require('express');
var router = express.Router();

var orderController = require("../../controllers/v1/order.controller");
var authenticateToken = require('../../services/authenticateToken');


router.route('/fetchallOrders')
    .post(authenticateToken, orderController.fetchAllOrders);

router.route('/fetchOrderStatusTypes')
    .get(authenticateToken, orderController.fetchOrderStatusTypes);


router.route('/customerorders')
    .post(orderController.fetchCustomerOrders);

router.route('/customerliveorders')
    .post(orderController.fetchCustomerLiveOrders);

router.route('/customerliveordercount/:customerId')
    .get(orderController.fetchCustomerLiveOrderCount);



router.route('/customerliveorders/:orderId')
    .get(orderController.fetchCustomerLiveOrderDetailById);

router.route('/customerorderInfoById/:orderId')
    .get(orderController.fetchCustomerOrderDetailById);

router.route('/orderinfo/orderbill/merchantconfirmation')
    .post(orderController.merchantBillconfirmation);

router.route('/placeorder')
    .post(orderController.placeOrder);

router.route('/cancelOrderByCustomer/:orderId')
    .put(orderController.cancelOrderByCustomer);

router.route('/:orderId')
    .get(orderController.fetchOrderDetailsById)
    .put(orderController.updateOrder);

router.route('/orderinfo/orderbill/:orderId')
    .get(orderController.fetchOrderBillInformation);

router.route('/customerpaymentmethodscitywise')
    .post(orderController.fetchCustomerAllPaymentMethodsCityWise);



module.exports = router;