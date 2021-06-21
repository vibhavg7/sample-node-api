var express = require('express');
var router = express.Router();
var authenticateToken = require('../../services/authenticateToken');
var offersController = require("../../controllers/v1/offers.controller");

router.route('/customeroffers/:customerId')
    .get(offersController.fetchAllActiveOffers);

router.route('/customeroffers')
    .get(offersController.fetchAllActiveOffers);


router.route('/searchVoucherByName')
    .post(offersController.searchActiveCouponByName);

router.route('/addnewcoupon')
    .post(authenticateToken, offersController.addNewCoupon);

router.route('/couponinfo')
    .post(offersController.fetchAllCoupons);


router.route('/couponinfo/:couponId')
    .get(authenticateToken, offersController.fetchCouponInfoById)
    .delete(offersController.deleteCoupon)
    .put(authenticateToken, offersController.updateCoupon);

module.exports = router;