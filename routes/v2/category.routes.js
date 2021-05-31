var express = require('express');
var router = express.Router();

var categoryController = require("../../controllers/v1/category.controller");
var authenticateToken = require('../../services/authenticateToken');

router.route('/storesubcategories')
    .post(authenticateToken, categoryController.postStoreSubCategories)
    .put(authenticateToken, categoryController.updateStoreSubCategory);

router.route('/storesubcategories/:store_category_id')
    .get(authenticateToken, categoryController.getCategoryInfo)
    .delete(authenticateToken, categoryController.deleteStoreSubCategory);

router.route('/subcategories')
    .post(authenticateToken, categoryController.postSubCategory)
    .put(authenticateToken, categoryController.updateSubCategory);

router.route('/subcategories/:sub_category_id')
    .get(authenticateToken, categoryController.getSubCategoryInfo)
    .delete(authenticateToken, categoryController.deleteSubCategory);

router.route('/storecategories')
    .post(authenticateToken, categoryController.getAllStoreCategories)
    .put(authenticateToken, categoryController.updateStoreCategory);

router.route('/addstorecategory')
    .post(authenticateToken, categoryController.postStoreCategories);

router.route('/storecategories/citywise')
    .post(categoryController.getAllStoreCategoriesBasedOnCity);

router.route('/storecategories/bannerimages')
    .post(categoryController.getBannerImages);


router.route('/storecategories/:category_id')
    .get(authenticateToken, categoryController.getStoreCategory)
    .delete(authenticateToken, categoryController.deleteStoreCategory)

router.route('/:store_category_id')
    .get(categoryController.getCategoryInfo);



module.exports = router;