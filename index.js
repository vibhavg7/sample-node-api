var express = require('express');
var app = express();
var admin = require("firebase-admin");
var bodyParser = require('body-parser');
var cors = require('cors');
var serviceAccount = require("./services/grostep-firebase-sdk.json");

admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    databaseURL: "https://grostep-realtime-nodejs.firebaseio.com"
});
var indexRoutes = require("./routes/index.routes");
var productRoutes = require("./routes/products.routes");
var categoryRoutes = require("./routes/category.routes");
var storesRoutes = require("./routes/stores.routes");
var customerRoutes = require("./routes/customer.routes");
var orderRoutes = require("./routes/order.routes");
var bannerRoutes = require("./routes/banner.routes");
var offerRoutes = require("./routes/offers.routes");
var imageuploadRoutes = require("./routes/image.upload.routes");

var employeeRoutes = require("./routes/employee.routes");



app.use((req, res, next) => {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, Authorization");
    next();
});


app.use(bodyParser.json());
app.use(cors());
app.use(bodyParser.urlencoded({
    extended: true
}));

app.use('/', indexRoutes);
app.use('/productsapi', productRoutes);
app.use('/categoryapi', categoryRoutes);
app.use('/storesapi', storesRoutes);
app.use('/customerapi', customerRoutes);
app.use('/vouchersapi', offerRoutes);
app.use('/ordersapi', orderRoutes);
app.use('/imageuploadapi', imageuploadRoutes);
app.use('/employeeapi', employeeRoutes);
app.use('/bannerapi', bannerRoutes);


// // default route
// app.get('/', function (req, res) {
//     return res.send({ error: true, message: 'hello',keys:process.env });
// });

// set port
app.listen(3000, function () {
    console.log('Node app is running on port 3000');
});
module.exports = app;