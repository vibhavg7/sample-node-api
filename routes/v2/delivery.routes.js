var express = require('express');
var router = express.Router();

var authenticateToken = require('../../services/authenticateToken');
var deliveryController = require("../../controllers/v1/delivery.controller");
var orderController = require("../../controllers/v1/order.controller");

router.route('/deliveryareasinfo/banners')
    .post(authenticateToken, deliveryController.fetchAllDeliveryAreaBannersByAreaId);

router.route('/deliveryareasinfo/categories')
    .post(authenticateToken, deliveryController.fetchAllDeliveryAreaCategoriesByAreaId);

router.route('/deliveryareasinfo/banners/:bannerId')
    .get(authenticateToken, deliveryController.fetchAllDeliveryAreaBannersById);

//fetchAllDeliveryAreaCategoriesById

router.route('/deliveryareasinfo/categories/:categoryId')
    .get(authenticateToken, deliveryController.fetchAllDeliveryAreaCategoriesById);

router.route('/deliveryareasinfo/categoryearch/:queryString')
    .get(authenticateToken, deliveryController.searchCategoryByName);

router.route('/deliveryareasinfo/bannersearch/:queryString')
    .get(authenticateToken, deliveryController.searchBannerByName);

router.route('/editDeliveryAreaBanner/edit/:id')
    .post(authenticateToken, deliveryController.editDeliveryAreaBanner);

router.route('/editDeliveryAreaCategory/edit/:id')
    .post(authenticateToken, deliveryController.editDeliveryAreaCategory);

router.route('/addDeliveryAreaCategory')
    .post(authenticateToken, deliveryController.addDeliveryAreaCategory);

router.route('/addDeliveryAreaBanner')
    .post(authenticateToken, deliveryController.addDeliveryAreaBanner);

router.route('/addnewdeliveryperson')
    .post(authenticateToken, deliveryController.addNewDeliveryPerson);

router.route('/resendOTP/:deliveryPersonId')
    .get(deliveryController.resendOTP);

router.route('/register')
    .post(deliveryController.registerDeliveryPerson);

router.route('/deliveryareasinfo')
    .post(authenticateToken, deliveryController.fetchAllDeliveryAreas);

router.route('/deliveryareasinfo/:areaId')
    .get(authenticateToken, deliveryController.fetchDeliveryAreaInfoById);

router.route('/logoutDeliveryPerson/:deliveryPersonId')
    .put(deliveryController.updateDeliveryPerson);

router.route('/validate')
    .post(deliveryController.validateDeliveryPerson);

router.route('/deliveryinfo')
    .post(authenticateToken, deliveryController.fetchAllDeliveryPersons);

router.route('/deliveryratesandfees/:customerId')
    .post(deliveryController.fetchDeliveryRatesAndFeesCityWise);


// router.route('/fetchactiveorders')
//     .get(orderController.fetchDeliveryBoyOrders);

router.route('/deliverypersonordersinfo/:deliveryPersonId/:offset')
    .get(orderController.fetchDeliveryPersonOrdersInfoById);

router.route('/fetchAllNewOrders')
    .post(deliveryController.fetchAllNewOrders);

router.route('/fetchpastorders')
    .post(deliveryController.fetchpastorders);

router.route('/fetchRunningStatusByOrderId')
    .post(deliveryController.fetchRunningStatusByOrderId);

router.route('/fetchAllRunningOrders/:deliveryPersonId')
    .post(authenticateToken, deliveryController.fetchAllRunningOrders);

router.route('/fetchAllDeliveredOrders/:deliveryPersonId')
    .post(deliveryController.fetchAllDeliveredOrders);

router.route('/deliveryinfo/:deliveryPersonId')
    .get(authenticateToken, deliveryController.fetchDeliveryPersonInfoById)
    .put(authenticateToken, deliveryController.updateDeliveryPerson);


router.route('/deliveryinfo/deliverypersonpastorders')
    .post(authenticateToken, deliveryController.fetchDeliveryPersonAllPastOrders);

router.route('/login')
    .post(deliveryController.loginDeliveryPerson);


router.route('/updateorder/:orderId')
    .put(deliveryController.updateOrderStatusByDeliveryPerson);
module.exports = router;
