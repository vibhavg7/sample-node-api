var jwt = require('jsonwebtoken');
var rp = require('request-promise');
var async = require("async");
var request = require('request');
var pool = require('../../utils/manageDB');

exports.autosuggest = function (req, res, next) {

}


exports.reverseGeocode = function (req, res, next) {

    var API_KEY = process.env.HTTP_PROXY;
    var latlng = req.query.lat + ',' + req.query.lng;
    var BASE_URL = "https://maps.googleapis.com/maps/api/geocode/json?latlng=";
    var url = BASE_URL + latlng + "&key=" + API_KEY + "&sensor=" + true;
    request(url, function (error, response, body) {
        if (!error && response.statusCode === 200) {
            res.json({
                "status": 200,
                "message": "suggested locations Details",
                "suggestedLocations": JSON.parse(body)
            });
        } else {
            res.json({
                "status": 400,
                "message": "suggested locations Details not found",
                "error": body
            });
        }
    });
}