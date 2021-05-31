var express = require('express');
var router = express.Router();
var uploadImage = require("../../services/file-upload");
const singleUpload = uploadImage.single('image');
var createError = require('http-errors');
var productsController = require("../../controllers/v1/products.controller");
var ordersController = require("../../controllers/v1/order.controller");
var categoryController = require("../../controllers/v1/category.controller");
var storesController = require("../../controllers/v1/stores.controller");
var bannerController = require("../../controllers/v1/banner.controller");
var authenticateToken = require('../../services/authenticateToken');


router.post('/products/:productId', authenticateToken, function (req, res, next) {
    singleUpload(req, res, function (err) {
        if (err) {
            next(createError(422, { errors: [{ title: 'File Upload Error', detail: err.message }] }));
            return res.status(422).send({ errors: [{ title: 'File Upload Error', detail: err.message }] });
        }
        productsController.updateProductImages(req.params.productId, req.file.location, req, res);
    })
});


router.post('/category/:categoryid', function (req, res, next) {
    singleUpload(req, res, function (err) {
        if (err) {
            next(createError(422, { errors: [{ title: 'File Upload Error', detail: err.message }] }));
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
            next(createError(422, { errors: [{ title: 'File Upload Error', detail: err.message }] }));
            return res.status(422).send({ errors: [{ title: 'File Upload Error', detail: err.message }] });
        }
        storesController.updateStoreImages(req.params.merchantId, req.file.location, req, res);
    })
});

router.post('/uploadOrderBill/:orderId', function (req, res, next) {
    singleUpload(req, res, function (err) {
        if (err) {
            next(createError(422, { errors: [{ title: 'File Upload Error', detail: err.message }] }));
            return res.status(422).send({ errors: [{ title: 'File Upload Error', detail: err.message }] });
        }
        ordersController.updateOrderBillImage(req.params.orderId, req.file.location, req, res);
    })
});

router.post('/banners/:bannerId', function (req, res, next) {
    // console.log('dsdsdsd');
    singleUpload(req, res, function (err) {
        if (err) {
            next(createError(422, { errors: [{ title: 'File Upload Error', detail: err.message }] }));
            return res.status(422).send({ errors: [{ title: 'File Upload Error', detail: err.message }] });
        }
        bannerController.updateBannerImages(req.params.bannerId, req.file.location, req, res);
    })
});

router.post('/subcategories/:categoryId', function (req, res, next) {
    singleUpload(req, res, function (err) {
        if (err) {
            next(createError(422, { errors: [{ title: 'File Upload Error', detail: err.message }] }));
            return res.status(422).send({ errors: [{ title: 'File Upload Error', detail: err.message }] });
        }
        categoryController.updateSubCategoryImages(req.params.categoryId, req.file.location, req, res);
    })
});


module.exports = router;