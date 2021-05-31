var pool = require('../../utils/manageDB');

var jwt = require('jsonwebtoken');
var createError = require('http-errors');

exports.getEmployees = async function (req, res, next) {
    let sql = `CALL GET_ALL_Employees(?,?,?)`;
    try {
        const employees = await pool.query(sql, [+req.body.page_number, +req.body.page_size, req.body.filterBy]);
        res.json({
            "status": 200,
            "message": "Employees list",
            "employees": employees[0],
            "employees_total_count": employees[1][0]
        });
    }
    catch (err) {
        next(createError(401, err));
    } finally {
        // pool.end();
    }
}

exports.getAllEmployeeDasboards = async function (req, res, next) {
    let sql = `CALL GET_EMPLOYEE_DASHBOARDS(?)`;
    try {
        const employeeDashboard = await pool.query(sql, [+req.params.employeeId]);
        res.json({
            "status": 200,
            "message": "dashboard Information",
            "employee_dashboard_info": employeeDashboard[0],
            "employee_dashboard_count": employeeDashboard[1]
        });
    }
    catch (err) {
        next(createError(401, err));
    } finally {
        // pool.end();
    }
}

exports.validateEmployee = async function (req, res, next) {
    let sql = `CALL validateEmployee(?,?)`;
    try {
        const employeeData = await pool.query(sql, [req.body.user_name, req.body.password]);
        const user = {name: req.body.user_name};
        var acesssToken = jwt.sign(user, process.env.ACCESS_TOKEN_SECRET);
        res.json({
            "status": 200,
            "message": "Employee Details",
            "employeeData": employeeData[0][0],
            "employeeClaims": employeeData[1],
            "token": acesssToken
        });
    }
    catch (err) {
        next(createError(401, err));
    } finally {
        // pool.end();
    }
}