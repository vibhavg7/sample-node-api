var express = require('express');
var router = express.Router();

var categoryController = require("../controllers/category.controller");

router.route('/subcategories/:sub_category_id')
    .get(categoryController.getSubCategoryData);


router.route('/storesubcategories')
    .post(categoryController.postStoreSubCategories)
    .delete(categoryController.deleteStoreSubCategory)
    .put(categoryController.updateStoreSubCategory);

router.route('/storesubcategories/:store_category_id')
    .post(categoryController.getStoreSubCategories);

router.route('/storecategories')
    .post(categoryController.postStoreCategories)    
    .put(categoryController.updateStoreCategory);

router.route('/storecategories/:category_id')
    .delete(categoryController.deleteStoreCategory)
    .post(categoryController.getStoreCategories);

router.route('/')
    .get(categoryController.getCategoryInfo);


module.exports = router;