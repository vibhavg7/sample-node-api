var express = require('express');
var router = express.Router();

var storesController = require("../controllers/stores.controller");

router.route('/addnewstore')
    .post(storesController.addNewStore);

router.route('/addstoreproducts')
    .post(storesController.addStoreProducts);

router.route('/storeinfo')
    .post(storesController.fetchAllStores);

router.route('/storeinfo/storeproducts')
    .post(storesController.fetchStoreProductsById);

router.route('/storeinfo/storeorders')
    .post(storesController.fetchStoreOrdersById);

router.route('/storeinfo/storeorderproducts/:orderId')
    .get(storesController.fetchStoreOrderProductsById);

router.route('/storeinfo/:storeId')
    .get(storesController.fetchStoreById)
    .put(storesController.updateStore)


module.exports = router;