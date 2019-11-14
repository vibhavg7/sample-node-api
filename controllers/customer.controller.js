var mysql = require('mysql');
var dbConn = mysql.createConnection({
    host: 'vibhavg91.cce5kiug4ajr.us-east-2.rds.amazonaws.com',
    user: 'root',
    password: 'password',
    database: 'grostep'
});
// connect to database
dbConn.connect();

exports.fetchAllCustomers = function(req, res) {
   
    let sql = `CALL GET_ALL_CUSTOMERS(?,?,?)`;
    dbConn.query(sql,[+req.body.page_number,+req.body.page_size,req.body.filterBy], 
        function (err, customers) {
        if (err) {
            console.log("error: ", err);
        }
        else {
            res.json({
                "message":"customers information",
                "customers": customers[0],
                "customer_total_count":customers[1][0]
            });
        }
    });
}

exports.createCustomer = function(req, res) {
    const newCustomer = req.body;
    dbConn.query("INSERT INTO customer set ?", newCustomer, function (err, customer) {

        if (err) {
            console.log("error: ", err);
        }
        else {
            console.log(JSON.stringify(customer.insertId));
            res.json({
                "message":"Customer created",
                "customer_id":customer.insertId
            });
        }
    });
}

exports.fetchCustomerOrdersById = function(req,res) {
    let sql = `CALL GET_CUSTOMER_ORDERS(?,?,?,?)`;
    dbConn.query(sql,[+req.body.customerId,+req.body.page_number,+req.body.page_size,req.body.filterBy], 
        function (err, customerOrders) {
        if (err) {
            console.log("error: ", err);
            res.json({
                status:400,
                "message":"Customer orders Information not found",
                "customer_orders_info": customerOrders[0],
                "customer_order_count":customerOrders[1]
            });
        }
        else {
            res.json({
                status:200,
                "message":"Customer orders Information",
                "customer_orders_info": customerOrders[0],
                "customer_order_count":customerOrders[1]
            });
        }
    });
}

exports.getCustomer = function(req, res)
{
    let sql = `CALL GET_CUSTOMER_DETAIL(?)`;
    dbConn.query(sql, req.params.customerId,function (err, customer) {
        if (err) {
            console.log("error: ", err);
        }
        else {
            res.json({
                "message" : "Customer Information",
                "status":200,
                "customer_info":customer[0],
                "customer_delivery_addresses":customer[1]
            });
            // res.json(customer);
        }
    });
}

exports.deleteCustomer = function(req, res)
{
    dbConn.query("DELETE FROM customer WHERE customer_id = ? ", req.params.customerId,function (err, customer) {
        if (err) {
            console.log("error: ", err);
        }
        else {
            console.log(JSON.stringify(customer));
            res.json(customer);
        }
    });
}

exports.updateCustomer = function(req, res)
{
    const updateCustomer =  req.body;
    dbConn.query("UPDATE customer SET ? WHERE customer_id = ?", [updateCustomer, req.params.customerId],function (err, customer) {
        if (err) {
            console.log("error: ", err);
        }
        else {
            console.log(JSON.stringify(customer));
            res.json(customer);
        }
    });
}
