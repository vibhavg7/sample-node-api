var express = require('express');
var router = express.Router();

var deliveryController = require("../controllers/delivery.controller");

router.route('/addnewdeliveryperson')
    .post(deliveryController.addNewDeliveryPerson);

router.route('/deliveryinfo')
    .post(deliveryController.fetchAllDeliveryPersons);

router.route('/deliveryinfo/:deliveryPersonId')
    .get(deliveryController.fetchDeliveryPersonInfoById)
    .put(deliveryController.updateDeliveryPerson);
module.exports = router;
