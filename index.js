var express = require('express');
var app = express();
var bodyParser = require('body-parser');

var productRoutes = require("./routes/products.routes");
var indexRoutes = require("./routes/index.routes");


app.use((req, res, next) => {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, Authorization");
    next();
});


app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
    extended: true
}));

// app.use('/', indexRoutes);
app.use('/productsapi', productRoutes);

// // default route
// app.get('/', function (req, res) {
//     return res.send({ error: true, message: 'hello',keys:process.env });
// });

 // set port
 app.listen(3000, function () {
    console.log('Node app is running on port 3000');
});
module.exports = app;