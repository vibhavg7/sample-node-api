var mysql = require('mysql');
var dbConn = mysql.createConnection({
    host: 'vibhavg91.cce5kiug4ajr.us-east-2.rds.amazonaws.com',
    user: 'root',
    password: process.env.password,
    database: 'grostep'
});
// connect to database
dbConn.connect();

exports.fetchAllActiveOffers= function(req,res){
    dbConn.query("SELECT * FROM vouchers",function (err, vouchers) {
        if (err) {
            res.json({
                status: 400,
                "message": "vouchers Information not found",
                "vouchers": vouchers[0]
            });
        }
        else {
            res.json({
                status: 200,
                "message": "vouchers Information",
                "vouchers": vouchers
            });
        }
    });
}

exports.fetchCouponInfoById = function (req, res) {
    // let sql = `CALL GET_STORE_INFO(?)`;
    dbConn.query("SELECT * FROM vouchers WHERE voucher_id = ? ", req.params.couponId, function (err, couponData) {
        if (err) {
            res.json({
                status: 400,
                "message": "Coupon Information not found",
                "coupon": couponData[0]
            });
        }
        else {
            res.json({
                status: 200,
                "message": "coupon Information",
                "coupon": couponData[0]
            });
        }
    });
}

exports.deleteCoupon = function (req, res) {
    dbConn.query("DELETE FROM vouchers WHERE voucher_id = ? ", req.params.couponId,
        function (err, couponData) {
            if (err) {
                console.log("error: ", err);
            }
            else {
                let deleted = false;
                if (couponData.affectedRows == 1) {
                    deleted = true;
                }
                res.json({
                    "message": (deleted) ? "coupon deleted successfully" : "invalid coupon id",
                    "status": (deleted) ? 200 : 400,
                    "voucher_id": req.params.couponId
                });
            }
        });
}

exports.updateCoupon = function (req, res) {
    const updateCoupon = req.body;
    dbConn.query("UPDATE grostep.vouchers SET ? WHERE voucher_id = ?", [updateCoupon, +req.params.couponId], function (err, couponData) {
        if (err) {
            console.log("error: ", err);
            res.json({
                status: 400,
                "message": "coupon Information not updated",
                "coupon": couponData
            });

        }
        else {
            res.json({
                status: 200,
                "message": "coupon Information updated",
                "coupon": couponData
            });
        }
    });
}

exports.addNewCoupon = function (req, res) {
    const newProduct = req.body;
    let sql = `CALL ADD_NEW_COUPON(?,?,?,?,?,?,?)`;

    let voucherCode = req.body.voucherCode;
    let voucherAmount = +req.body.voucherAmount;
    let expirydatetime =  null; //req.body.expirydatetime;
    let voucherCartAmount = +req.body.voucherCartAmount;
    let voucherType = +req.body.voucherType;
    let description = req.body.description;
    let status = +req.body.status;


    dbConn.query(sql, [voucherCode, voucherAmount, expirydatetime, voucherCartAmount, voucherType, description, status],
        function (err, coupon) {
            if (err) {
                console.log("error: ", err);
                res.json({
                    "message": "coupon not added",
                    "status": 400,
                    "coupon_id": 0
                });
            }
            else {
                res.json({
                    "status": 200,
                    "message": "coupon added",
                    "coupon_id": coupon[0][0]['coupon_id']
                });
            }
        });
}

exports.fetchAllOffers = function(req, res) {
    let sql = `CALL GET_ALL_VOUCHER_INFO(?,?,?)`;
    dbConn.query(sql, [+req.body.page_number, +req.body.page_size, req.body.filterBy],
        function (err, vouchers) {
            if (err) {
                console.log("error: ", err);
            }
            else {
                res.json({
                    "message": "voucher information",
                    "vouchers": vouchers[0],
                    "voucher_total_count": vouchers[1][0]
                });
            }
        });
}