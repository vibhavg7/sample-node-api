var jwt = require('jsonwebtoken');
var rp = require('request-promise');
var async = require("async");
var request = require('request');
var pool = require('../../utils/manageDB');
var createError = require('http-errors');

exports.autosuggest = function (req, res, next) {

}


exports.reverseGeocode = function (req, res, next) {

    var MAP_API_KEY = process.env.MAP_API_KEY;
    var latlng = req.query.lat + ',' + req.query.lng;
    var BASE_URL = "https://maps.googleapis.com/maps/api/geocode/json?latlng=";
    var url = BASE_URL + latlng + "&key=" + MAP_API_KEY + "&sensor=" + true;


    try {
        request(url, function (error, response, body) {
            if (!error && response.statusCode === 200) {
                res.json({
                    "status": 200,
                    "message": "suggested locations Details",
                    "suggestedLocations": JSON.parse(body)
                });
            } else {
                next(createError(401, error));
                // res.json({
                //     "status": 400,
                //     "message": "suggested locations Details not found",
                //     "error": body
                // });
            }
        });
    }
    catch (err) {
        next(createError(401, err));
    } finally {
        // pool.end();
    }

}