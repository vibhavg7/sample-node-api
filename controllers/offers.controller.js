var mysql = require('mysql');
var dbConn = mysql.createConnection({
    // host: 'vibhavg91.cce5kiug4ajr.us-east-2.rds.amazonaws.com',
    // user: 'root',
    // password: 'password',
    // database: 'grostep'
    host: 'localhost',
    user: 'root',
    password: 'root',
    database: 'grostep'
});
// connect to database
dbConn.connect();

exports.fetchOrderBillInformation = function(req,res){

    let sql = `CALL GET_ORDER_BILLINFO(?)`;
    dbConn.query(sql,[+req.params.orderId], 
        function (err, orderData) {
        if (err) {
            console.log("error: ", err);
            res.json({
                status:400,
                "message":"order bill information not found",
            });  
        }
        else {
            res.json({
                "message":"order bill information",
                "status":200,
                "billInfo": orderData[0]
            });
        }
    });
}