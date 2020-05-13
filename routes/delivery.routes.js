var express = require('express');
var router = express.Router();

var deliveryController = require("../controllers/delivery.controller");
var orderController = require("../controllers/order.controller");

router.route('/deliveryareasinfo/banners')
    .post(deliveryController.fetchAllDeliveryAreaBannersByAreaId);

router.route('/deliveryareasinfo/categories')
    .post(deliveryController.fetchAllDeliveryAreaCategoriesByAreaId);

router.route('/deliveryareasinfo/banners/:bannerId')
    .get(deliveryController.fetchAllDeliveryAreaBannersById);

//fetchAllDeliveryAreaCategoriesById

router.route('/deliveryareasinfo/categories/:categoryId')
    .get(deliveryController.fetchAllDeliveryAreaCategoriesById);

router.route('/deliveryareasinfo/categoryearch/:queryString')
    .get(deliveryController.searchCategoryByName);

router.route('/deliveryareasinfo/bannersearch/:queryString')
    .get(deliveryController.searchBannerByName);

router.route('/editDeliveryAreaBanner/edit/:id')
    .post(deliveryController.editDeliveryAreaBanner);

router.route('/editDeliveryAreaCategory/edit/:id')
    .post(deliveryController.editDeliveryAreaCategory);



router.route('/addDeliveryAreaCategory')
    .post(deliveryController.addDeliveryAreaCategory);

router.route('/addDeliveryAreaBanner')
    .post(deliveryController.addDeliveryAreaBanner);

router.route('/addnewdeliveryperson')
    .post(deliveryController.addNewDeliveryPerson);

router.route('/resendOTP/:deliveryPersonId')
    .get(deliveryController.resendOTP);

router.route('/register')
    .post(deliveryController.registerDeliveryPerson);

router.route('/deliveryareasinfo')
    .post(deliveryController.fetchAllDeliveryAreas);

router.route('/deliveryareasinfo/:areaId')
    .get(deliveryController.fetchDeliveryAreaInfoById);

router.route('/logoutDeliveryPerson/:deliveryPersonId')
    .put(deliveryController.updateDeliveryPerson);

router.route('/validate')
    .post(deliveryController.validateDeliveryPerson);

router.route('/deliveryinfo')
    .post(deliveryController.fetchAllDeliveryPersons);

router.route('/deliveryratesandfees/:customerId')
    .post(deliveryController.fetchDeliveryRatesAndFeesCityWise);


// router.route('/fetchactiveorders')
//     .get(orderController.fetchDeliveryBoyOrders);

router.route('/deliverypersonordersinfo/:deliveryPersonId/:offset')
    .get(orderController.fetchDeliveryPersonOrdersInfoById);

router.route('/fetchAllNewOrders')
    .post(deliveryController.fetchAllNewOrders);

router.route('/fetchRunningStatusByOrderId')
    .post(deliveryController.fetchRunningStatusByOrderId);

router.route('/fetchAllRunningOrders/:deliveryPersonId')
    .post(deliveryController.fetchAllRunningOrders);

router.route('/fetchAllDeliveredOrders/:deliveryPersonId')
    .get(deliveryController.fetchAllDeliveredOrders);

router.route('/deliveryinfo/:deliveryPersonId')
    .get(deliveryController.fetchDeliveryPersonInfoById)
    .put(deliveryController.updateDeliveryPerson);


router.route('/login')
    .post(deliveryController.loginDeliveryPerson);


router.route('/updateorder/:orderId')
    .put(deliveryController.updateOrderStatusByDeliveryPerson);
module.exports = router;
