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

exports.getEmployees =function(req, res) {
    let sql = `CALL GET_ALL_Employees(?,?,?)`;
    dbConn.query(sql, [+req.body.page_number, +req.body.page_size, req.body.filterBy], function (err, employees) {
        if (err) {
            // console.log("error: ", err);
            res.json({
                "status": 401,
                "message": "Employee Details not found",
                "employeeData": employees[0]
            });
        }
        else {
            res.json({
                "message": "Employees list",
                "employees": employees[0],
                "employees_total_count": employees[1][0]
            });
        }
    });
}

exports.validateEmployee = function(req, res) {
    let sql = `CALL validateEmployee(?,?)`;
    console.log(req.body.user_name + " " +req.body.password);
    dbConn.query(sql, [req.body.user_name, req.body.password], function (err, employeeData) {
        // res.json(employeeData);
        if (err) {
            res.json({
                "status": 401,
                "message": "Employee Details not found",
                "employeeData": employeeData[0]
            });
        }
        else {
            res.json({
                "status": 200,
                "message": "Employee Details",
                "employeeData": employeeData[0]
            });
        }
    });
}