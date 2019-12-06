var express = require('express');
var router = express.Router();

var storesController = require("../controllers/stores.controller");

router.route('/addnewstore')
    .post(storesController.addNewStore);

router.route('/validate')
    .post(storesController.validateMerchant);

router.route('/addstoreproducts')
    .post(storesController.addStoreProducts);

router.route('/storeinfo')
    .post(storesController.fetchAllStores);

router.route('/storeinfo/storeproducts')
    .post(storesController.fetchStoreProductsById);

router.route('/storeinfo/storeproducts/:id')
    .get(storesController.fetchStoreProductInfoById)
    .delete(storesController.deleteStoreProduct);

router.route('/storeinfo/storeproducts/edit')
    .post(storesController.editStoreProductInfoById);

router.route('/storeinfo/storeorders')
    .post(storesController.fetchStoreOrdersById);

router.route('/storeinfo/storeproducts/updatestock/:id')
    .patch(storesController.updateProductStock);

router.route('/storeinfo/storeorderproducts/:orderId')
    .get(storesController.fetchStoreOrderProductsById);

router.route('/storeinfo/:storeId')
    .get(storesController.fetchStoreById)
    .delete(storesController.deleteStore)
    .put(storesController.updateStore)


module.exports = router;