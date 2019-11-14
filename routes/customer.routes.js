var express = require('express');
var router = express.Router();

var customerController = require("../controllers/customer.controller");

router.route('/')
    // .get(getCustomers)
    .post(customerController.createCustomer);

router.route('/customerinfo')
    .post(customerController.fetchAllCustomers);

router.route('/customerinfo/customerorders')
    .post(customerController.fetchCustomerOrdersById)

router.route('/customerinfo/:customerId')
    .get(customerController.getCustomer)
    .put(customerController.updateCustomer)
    .delete(customerController.deleteCustomer);
// .post(createCustomer);

module.exports = router;