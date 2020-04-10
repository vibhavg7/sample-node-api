var express = require('express');
var router = express.Router();

var storesController = require("../controllers/stores.controller");
var orderController = require("../controllers/order.controller");

router.route('/addnewstore')
    .post(storesController.addNewStore);

router.route('/register')
    .post(storesController.registerMerchant);

router.route('/validate')
    .post(storesController.validateMerchant);

router.route('/logoutStore/:storeId')
    .put(storesController.updateStore);

router.route('/storestatus/:storeId')
    .get(storesController.storeClosingStatus);

router.route('/addstoreproducts')
    .post(storesController.addStoreProducts);

router.route('/storeinfo')
    .post(storesController.fetchAllStores);

router.route('/storeinfo/storedeliveryslots')
    .post(storesController.getStoreDeliverySlots);

router.route('/storeinfo/categories/:storeId')
    .get(storesController.fetchStoreSubCategoriesInfoById);

router.route('/storeinfo/zipCode')
    .post(storesController.fetchAllStoresBasedOnZipCode);

router.route('/storeinfo/searchStoreAndProductsBasedOnName')
    .post(storesController.searchStoreAndProductsBasedOnName);

router.route('/storeinfo/storeproducts')
    .post(storesController.fetchStoreProductsById);

router.route('/storeinfo/storeproductscategorywise')
    .post(storesController.fetchStoreProductsCategoryWise);

router.route('/storeinfo/storeproducts/:id')
    .get(storesController.fetchStoreProductInfoById)
    .delete(storesController.deleteStoreProduct);

router.route('/storeinfo/storeproducts/edit/:productId')
    .post(storesController.editStoreProductInfoById);

router.route('/storeinfo/storeorders')
    .post(storesController.fetchStoreOrdersById);

router.route('/storeinfo/storeproducts/updatestock/:id')
    .patch(storesController.updateProductStock);

router.route('/storeinfo/storeorderproducts/:orderId')
    .get(storesController.fetchStoreOrderProductsById);

router.route('/merchantorderscount/:storeId')
    .get(orderController.fetchMerchantOrderCountById);

router.route('/fetchAllRunningOrders/:storeId')
    .get(storesController.fetchAllOngoingOrders);

router.route('/fetchAllPickedOrders/:storeId')
    .get(storesController.fetchAllBilledOrders);

router.route('/fetchAllPendingBilledOrders/:storeId')
    .get(storesController.fetchAllPendingBilledOrders);

router.route('/storeinfo/:storeId')
    .get(storesController.fetchStoreById)
    .delete(storesController.deleteStore)
    .put(storesController.updateStore);


router.route('/:orderId')
    .put(orderController.updateOrderStatusByMerchant);


module.exports = router;