var express = require('express');
var router = express.Router();

var bannerController = require("../../controllers/v1/banner.controller");

router.route('/addnewbanner')
    .post(bannerController.addNewBanner);

router.route('/bannerinfo')
    .post(bannerController.fetchAllBanners);

router.route('/bannerinfo/citywise')
    .post(bannerController.getAllBannersBasedOnCity);

router.route('/bannerinfo/:bannerId')
    .get(bannerController.fetchBannerInfoById)
    .delete(bannerController.deleteBanner)
    .put(bannerController.updateBanner);

module.exports = router;