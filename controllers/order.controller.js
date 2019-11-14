var mysql = require('mysql');
var dbConn = mysql.createConnection({
    host: 'vibhavg91.cce5kiug4ajr.us-east-2.rds.amazonaws.com',
    user: 'root',
    password: 'password',
    database: 'grostep'
});
// connect to database
dbConn.connect();


exports.fetchOrderDetailsById = function(req, res) {
    let sql = `CALL GET_ORDER_INFO(?)`;
    dbConn.query(sql,[+req.params.orderId], 
        function (err, orderData) {
        if (err) {
            console.log("error: ", err);
            res.json({
                status:400,
                "message":"order information not found",
                "customerInfo": [],
                "storeInfo":[],
                "paymentInfo":[]
            });  
        }
        else {
            res.json({
                "message":"order information",
                "status":200,
                "customerInfo": orderData[0],
                "storeInfo": orderData[1],
                "paymentInfo":orderData[2]
            });
        }
    });
}