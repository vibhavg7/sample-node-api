var express = require('express');
var router = express.Router();

var categoryController = require("../../controllers/v1/category.controller");

router.route('/storesubcategories')
    .post(categoryController.postStoreSubCategories)
    .put(categoryController.updateStoreSubCategory);

router.route('/storesubcategories/:store_category_id')
    .get(categoryController.getCategoryInfo)
    .delete(categoryController.deleteStoreSubCategory);

router.route('/subcategories')
    .post(categoryController.postSubCategory)
    .put(categoryController.updateSubCategory);

router.route('/subcategories/:sub_category_id')
    .get(categoryController.getSubCategoryInfo)
    .delete(categoryController.deleteSubCategory);

router.route('/storecategories')
    .post(categoryController.getAllStoreCategories)
    .put(categoryController.updateStoreCategory);

router.route('/addstorecategory')
    .post(categoryController.postStoreCategories);

router.route('/storecategories/citywise')
    .post(categoryController.getAllStoreCategoriesBasedOnCity);

router.route('/storecategories/bannerimages')
    .post(categoryController.getBannerImages);


router.route('/storecategories/:category_id')
    .get(categoryController.getStoreCategory)
    .delete(categoryController.deleteStoreCategory)

router.route('/:store_category_id')
    .get(categoryController.getCategoryInfo);



module.exports = router;