var _ = require('lodash');
var pool = require('../../utils/manageDB');
var createError = require('http-errors');

exports.servicableAreaInfoCityWise = async function(req, res, next) {
    const newStoreCategory = req.body;
    let sql = `CALL GET_Servicable_AreaInfo_CityWise(?)`;

    try {
        const servicableAreaInfoCityWise = await pool.query(sql, [+req.body.serviceableAreaId]);
        res.json({
            "message": "servicable area information citywise",
            "status": 200,
            "banners": servicableAreaInfoCityWise[0],
            "store_categories": servicableAreaInfoCityWise[1]
        });
    }
    catch (err) {
        next(createError(401, err));
    } finally {
        // pool.end();
    }
}