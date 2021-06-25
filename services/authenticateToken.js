var createError = require('http-errors');
var jwt = require('jsonwebtoken');
var pool = require('../utils/manageDB');
const authenticateToken = function (req, res, next) {
    const authHeader = req.headers['authorization'];
    const app_client = req.headers['appclient'];
    const token = authHeader && authHeader.split(' ')[1];
    let sql = "";
    if (token == null) {
        res.sendStatus(401);
        return;
    }
    jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, async (err, user) => {
        console.log(user.name);
        if (err) {
            next(createError(403, err));
        }
        try {
            switch (app_client) {
                case "adminpanel":
                    sql = `select * from employee WHERE status = 1 and username = ?`;
                    // console.log('adminpanel');
                    break;
                case "customer_mobileapp":
                    sql = `select * from customer WHERE customer_id = ?`;
                    // console.log('customer_mobileapp');
                    break;
            }
            console.log(sql);
            const userData = await pool.query(sql, [user.name]);
            console.log(userData);
            if (userData.length > 0) {
                req.user = user;
                // console.log(req.user);
                // console.log('hey');
            } else {
                res.sendStatus(403);
                return;
            }
        } catch (err) {
            next(createError(401, err));
        }
        next();
    });

}

module.exports = authenticateToken;