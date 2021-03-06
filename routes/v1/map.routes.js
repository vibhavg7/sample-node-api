var express = require('express');
var router = express.Router();

var mapController = require("../../controllers/v1/map.controller");


router.route('/autosuggest')
    .get(mapController.autosuggest);

router.route('/reverse-geocode')
    .get(mapController.reverseGeocode);


module.exports = router;