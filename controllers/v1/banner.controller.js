var pool = require('../../utils/manageDB');
var createError = require('http-errors');

exports.getAllBannersBasedOnCity = async function (req, res, next) {
    const newStoreCategory = req.body;
    let sql = `CALL GET_ALL_BANNERS_CITYWISE(?)`;

    try {
        const banners = await pool.query(sql, [req.body.filterBy]);
        res.json({
            "message": "banners city wise",
            "status": 200,
            "banners": banners[0]
        });
    }
    catch (err) {
        next(createError(401, err));
    } finally {
        // pool.end();
    }
}


exports.fetchAllBanners = function (req, res) {
    let sql = `CALL GET_ALL_BANNER_INFO(?,?,?)`;
    pool.getConnection(function (err, dbConn) {
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
                dbConn.release();
            });
    });
}

exports.deleteBanner = async function (req, res, next) {

    let sql = `DELETE FROM banner_info WHERE banner_id = ?`;
    try {
        const bannerData = await pool.query(sql, [+req.params.bannerId]);
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
    catch (err) {
        next(createError(401, err));
    } finally {
        // pool.end();
    }
}

exports.fetchBannerInfoById = async function (req, res, next) {
    let sql = `SELECT * FROM banner_info WHERE banner_id = ?`;

    try {
        const bannerData = await pool.query(sql, [+req.params.bannerId]);
        res.json({
            status: 200,
            "message": "Banner Information",
            "banner": bannerData[0]
        });
    }
    catch (err) {
        next(createError(401, err));
    } finally {
        // pool.end();
    }
}

exports.addNewBanner = async function (req, res, next) {
    const newProduct = req.body;
    let sql = `CALL ADD_NEW_BANNER(?,?,?)`;

    let bannerName = req.body.bannerName;
    let zipCode = req.body.zipCode;
    let status = +req.body.status;

    try {
        const banner = await pool.query(sql, [bannerName, zipCode, status]);
        res.json({
            "status": 200,
            "message": "banner added",
            "banner_id": banner[0][0]['banner_id']
        });
    }
    catch (err) {
        next(createError(401, err));
    } finally {
        // pool.end();
    }
}

exports.updateBanner = async function (req, res, next) {
    const updateBanner = req.body;
    let sql = `UPDATE grostep.banner_info SET ? WHERE banner_id = ?`;
    try {
        const banner = await pool.query(sql, [updateBanner, +req.params.bannerId]);
        res.json({
            status: 200,
            "message": "banner Information updated",
            "banner": banner
        });
    }
    catch (err) {
        next(createError(401, err));
    } finally {
        // pool.end();
    }
}

exports.updateBannerImages = function (banner_id, imageUrl, req, res) {
    let sql = `CALL UPDATE_BANNER_IMAGES(?,?,?)`;
    let bannerId = +banner_id;
    let image_url = imageUrl;
    let status = 1;
    pool.getConnection(function (err, dbConn) {
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
                dbConn.release();
            });
    });
}

