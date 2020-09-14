var express = require('express');
var router = express.Router();

var employeeController = require("../controllers/employee.controller");

router.route('/')
    // .get(getCustomers)
    .post(employeeController.getEmployees);

router.route('/validate')
    .post(employeeController.validateEmployee);

router.route('/dashboards/:employeeId')
    .get(employeeController.getAllEmployeeDasboards);


module.exports = router;