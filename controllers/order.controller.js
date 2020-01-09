var mysql = require('mysql');
var dbConn = mysql.createConnection({
    host: 'vibhavg91.cce5kiug4ajr.us-east-2.rds.amazonaws.com',
    user: 'root',
    password: process.env.password,
    database: 'grostep'
});
// connect to database
dbConn.connect();

exports.placeOrder = function (req, res) {
    
    let sql = `CALL PLACE_CUSTOMER_ORDER(?,?,?,?,?,?,?,?,?,?,?,?,?,?)`;
    dbConn.query(sql,[
        +req.body.customerid,
        +req.body.storeid,
        +req.body.deliverypersonid,
        +req.body.voucherid,
        +req.body.totalamount,
        +req.body.discountamount,
        +req.body.deliveryfee,
        +req.body.payableamount,
        +req.body.paymentmode,
        +req.body.deliveryaddressid,
        +req.body.totalitemcount,
        +req.body.delivernow,
        req.body.deliverydate,
        req.body.deliveryslot], 
        function (err, orderData) {
        if (err) {
            res.json({
                status:400,
                "message":"order not found placed",
                "order_id": 0
            });  
        }
        else {
            if(orderData[0][0]['order_id']) {
                let keys = ['id','quantity','orderid']
                let values = req.body.products.map((obj) => {
                    return keys.map((key) => {
                        if(key == 'orderid') {
                            return orderData[0][0]['order_id'];
                        }
                        return obj[key];
                    })
                });               
                var sql = "INSERT INTO grostep.order_products_info (store_product_id, quantity,order_id) VALUES ?";
                dbConn.query(sql, [values], function(err) {
                    if (err) { 
                        throw err;
                    } else {
                        res.json({
                            "status": 200,
                            "message": "order sucessfully placed added",
                            "order_id": orderData[0][0]['order_id']
                        });
                    }
                    dbConn.end();
                });
            }
        }
    });
}


exports.fetchOrderBillInformation = function (req, res) {

    let sql = `CALL GET_ORDER_BILLINFO(?)`;
    dbConn.query(sql, [+req.params.orderId],
        function (err, orderData) {
            if (err) {
                console.log("error: ", err);
                res.json({
                    status: 400,
                    "message": "order bill information not found",
                });
            }
            else {
                res.json({
                    "message": "order bill information",
                    "status": 200,
                    "billInfo": orderData[0]
                });
            }
        });
}

exports.fetchOrderCount = function (req, res) {

    let sql = `CALL GET_ORDER_TYPE_COUNT(?)`;
    dbConn.query(sql, [+req.body.merchantId],
        function (err, orderCount) {
            if (err) {
                console.log("error: ", err);
                res.json({
                    status: 400,
                    "message": "order information not found",
                });
            }
            else {
                res.json({
                    "message": "orders count information",
                    "status": 200,
                    "new_orders_count": orderData[0],
                    "pending_orders_count": orderData[1],
                    "picked_orders_count": orderData[2]
                });
            }
        });
}

exports.merchantBillconfirmation = function (req, res) {
    let sql = `CALL ORDER_BILL_CONFIRMATION(?,?,?)`;
    dbConn.query(sql, [+req.body.order_id, +req.body.bill_amount, +req.body.order_status],
        function (err, orderData) {
            if (err) {
                console.log("error: ", err);
                res.json({
                    status: 400,
                    "message": "order bill information not found",
                });
            }
            else {
                res.json({
                    "message": "order bill information",
                    "status": 200,
                    "billInfo": orderData[0]
                });
            }
        });
}

exports.fetchOrderDetailsById = function (req, res) {
    let sql = `CALL GET_ORDER_INFO(?)`;
    dbConn.query(sql, [+req.params.orderId],
        function (err, orderData) {
            if (err) {
                console.log("error: ", err);
                res.json({
                    status: 400,
                    "message": "order information not found",
                    "customerInfo": [],
                    "storeInfo": [],
                    "paymentInfo": []
                });
            }
            else {
                res.json({
                    "message": "order information",
                    "status": 200,
                    "customerInfo": orderData[0],
                    "storeInfo": orderData[1],
                    "paymentInfo": orderData[2]
                });
            }
        });


}

exports.fetchCustomerOrders = function (req, res) {
    let sql = `CALL GET_CUSTOMER_ORDERS(?,?,?,?)`;
    dbConn.query(sql, [+req.body.customerId, +req.body.page_number, +req.body.page_size, req.body.filterBy],
        function (err, customerOrders) {
            if (err) {
                console.log("error: ", err);
                res.json({
                    status: 400,
                    "message": "Customer orders Information not found",
                    "customer_orders_info": customerOrders[0],
                    "customer_order_count": customerOrders[1]
                });
            }
            else {
                res.json({
                    status: 200,
                    "message": "Customer orders Information",
                    "customer_orders_info": customerOrders[0],
                    "customer_order_count": customerOrders[1]
                });
            }
        });
}