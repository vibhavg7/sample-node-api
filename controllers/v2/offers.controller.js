// var mysql = require('mysql');
// var moment = require('moment');
// var pool = mysql.createPool({
//     connectionLimit: 10,
//     host: 'grostep-database.c8zeozlsfjcx.ap-south-1.rds.amazonaws.com',
//     user: 'root',
//     password: process.env.dbpassword,
//     database: 'grostep'
// });


// exports.fetchAllActiveCustomerOffers = function (req, res) {
//     const customerId = +req.body.customerId;
//     const storeId = +req.body.storeId;
//     const token = req.query.token;
//     let sql = `CALL FETCH_CUSTOMER_OFFERS(?)`;
//     pool.getConnection(function (err, dbConn) {
//         dbConn.query(sql, [
//             customerId],
//             function (err, offersData) {
//                 // console.log(offersData[0]);
//                 if (err) {
//                     console.error(err);
//                     res.json({
//                         status: 400,
//                         "message": "offers not fetched",
//                         "vouchers":[]
//                     });
//                 }
//                 else {
//                     res.json({
//                         "status": 200,
//                         "message": "offers sucessfully fetched",
//                         "vouchers":offersData[0]
//                     });
//                 }
//                 dbConn.release();
//             });
//     });
// }


// // exports.searchActiveCouponByName = function(req,res) {

// //     let sql = `CALL SEARCH_VOUCHER_BY_NAME(?,?)`;

// //     let voucherCode = req.body.voucherCode;
// //     let cartAmount = +req.body.cartAmount;
// //     console.log(voucherCode);
// //     pool.getConnection(function (err, dbConn) {
// //         dbConn.query(sql, [voucherCode, cartAmount],
// //             function (err, voucherInfo) {
// //                 console.log(voucherInfo);
// //                 if (err) {
// //                     console.log("error: ", err);
// //                     res.json({
// //                         "message": "coupon not found",
// //                         "status": 400,
// //                         "coupon": []
// //                     });
// //                 }
// //                 else {
// //                     res.json({
// //                         "status": 200,
// //                         "message": "coupon information",
// //                         "coupon": voucherInfo[0]
// //                     });
// //                 }
// //                 dbConn.release();
// //             });
// //     });
// // }


// // exports.fetchCouponInfoById = function (req, res) {
// //     pool.getConnection(function (err, dbConn) {
// //         dbConn.query("SELECT * FROM vouchers WHERE voucher_id = ? ", +req.params.couponId, function (err, couponData) {
// //             if (err) {
// //                 res.json({
// //                     status: 400,
// //                     "message": "Coupon Information not found",
// //                     "coupon": couponData[0]
// //                 });
// //             }
// //             else {
// //                 res.json({
// //                     status: 200,
// //                     "message": "coupon Information",
// //                     "coupon": couponData[0]
// //                 });
// //             }
// //             dbConn.release();
// //         });
// //     });
// // }

// // exports.deleteCoupon = function (req, res) {
// //     pool.getConnection(function (err, dbConn) {
// //         dbConn.query("DELETE FROM vouchers WHERE voucher_id = ? ", req.params.couponId,
// //             function (err, couponData) {
// //                 if (err) {
// //                     console.log("error: ", err);
// //                 }
// //                 else {
// //                     let deleted = false;
// //                     if (couponData.affectedRows == 1) {
// //                         deleted = true;
// //                     }
// //                     res.json({
// //                         "message": (deleted) ? "coupon deleted successfully" : "invalid coupon id",
// //                         "status": (deleted) ? 200 : 400,
// //                         "voucher_id": req.params.couponId
// //                     });
// //                 }
// //                 dbConn.release();
// //             });
// //     });
// // }

// // exports.updateCoupon = function (req, res) {
// //     let utcMoment = moment.utc();
// //     req.body.voucher_last_updated = new Date(utcMoment);
// //     const updateCoupon = req.body;
// //     console.log(updateCoupon);
// //     pool.getConnection(function (err, dbConn) {
// //         dbConn.query("UPDATE grostep.vouchers SET ? WHERE voucher_id = ?", [updateCoupon, +req.params.couponId], function (err, couponData) {
// //             if (err) {
// //                 console.log("error: ", err);
// //                 res.json({
// //                     status: 400,
// //                     "message": "coupon Information not updated",
// //                     "coupon": couponData
// //                 });

// //             }
// //             else {
// //                 res.json({
// //                     status: 200,
// //                     "message": "coupon Information updated",
// //                     "coupon": couponData
// //                 });
// //             }
// //             dbConn.release();
// //         });
// //     });
// // }

// // exports.addNewCoupon = function (req, res) {
// //     const newProduct = req.body;
// //     let sql = `CALL ADD_NEW_COUPON(?,?,?,?,?,?,?,?,?,?,?,?,?,?)`;

// //     let calculationType = +req.body.calculationType;
// //     let expirydatetime = req.body.expirydatetime;
// //     let voucherMaxUsageCount = +req.body.voucherMaxUsageCount;
// //     let voucherCode = req.body.voucherCode;
// //     let voucherDescription = req.body.voucherDescription;
// //     let voucherMaxLimit = +req.body.voucherMaxLimit;
// //     let voucherMaxLimitUser = +req.body.voucherMaxLimitUser;
// //     let voucherMinCartAmount = +req.body.voucherMinCartAmount;
// //     let voucherValue = +req.body.voucherValue;
// //     let createdBy = req.body.createdBy;
// //     let customerId = req.body.customerId;
// //     let city = 4;
// //     let voucherType = 0;
// //     let status = +req.body.status;

// //     pool.getConnection(function (err, dbConn) {
// //         dbConn.query(sql, [voucherCode, voucherValue, expirydatetime, 
// //             voucherMinCartAmount, voucherType, voucherDescription, status,createdBy, customerId, city,
// //             voucherMaxUsageCount, voucherMaxLimit, voucherMaxLimitUser, calculationType],
// //             function (err, coupon) {
// //                 if (err) {
// //                     console.log("error: ", err);
// //                     res.json({
// //                         "message": "coupon not added",
// //                         "status": 400,
// //                         "coupon_id": 0
// //                     });
// //                 }
// //                 else {
// //                     res.json({
// //                         "status": 200,
// //                         "message": "coupon added",
// //                         "coupon_id": coupon[0][0]['coupon_id']
// //                     });
// //                 }
// //                 dbConn.release();
// //             });
// //     });
// // }

// // exports.fetchAllOffers = function (req, res) {
// //     let sql = `CALL GET_ALL_VOUCHER_INFO(?,?,?)`;
// //     pool.getConnection(function (err, dbConn) {
// //         dbConn.query(sql, [+req.body.page_number, +req.body.page_size, req.body.filterBy],
// //             function (err, vouchers) {
// //                 if (err) {
// //                     console.log("error: ", err);
// //                 }
// //                 else {
// //                     res.json({
// //                         "message": "voucher information",
// //                         "vouchers": vouchers[0],
// //                         "voucher_total_count": vouchers[1][0]
// //                     });
// //                 }
// //                 dbConn.release();
// //             });
// //     });
// // }