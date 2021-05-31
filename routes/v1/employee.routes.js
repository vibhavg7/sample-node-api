var express = require('express');
var router = express.Router();
var authenticateToken = require('../../services/authenticateToken');
var employeeController = require("../../controllers/v1/employee.controller");

router.post('/', employeeController.getEmployees);

router.route('/validate').post(employeeController.validateEmployee);

router.get('/dashboards/:employeeId', employeeController.getAllEmployeeDasboards);

module.exports = router;