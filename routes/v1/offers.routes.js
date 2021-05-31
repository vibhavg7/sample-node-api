var express = require('express');
var router = express.Router();

var offersController = require("../../controllers/v1/offers.controller");

router.route('/customeroffers/:customerId')
    .get(offersController.fetchAllActiveOffers);

router.route('/customeroffers')
    .get(offersController.fetchAllActiveOffers);


router.route('/searchVoucherByName')
    .post(offersController.searchActiveCouponByName);

router.route('/addnewcoupon')
    .post(offersController.addNewCoupon);

router.route('/couponinfo')
    .post(offersController.fetchAllOffers);


router.route('/couponinfo/:couponId')
    .get(offersController.fetchCouponInfoById)
    .delete(offersController.deleteCoupon)
    .put(offersController.updateCoupon);

module.exports = router;