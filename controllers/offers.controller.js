var mysql = require('mysql');

var pool = mysql.createPool({
    connectionLimit: 10,
    host: 'grostep-database.c8zeozlsfjcx.ap-south-1.rds.amazonaws.com',
    user: 'root',
    password: process.env.dbpassword,
    database: 'grostep'
});

exports.searchActiveCouponByName = function(req,res) {

    let sql = `CALL SEARCH_VOUCHER_BY_NAME(?,?)`;

    let voucherCode = req.body.voucherCode;
    let cartAmount = +req.body.cartAmount;
    console.log(voucherCode);
    pool.getConnection(function (err, dbConn) {
        dbConn.query(sql, [voucherCode, cartAmount],
            function (err, voucherInfo) {
                console.log(voucherInfo);
                if (err) {
                    console.log("error: ", err);
                    res.json({
                        "message": "coupon not found",
                        "status": 400,
                        "coupon": []
                    });
                }
                else {
                    res.json({
                        "status": 200,
                        "message": "coupon information",
                        "coupon": voucherInfo[0]
                    });
                }
                dbConn.release();
            });
    });
}

exports.fetchAllActiveOffers = function (req, res) {
    pool.getConnection(function (err, dbConn) {
        dbConn.query("SELECT * FROM vouchers where status = 1", function (err, vouchers) {
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
            dbConn.release();
        });
    });
}

exports.fetchCouponInfoById = function (req, res) {
    pool.getConnection(function (err, dbConn) {
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
            dbConn.release();
        });
    });
}

exports.deleteCoupon = function (req, res) {
    pool.getConnection(function (err, dbConn) {
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
                dbConn.release();
            });
    });
}

exports.updateCoupon = function (req, res) {
    const updateCoupon = req.body;
    pool.getConnection(function (err, dbConn) {
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
            dbConn.release();
        });
    });
}

exports.addNewCoupon = function (req, res) {
    const newProduct = req.body;
    let sql = `CALL ADD_NEW_COUPON(?,?,?,?,?,?,?)`;

    let voucherCode = req.body.voucherCode;
    let voucherAmount = +req.body.voucherAmount;
    let expirydatetime = null;
    let voucherCartAmount = +req.body.voucherCartAmount;
    let voucherType = +req.body.voucherType;
    let description = req.body.description;
    let status = +req.body.status;

    pool.getConnection(function (err, dbConn) {
        dbConn.query(sql, [voucherCode, voucherAmount, expirydatetime, 
            voucherCartAmount, voucherType, description, status],
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
                dbConn.release();
            });
    });
}

exports.fetchAllOffers = function (req, res) {
    let sql = `CALL GET_ALL_VOUCHER_INFO(?,?,?)`;
    pool.getConnection(function (err, dbConn) {
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
                dbConn.release();
            });
    });
}