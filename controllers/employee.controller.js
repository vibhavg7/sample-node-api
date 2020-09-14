var mysql = require('mysql');

var pool = mysql.createPool({
    connectionLimit: 10,
    host: 'grostep-database.c8zeozlsfjcx.ap-south-1.rds.amazonaws.com',
    user: 'root',
    password: process.env.dbpassword,
    database: 'grostep'
});

exports.getEmployees =function(req, res) {
    let sql = `CALL GET_ALL_Employees(?,?,?)`;
    pool.getConnection(function (err, dbConn) {
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
            dbConn.release();
        });    
    });

}

exports.getAllEmployeeDasboards =  function(req, res) {
    let sql = `CALL GET_EMPLOYEE_DASHBOARDS(?)`;
    pool.getConnection(function (err, dbConn) {
        dbConn.query(sql, [+req.params.employeeId],
            function (err, employeeDashboard) {
                if (err) {
                    console.log("error: ", err);
                    res.json({
                        status: 400,
                        "message": "dashboard Information not found",
                        "employee_dashboard_info": [],
                        "employee_dashboard_count": []
                    });
                }
                else {
                    res.json({
                        status: 200,
                        "message": "dashboard Information",
                        "employee_dashboard_info": employeeDashboard[0],
                        "employee_dashboard_count": employeeDashboard[1]
                    });
                }
                dbConn.release();
            });
    });
}

exports.validateEmployee = function(req, res) {
    let sql = `CALL validateEmployee(?,?)`;
    pool.getConnection(function (err, dbConn) {
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
            dbConn.release();
        });
    });
}