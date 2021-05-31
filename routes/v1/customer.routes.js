var express = require('express');
var router = express.Router();

var customerController = require("../../controllers/v1/customer.controller");
var orderController = require("../../controllers/v1/order.controller");
router.route('/register')
    .post(customerController.registerCustomer);

router.route('/registerCustomerFromAdminPanel')
    .post(customerController.registerCustomerFromAdminPanel);

router.route('/updateCustomerFromAdminPanel/:customerId')
    .put(customerController.updateCustomerFromAdminPanel);

router.route('/resendOTP/:customerId')
    .get(customerController.resendOTP);

router.route('/validate')
    .post(customerController.validateCustomer);

router.route('/addCustomerFeedback')
    .post(customerController.addCustomerFeedback);

router.route('/customerFeedback')
    .post(customerController.getCustomerFeedbacks);

router.route('/customerFeedbackInfo/:feedBackId')
    .post(customerController.getFeedbackDetailById);

router.route('/customerinfo')
    .post(customerController.fetchAllCustomers);

router.route('/customerinfo/customerorders')
    .post(orderController.fetchCustomerOrders);

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
    .get(customerController.getCustomer)
    .put(customerController.updateCustomer)
    .delete(customerController.deleteCustomer);

router.route('/updateOrder/:orderId')
    .put(customerController.updateOrderStatusByCustomer);

router.route('/subscribeUser')
    .post(customerController.subscribeUser);


router.route('/subscriptioninfo')
    .post(customerController.getSubcriptions);

router.route('/subscriptioninfo/:subscriptionId')
    .post(customerController.getSubscriptionDetailById);

    //need to check
router.route('/sendUserNotificationFromAdminPanel')
    .post(customerController.sendUserNotificationFromAdminPanel);

module.exports = router;