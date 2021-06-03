var express = require('express');
var router = express.Router();

var customerController = require("../../controllers/v1/customer.controller");
var orderController = require("../../controllers/v1/order.controller");
var cartController = require("../../controllers/v1/cart.controller");

var authenticateToken = require('../../services/authenticateToken');

router.route('/register')
    .post(customerController.registerCustomer);

router.route('/registerCustomerFromAdminPanel')
    .post(authenticateToken, customerController.registerCustomerFromAdminPanel);

router.route('/updateCustomerFromAdminPanel/:customerId')
    .put(customerController.updateCustomerFromAdminPanel);

router.route('/resendOTP/:customerId')
    .get(customerController.resendOTP);

router.route('/validate')
    .post(customerController.validateCustomer);

router.route('/addCustomerFeedback')
    .post(authenticateToken, customerController.addCustomerFeedback);

router.route('/customerFeedback')
    .post(authenticateToken, customerController.getCustomerFeedbacks);

router.route('/customerFeedbackInfo/:feedBackId')
    .post(authenticateToken, customerController.getFeedbackDetailById);

router.route('/customerinfo')
    .post(authenticateToken, customerController.fetchAllCustomers);

router.route('/customerinfo/customerorders')
    .post(authenticateToken, orderController.fetchCustomerOrders);

router.route('/customeraddress')
    .post(customerController.addDelievryAddress);

router.route('/customeraddress/selectaddress/:addressId')
    .put(customerController.updateSelectedAddress);

router.route('/authenticateservicelocation')
    .post(customerController.authenticateservicelocation);


router.route('/customeraddress/:addressId')
    .get(customerController.getAddressInfo)
    .put(customerController.updateAddress)
    .delete(customerController.deleteAddress);

router.route('/customeraddressoncart/:customerId')
    .post(customerController.getCustomerAddresses);

router.route('/customerselectedaddresscitywise/:customerId')
    .post(customerController.getCustomerSelectedAddressCityWise);


router.route('/customerinfo/:customerId')
    .get(authenticateToken, customerController.getCustomer)
    .put(customerController.updateCustomer)
    .delete(customerController.deleteCustomer);

router.route('/updateOrder/:orderId')
    .put(customerController.updateOrderStatusByCustomer);

router.route('/subscribeUser')
    .post(customerController.subscribeUser);


router.route('/subscriptioninfo')
    .post(authenticateToken, customerController.getSubcriptions);

router.route('/subscriptioninfo/:subscriptionId')
    .post(customerController.getSubscriptionDetailById);

//need to check
router.route('/sendUserNotificationFromAdminPanel')
    .post(customerController.sendUserNotificationFromAdminPanel);

module.exports = router;