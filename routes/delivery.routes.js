var express = require('express');
var router = express.Router();

var deliveryController = require("../controllers/delivery.controller");
var orderController = require("../controllers/order.controller");

router.route('/addnewdeliveryperson')
    .post(deliveryController.addNewDeliveryPerson);

router.route('/register')
    .post(deliveryController.registerDeliveryPerson);

router.route('/validate')
    .post(deliveryController.validateDeliveryPerson);

router.route('/deliveryinfo')
    .post(deliveryController.fetchAllDeliveryPersons);

// router.route('/fetchactiveorders')
//     .get(orderController.fetchDeliveryBoyOrders);

router.route('/deliverypersonorderscount/:deliveryPersonId')
    .get(orderController.fetchDeliveryPersonOrderCountById);

router.route('/fetchAllNewOrders')
    .get(deliveryController.fetchAllNewOrders);

router.route('/deliveryinfo/:deliveryPersonId')
    .get(deliveryController.fetchDeliveryPersonInfoById)
    .put(deliveryController.updateDeliveryPerson);

router.route('/updateorder/:orderId')
    .put(deliveryController.updateOrderStatusByDeliveryPerson);
module.exports = router;
