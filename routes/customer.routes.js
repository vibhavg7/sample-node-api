var express = require('express');
var router = express.Router();

var customerController = require("../controllers/customer.controller");
var orderController = require("../controllers/order.controller");
router.route('/register')
    .post(customerController.registerCustomer);

router.route('/validate')
    .post(customerController.validateCustomer);

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

// router.route('/deleteAddress/:addressId')

router.route('/customeraddressoncart/:customerId')
    .get(customerController.getCustomerAddresses);


router.route('/customerinfo/:customerId')
    .get(customerController.getCustomer)
    .put(customerController.updateCustomer)
    .delete(customerController.deleteCustomer);

router.route('/updateOrder/:orderId')
    .put(customerController.updateOrderStatusByCustomer);

module.exports = router;