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

exports.fetchOrderCount = function(req,res){

    let sql = `CALL GET_ORDER_TYPE_COUNT(?)`;
    dbConn.query(sql,[+req.body.merchantId], 
        function (err, orderCount) {
        if (err) {
            console.log("error: ", err);
            res.json({
                status:400,
                "message":"order information not found",
            });  
        }
        else {
            res.json({
                "message":"orders count information",
                "status":200,
                "new_orders_count": orderData[0],
                "pending_orders_count": orderData[1],
                "picked_orders_count": orderData[2]
            });
        }
    });
}

exports.merchantBillconfirmation = function(req,res){
    let sql = `CALL ORDER_BILL_CONFIRMATION(?,?,?)`;
    dbConn.query(sql,[+req.body.order_id,+req.body.bill_amount,+req.body.order_status], 
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