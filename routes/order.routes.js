var express = require('express');
var router = express.Router();

var orderController = require("../controllers/order.controller");

router.route('/fetchallOrders')
    .post(orderController.fetchAllOrders);


router.route('/customerorders')
    .post(orderController.fetchCustomerOrders);

router.route('/customerliveorders')
    .post(orderController.fetchCustomerLiveOrders);

router.route('/customerliveorders/:orderId')
    .get(orderController.fetchCustomerLiveOrderDetailById);

router.route('/customerorderInfoById/:orderId')
    .get(orderController.fetchCustomerOrderDetailById);

router.route('/orderinfo/orderbill/merchantconfirmation')
    .post(orderController.merchantBillconfirmation);

router.route('/placeorder')
    .post(orderController.placeOrder);

router.route('/:orderId')
    .get(orderController.fetchOrderDetailsById)
    .put(orderController.updateOrder);

router.route('/orderinfo/orderbill/:orderId')
    .get(orderController.fetchOrderBillInformation);

router.route('/customerpaymentmethodscitywise')
    .post(orderController.fetchCustomerAllPaymentMethodsCityWise);



module.exports = router;