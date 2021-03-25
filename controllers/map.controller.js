var mysql = require('mysql');
var jwt = require('jsonwebtoken');
var rp = require('request-promise');
var async = require("async");
var request = require('request');
var pool = mysql.createPool({
    connectionLimit: 10,
    host: 'grostep-database.c8zeozlsfjcx.ap-south-1.rds.amazonaws.com',
    user: 'root',
    password: process.env.dbpassword,
    database: 'grostep'
});


exports.autosuggest = function (req, res, next) {

}


exports.reverseGeocode = function (req, res, next) {

    console.log(process.env);
    var API_KEY = process.env['API_KEY'];
    var latlng = req.query.lat + ',' + req.query.lng;

    var BASE_URL = "https://maps.googleapis.com/maps/api/geocode/json?latlng=";




    var url = BASE_URL + latlng + "&key=" + API_KEY + "&sensor=" + true;

    console.log(url);

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