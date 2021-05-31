var express = require('express');
var router = express.Router();
var authenticateToken = require('../../services/authenticateToken');
var employeeController = require("../../controllers/v1/employee.controller");

router.post('/',authenticateToken, employeeController.getEmployees);

router.route('/login').post(employeeController.validateEmployee);

router.get('/dashboards/:employeeId',authenticateToken, employeeController.getAllEmployeeDasboards);

module.exports = router;