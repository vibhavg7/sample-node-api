var express = require('express');
var router = express.Router();

var storesController = require("../../controllers/v1/stores.controller");
var orderController = require("../../controllers/v1/order.controller");

router.route('/addnewstore')
    .post(storesController.addNewStore);

router.route('/resendOTP/:storeId')
    .get(storesController.resendOTP);

router.route('/login')
    .post(storesController.loginMerchant);

router.route('/validate')
    .post(storesController.validateMerchant);

// router.route('/logoutStore/:storeId')
//     .put(storesController.updateStore);

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

router.route('/storeinfo/storeproducts/:id')
    .get(storesController.fetchStoreProductInfoById)
    .put(storesController.updateStoreProduct)
    .delete(storesController.deleteStoreProduct);

router.route('/storeinfo/storeproducts')
    .post(storesController.fetchStoreProductsById);

router.route('/storeinfo/storeproductscategorywise')
    .post(storesController.fetchStoreProductsCategoryWise);

router.route('/storeinfo/storeproducts/edit/:productId')
    .post(storesController.editStoreProductInfoById);

router.route('/storeinfo/storeorders')
    .post(storesController.fetchStoreOrdersById);

router.route('/storeinfo/storepastorders')
    .post(storesController.fetchStorePastOrdersById);

router.route('/storeinfo/storeproducts/updatestock/:id')
    .patch(storesController.updateProductStock);

router.route('/storeinfo/storeorderproducts/:orderId')
    .get(storesController.fetchOrderProductsById);

router.route('/merchantorderscount/:storeId/:offset')
    .get(orderController.fetchMerchantOrderCountById);


router.route('/storeinfo/storenewpickedorders')
    .post(storesController.fetchStoreNewPickedOrdersById);

router.route('/fetchAllRunningOrders')
    .post(storesController.fetchAllRunningOrders);




router.route('/fetchAllPickedOrders/:storeId')
    .get(storesController.fetchAllBilledOrders);

router.route('/fetchAllPendingBilledOrders/:storeId')
    .get(storesController.fetchAllPendingBilledOrders);

router.route('/storeinfo/:storeId')
    .get(storesController.fetchStoreById)
    .delete(storesController.deleteStore)
    .put(storesController.updateStore);

router.route('/updatestoreclosingstatus/:storeId')
    .put(storesController.updatestoreclosingstatus);


router.route('/:orderId')
    .put(orderController.updateOrderStatusByMerchant);


module.exports = router;