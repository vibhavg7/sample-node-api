var express = require('express');
var router = express.Router();

var servicableareaController = require("../../controllers/v2/servicablearea.controller");
var authenticateToken = require('../../services/authenticateToken');


router.route('/areainfo/citywise')
    .post(servicableareaController.servicableAreaInfoCityWise);

    module.exports = router;