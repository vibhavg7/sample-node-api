var express = require('express');
const logger = require('morgan');
var createError = require('http-errors');
var app = express();
var router = express.Router();
var admin = require("firebase-admin");
var bodyParser = require('body-parser');
var cors = require('cors');
var serviceAccount = require("./services/grostep-firebase-sdk.json");
const rateLimit = require("express-rate-limit");
const slowDown = require("express-slow-down");

// Enable if you're behind a reverse proxy (Heroku, Bluemix, AWS ELB, Nginx, etc)
// see https://expressjs.com/en/guide/behind-proxies.html
app.set('trust proxy', 1);

// // What to do when our maximum request rate is breached
// const limitReached = (req, res) => {
//     log.warn({ ip: req.ip }, `Rate limiter triggered`)
//     renderError(req, res) // Your function to render an error page
//    }

const limiter = rateLimit({
    windowMs: 30 * 1000, // 30 seconds
    max: 30 // limit each IP to 100 requests per windowMs
});

const speedLimiter = slowDown({
    windowMs: 30 * 1000, // 30 seconds
    delayAfter: 20, // allow 10 requests per 30 seconds, then...
    delayMs: 500 // begin adding 500ms of delay per request above 10:
    // request # 101 is delayed by  500ms
    // request # 102 is delayed by 1000ms
    // request # 103 is delayed by 1500ms
    // etc.
  });

const port = process.env.PORT || 3000;
require('dotenv').config();
admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    databaseURL: "https://grostep-realtime-nodejs.firebaseio.com"
});
// app.use(limiter);
var indexRoutes = require("./routes/index.routes");
var productV1Routes = require("./routes/v1/products.routes");
var categoryV1Routes = require("./routes/v1/category.routes");
var storesV1Routes = require("./routes/v1/stores.routes");
var customerV1Routes = require("./routes/v1/customer.routes");
var orderV1Routes = require("./routes/v1/order.routes");
var cartV1Routes = require("./routes/v1/cart.routes");
var bannerV1Routes = require("./routes/v1/banner.routes");
var offerV1Routes = require("./routes/v1/offers.routes");
var deliveryV1Routes = require("./routes/v1/delivery.routes");
var imageuploadV1Routes = require("./routes/v1/image.upload.routes");   
var mapV1Routes = require("./routes/v1/map.routes");
var employeeV1Routes = require("./routes/v1/employee.routes");


var storesV2Routes = require("./routes/v2/stores.routes");
var categoryV2Routes = require("./routes/v2/category.routes");
var customerV2Routes = require("./routes/v2/customer.routes");
var orderV2Routes = require("./routes/v2/order.routes");
var productV2Routes = require("./routes/v2/products.routes");
var imageuploadV2Routes = require("./routes/v2/image.upload.routes");
var employeeV2Routes = require("./routes/v2/employee.routes");
// Set up the routing.
var v1 = express.Router();
var v2 = express.Router();


app.use((req, res, next) => {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, Authorization");
    next();
});

app.use(logger("dev"));
app.use(bodyParser.json());
app.use(cors());
app.use(bodyParser.urlencoded({
    extended: true
}));

v1.use('/', indexRoutes);
v1.use('/productsapi', productV1Routes);
v1.use('/categoryapi', categoryV1Routes);
v1.use('/storesapi', storesV1Routes);
v1.use('/customerapi', customerV1Routes);
v1.use('/ordersapi', orderV1Routes);
v1.use('/imageuploadapi', imageuploadV1Routes);
v1.use('/employeeapi', employeeV1Routes);
v1.use('/bannerapi', bannerV1Routes);
v1.use('/deliveryapi', deliveryV1Routes);
v1.use('/cartapi', limiter, speedLimiter, cartV1Routes);
v1.use('/mapsapi', mapV1Routes);
v1.use('/vouchersapi', offerV1Routes);


v2.use('/storesapi',limiter, speedLimiter, storesV2Routes);
v2.use('/categoryapi', limiter, speedLimiter, categoryV2Routes);
v2.use('/customerapi', limiter, speedLimiter, customerV2Routes);
v2.use('/ordersapi', limiter, speedLimiter, orderV2Routes);
v2.use('/productsapi',limiter, speedLimiter, productV2Routes);
v2.use('/imageuploadapi',limiter, speedLimiter, imageuploadV2Routes);
v2.use('/employeeapi', limiter, speedLimiter, employeeV2Routes);

app.use('/v1', v1);
app.use('/v2', v2);
app.use('/', v1); // Set the default version to latest.

// app.use('/v2/vouchersapi', offerV2Routes);


app.use(async (req, res, next) => {
    // const err = new Error("Not found");
    // err.status = 404;
    // next(err);
    next(createError.NotFound('This route does not exist'));
});

//error handler
app.use((err, req, res, next) => {
    res.status = err.status || 500;
    console.error(err);
    res.send({
        "status": err.status || 500,
        "message": err.message,
    })
});


// set port
app.listen(port, function () {
    console.log(`Node app is running on port ${port}`);
});
module.exports = app;