var moment = require('moment');
var pool = require('../../utils/manageDB');
var createError = require('http-errors');
exports.searchActiveCouponByName = function (req, res) {

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
    const customerId = +req.params.customerId || 0;
    let sql = `CALL FETCH_CUSTOMER_OFFERS(?)`;
    pool.getConnection(function (err, dbConn) {
        dbConn.query(sql, [
            customerId],
            function (err, offersData) {
                // console.log(offersData[0]);
                if (err) {
                    console.error(err);
                    res.json({
                        status: 400,
                        "message": "offers not fetched",
                        "vouchers": []
                    });
                }
                else {
                    res.json({
                        "status": 200,
                        "message": "offers sucessfully fetched",
                        "vouchers": offersData[0]
                    });
                }
                dbConn.release();
            });
    });
}

exports.fetchCouponInfoById = async function (req, res, next) {
    let sql = `SELECT * FROM coupon WHERE coupon_id = ? `;
    try {
        const couponData = await pool.query(sql, [ +req.params.couponId]);
        res.json({
            status: 200,
            "message": "coupon information",
            "coupon": couponData[0]
        });
    }
    catch (err) {
        next(createError(401, err));
    } finally {
        // pool.end();
    }
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
    let utcMoment = moment.utc();
    req.body.coupon_last_updated = new Date(utcMoment);
    const updateCoupon = req.body;
    console.log(updateCoupon);
    pool.getConnection(function (err, dbConn) {
        dbConn.query("UPDATE grostep.coupon SET ? WHERE coupon_id = ?", [updateCoupon, +req.params.couponId], function (err, couponData) {
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
    let sql = `CALL ADD_NEW_COUPON(?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`;

    let calculationType = +req.body.calculationType;
    let startdatetime = req.body.startdatetime;
    let enddatetime = req.body.enddatetime;
    let couponMaxUsageCount = +req.body.couponMaxUsageCount;
    let couponCode = req.body.couponCode;
    let description = req.body.description;
    let couponMaxLimit = +req.body.couponMaxLimit;
    let couponMaxLimitUser = +req.body.couponMaxLimitUser;
    let couponMinCartAmount = +req.body.couponMinCartAmount;
    let voucherValue = +req.body.couponValue;
    let createdBy = req.body.createdBy;
    let customerId = +req.body.customerId;
    let storeId = +req.body.storeId;
    // let city = 4;
    let couponType = +req.body.couponType;
    let status = +req.body.status;

    pool.getConnection(function (err, dbConn) {
        dbConn.query(sql, [couponCode, voucherValue, startdatetime, enddatetime,
            couponMinCartAmount, description, status, createdBy,
            couponMaxUsageCount, couponMaxLimit, couponMaxLimitUser, calculationType,
            customerId, storeId, couponType],
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

exports.fetchAllCoupons = async function (req, res, next) {
    let sql = `CALL GET_ALL_COUPONS(?,?,?)`;
    try {
        const coupon = await pool.query(sql, [+req.body.page_number, +req.body.page_size, req.body.filterBy]);
        res.json({
            "message": "coupon information",
            "coupons": coupon[0],
            "coupon_total_count": coupon[1][0]
        });
    }
    catch (err) {
        next(createError(401, err));
    } finally {
        // pool.end();
    }
}