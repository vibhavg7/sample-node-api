// var connect_aws_grostep = require('../models/database');
var mysql = require('mysql');
var dbConn = mysql.createConnection({
    host: 'vibhavg91.cce5kiug4ajr.us-east-2.rds.amazonaws.com',
    user: 'root',
    password: 'password',
    database: 'grostep'
});
// connect to database
dbConn.connect(); 

exports.getProducts = function(req, res) {
   
    // const conn = connect_aws_grostep;
    let sql = `CALL GET_PRODUCTSINFO(?,?,?)`;
    dbConn.query(sql, [+req.body.page_number, +req.body.page_size,req.body.filterBy], function (err, products) {
        if (err) {
            // console.log("error: ", err);
            res.json({
                "message": "Problem fetching Products list ",
                "status": 400,
                "product_id": 0
            });
        }
        else {
            res.json({
                "message": "Product list",
                "products": products[0],
                "products_total_count": products[1][0]
            });
        }
    });
}