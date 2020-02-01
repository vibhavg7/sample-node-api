var express = require('express');
var router = express.Router();
var uploadImage = require("../services/file-upload");
const singleUpload = uploadImage.single('image');
var productsController = require("../controllers/products.controller");
var orderController = require("../controllers/order.controller");
var categoryController = require("../controllers/category.controller");
var storesController = require("../controllers/stores.controller");
var bannerController = require("../controllers/banner.controller");

router.post('/products/:productId', function (req, res, next) {
    singleUpload(req, res, function (err) {
        if (err) {
            return res.status(422).send({ errors: [{ title: 'File Upload Error', detail: err.message }] });
        }
        productsController.updateProductImages(req.params.productId, req.file.location, req, res);
    })
});


router.post('/category/:categoryid', function (req, res, next) {
    singleUpload(req, res, function (err) {
        if (err) {
            return res.status(422).send({ errors: [{ title: 'File Upload Error', detail: err.message }] });
        }
        console.log(req.params.categoryid);
        console.log(req.file.location);
        categoryController.updateStoreCategoryImages(req.params.categoryid, req.file.location, req, res);
    })
});

router.post('/merchants/:merchantId', function (req, res, next) {
    singleUpload(req, res, function (err) {
        if (err) {
            return res.status(422).send({ errors: [{ title: 'File Upload Error', detail: err.message }] });
        }
        storesController.updateStoreImages(req.params.merchantId, req.file.location, req, res);
    })
});

router.post('/uploadOrderBill/:orderId', function (req, res, next) {
    singleUpload(req, res, function (err) {
        if (err) {
            return res.status(422).send({ errors: [{ title: 'File Upload Error', detail: err.message }] });
        }
        // console.log(req.file.location);
        orderController.updateOrderBillImage(req.params.orderId, req.file.location, req, res);
    })
});

router.post('/banners/:bannerId', function (req, res, next) {
    // console.log('dsdsdsd');
    singleUpload(req, res, function (err) {
        if (err) {
            return res.status(422).send({ errors: [{ title: 'File Upload Error', detail: err.message }] });
        }
        bannerController.updateBannerImages(req.params.bannerId, req.file.location, req, res);
    })
});

router.post('/subcategories/:categoryId', function (req, res, next) {
    singleUpload(req, res, function (err) {
        if (err) {
            return res.status(422).send({ errors: [{ title: 'File Upload Error', detail: err.message }] });
        }
        categoryController.updateSubCategoryImages(req.params.categoryId, req.file.location, req, res);
    })
});


module.exports = router;