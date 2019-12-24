var mysql = require('mysql');
var dbConn = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'root',
    database: 'grostep'
    // host: 'vibhavg91.cce5kiug4ajr.us-east-2.rds.amazonaws.com',
    // user: 'root',
    // password: 'password',
    // database: 'grostep'
});
// connect to database
dbConn.connect();

exports.fetchAllBanners = function (req, res) {
    let sql = `CALL GET_ALL_BANNER_INFO(?,?,?)`;
    dbConn.query(sql, [+req.body.page_number, +req.body.page_size, req.body.filterBy],
        function (err, banners) {
            if (err) {
                console.log("error: ", err);
            }
            else {
                res.json({
                    "message": "banner information",
                    "banner": banners[0],
                    "banner_total_count": banners[1][0]
                });
            }
        });
}

exports.deleteBanner = function (req, res) {
    dbConn.query("DELETE FROM banner_info WHERE banner_id = ? ", req.params.bannerId,
        function (err, bannerData) {
            if (err) {
                console.log("error: ", err);
            }
            else {
                let deleted = false;
                if (bannerData.affectedRows == 1) {
                    deleted = true;
                }
                res.json({
                    "message": (deleted) ? "banner deleted successfully" : "invalid banner id",
                    "status": (deleted) ? 200 : 400,
                    "banner_id": req.params.bannerId
                });
            }
        });
}

exports.fetchBannerInfoById = function (req, res) {
    // let sql = `CALL GET_STORE_INFO(?)`;
    dbConn.query("SELECT * FROM banner_info WHERE banner_id = ? ", req.params.bannerId, function (err, bannerData) {
        if (err) {
            res.json({
                status: 400,
                "message": "Banner Information not found",
                "banner": bannerData[0]
            });
        }
        else {
            res.json({
                status: 200,
                "message": "Banner Information",
                "banner": bannerData[0]
            });
        }
    });
}

exports.addNewBanner = function (req, res) {
    const newProduct = req.body;
    let sql = `CALL ADD_NEW_BANNER(?,?,?)`;

    let bannerName = req.body.bannerName;
    let zipCode = req.body.zipCode;
    let status = +req.body.status;


    dbConn.query(sql, [bannerName, zipCode, status],
        function (err, banner) {
            if (err) {
                console.log("error: ", err);
                res.json({
                    "message": "banner not added",
                    "status": 400,
                    "banner_id": 0
                });
            }
            else {
                console.log(JSON.stringify(banner));
                res.json({
                    "status": 200,
                    "message": "banner added",
                    "banner_id": banner[0][0]['banner_id']
                });
            }
        });
}

exports.updateBanner = function (req, res) {
    const updateBanner = req.body;
    dbConn.query("UPDATE grostep.banner_info SET ? WHERE banner_id = ?", [updateBanner, +req.params.bannerId], function (err, banner) {
        if (err) {
            console.log("error: ", err);
            res.json({
                status: 400,
                "message": "banner Information not updated",
                "banner": banner
            });

        }
        else {
            console.log(JSON.stringify(banner));
            res.json({
                status: 200,
                "message": "banner Information updated",
                "banner": banner
            });
        }
    });
}

exports.updateBannerImages = function (banner_id, imageUrl, req, res) {
    let sql = `CALL UPDATE_BANNER_IMAGES(?,?,?)`;
    let bannerId = +banner_id;
    let image_url = imageUrl;
    let status = 1;
    dbConn.query(sql, [bannerId, image_url, status],
        function (err, updatedBanner) {
            if (err) {
                console.log("error: ", err);
                res.json({
                    "status": 400,
                    "message": "banner images not updated",
                    "banner_id": 0
                })
            }
            else {
                res.json({
                    "status": 200,
                    "message": "banner detail",
                    "product": updatedBanner[0][0]
                });
            }
        });
}

