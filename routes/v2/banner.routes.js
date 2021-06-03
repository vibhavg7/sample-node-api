var express = require('express');
var router = express.Router();

var bannerController = require("../../controllers/v1/banner.controller");

var authenticateToken = require('../../services/authenticateToken');

router.route('/addnewbanner')
    .post(authenticateToken, bannerController.addNewBanner);

router.route('/bannerinfo')
    .post(authenticateToken, bannerController.fetchAllBanners);

router.route('/bannerinfo/citywise')
    .post(bannerController.getAllBannersBasedOnCity);

router.route('/bannerinfo/:bannerId')
    .get(authenticateToken, bannerController.fetchBannerInfoById)
    .delete(authenticateToken, bannerController.deleteBanner)
    .put(authenticateToken, bannerController.updateBanner);

module.exports = router;