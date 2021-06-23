var express = require('express');
var router = express.Router();

var storesController = require("../../controllers/v2/stores.controller");
var orderController = require("../../controllers/v1/order.controller");
var authenticateToken = require('../../services/authenticateToken');

router.route('/addnewstore')
    .post(authenticateToken, storesController.addNewStore);

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
    .post(authenticateToken, storesController.addStoreProducts);

router.route('/storeinfo')
    .post(authenticateToken, storesController.fetchAllStores);

router.route('/storeinfo/storedeliveryslots')
    .post(storesController.getStoreDeliverySlots);

router.route('/storeinfo/categories/:storeId')
    .post(storesController.fetchStoreSubCategoriesInfoById);

router.route('/storeinfo/categories/updateStatus/:storeCategoryMappingId')
    .patch(storesController.updatestoreCategoryStatus);


router.route('/storeinfo/zipCode')
    .post(storesController.fetchAllStoresBasedOnZipCode);

router.route('/storeinfo/searchStoreAndProductsBasedOnName')
    .post(storesController.searchStoreAndProductsBasedOnName);

//route used by admin panel    
router.route('/storeinfo/storeproducts/:id')
    .get(authenticateToken, storesController.fetchStoreProductInfoById)
    .put(authenticateToken, storesController.updateStoreProduct)
    .delete(authenticateToken, storesController.deleteStoreProduct);

//route used by admin panel    
router.route('/storeinfo/storeproducts')
    .post(authenticateToken, storesController.fetchStoreProductsById);

router.route('/storeinfo/storeproductscategorywise')
    .post(storesController.fetchStoreProductsCategoryWise);

router.route('/storeinfo/storeproducts/edit/:productId')
    .post(authenticateToken, storesController.editStoreProductInfoById);

//route used by admin panel    
router.route('/storeinfo/storeorders')
    .post(authenticateToken, storesController.fetchStoreOrdersById);

router.route('/storeinfo/storepastorders')
    .post(storesController.fetchStorePastOrdersById);

router.route('/storeinfo/storeproducts/updatestock/:id')
    .patch(authenticateToken, storesController.updateProductStock);

//route used in admin panel    
router.route('/storeinfo/storeorderproducts/:orderId')
    .get(authenticateToken, storesController.fetchOrderProductsById);

router.route('/merchantorderscount/:storeId/:offset')
    .get(orderController.fetchMerchantOrderCountById);




router.route('/storeinfo/storenewpickedorders')
    .post(storesController.fetchStoreNewPickedOrdersById);

router.route('/fetchAllRunningOrders')
    .post(storesController.fetchAllRunningOrders);

router.route('/uploadStoreCategoryProducts')
    .post(storesController.uploadStoreCategoryProducts);


router.route('/fetchAllPickedOrders/:storeId')
    .get(storesController.fetchAllBilledOrders);

router.route('/fetchAllPendingBilledOrders/:storeId')
    .get(storesController.fetchAllPendingBilledOrders);

//routes used by admin panel
router.route('/storeinfo/:storeId')
    .get(authenticateToken, storesController.fetchStoreById)
    .delete(authenticateToken, storesController.deleteStore)
    .put(authenticateToken, storesController.updateStore);

router.route('/updatestoreclosingstatus/:storeId')
    .put(authenticateToken, storesController.updatestoreclosingstatus);


router.route('/:orderId')
    .put(orderController.updateOrderStatusByMerchant);


module.exports = router;