var mysql = require('mysql');
var _ = require('lodash');

var pool = mysql.createPool({
    connectionLimit: 10,
    host: 'grostep-database.c8zeozlsfjcx.ap-south-1.rds.amazonaws.com',
    user: 'root',
    password: process.env.dbpassword,
    database: 'grostep'
});


exports.getSubCategoryInfo = function (req, res) {
    let sql = `CALL GET_SUBCATEGORYINFO(?)`;
    let sub_category_id = +req.params.sub_category_id;

    pool.getConnection(function (err, dbConn) {
        dbConn.query(sql, [sub_category_id], function (err, categories) {
            if (err) {
                console.log("error: ", err);
            }
            else {
                res.json({
                    "message": "sub Category list",
                    "store_sub_categories": categories[0]
                });
            }
            dbConn.release();
        });
    });
}

exports.getCategoryInfo = function (req, res) {
    let sql = `CALL GET_CATEGORY_INFO(?)`;
    let categoryId = +req.params.store_category_id;

    pool.getConnection(function (err, dbConn) {
        dbConn.query(sql, [categoryId], function (err, categories) {
            if (err) {
                console.log("error: ", err);
            }
            else {
                let categoriesData = categories[0];
                let map = new Map();
                let mainCategoryResult = [];
                let storeSubCategoryResult = [];
                for (const item of categoriesData) {
                    if (!map.has(item.store_category_id)) {
                        map.set(item.store_category_id, true);
                        mainCategoryResult.push({
                            "main_category": item.store_category_name,
                            "main_category_id": item.store_category_id,
                            "main_category_image_url": item.store_image_url,
                            "store_sub_category_name": []
                        })
                    }
                }
                map.clear();
                for (const item of categoriesData) {
                    if (!map.has(item.store_sub_category_id) && item.store_sub_category_id != null) {
                        map.set(item.store_sub_category_id, true);
                        storeSubCategoryResult.push({
                            "store_sub_category": item.store_sub_category_name,
                            "store_sub_category_id": item.store_sub_category_id,
                            "store_sub_category_image_url": item.store_sub_category_image_url,
                            "sub_store_category_id": item.sub_store_category_id,
                            "sub_category_data": []
                        })
                    }
                }
                map.clear();
                storeSubCategoryResult.forEach((data) => {
                    var newArray = categoriesData
                        .filter((item) => {
                            return (item.parent_category_id === data.store_sub_category_id &&
                                item.parent_category_id !== item.sub_category_id);
                        })
                    data['sub_category_data'] = (newArray);
                });


                mainCategoryResult.forEach((data) => {
                    var newArray = storeSubCategoryResult
                        .filter(item => item.sub_store_category_id === data.main_category_id)
                    data['store_sub_category_name'] = (newArray);
                })
                res.json({
                    "message": "Category list",
                    "store_categories": mainCategoryResult
                });
            }
            dbConn.release();
        });
    });
}

exports.getAllStoreCategoriesBasedOnZipCode = function (req, res) {
    const newStoreCategory = req.body;
    let sql = `CALL GET_ALL_STORE_CATEGORIES_ZIPCODE(?)`;
    pool.getConnection(function (err, dbConn) {
        dbConn.query(sql, [req.body.filterBy],
            function (err, storeCategory) {
                if (err) {
                    console.log("error: ", err);
                    res.json({
                        "message": "store Category not found",
                        "status": 400,
                        "category_id": 0
                    });
                }
                else {
                    res.json({
                        "message": "store Categories",
                        "status": 200,
                        "store_categories": storeCategory[0]
                    });
                }
                dbConn.release();
            });
    });
}

exports.getAllStoreCategories = function (req, res) {
    const newStoreCategory = req.body;
    let sql = `CALL GET_ALL_STORE_CATEGORIES(?)`;
    pool.getConnection(function (err, dbConn) {
        dbConn.query(sql, [req.body.filterBy],
            function (err, storeCategory) {
                if (err) {
                    console.log("error: ", err);
                    res.json({
                        "message": "store Category not found",
                        "status": 400,
                        "category_id": 0
                    });
                }
                else {
                    res.json({
                        "message": "store Categories",
                        "status": 200,
                        "store_categories": storeCategory[0]
                    });
                }
                dbConn.release();
            });
    });
}

exports.getBannerImages = function (req, res) {
    const newStoreCategory = req.body;
    let sql = `CALL GET_STORE_BannerImages(?)`;
    pool.getConnection(function (err, dbConn) {
        dbConn.query(sql, [req.body.filterBy],
            function (err, bannerimages) {
                if (err) {
                    console.log("error: ", err);
                    res.json({
                        "message": "store banner images not found",
                        "status": 400,
                        "category_id": 0
                    });
                }
                else {
                    res.json({
                        "message": "store banner images",
                        "status": 200,
                        "store_banner_images": bannerimages[0]
                    });
                }
                dbConn.release();
            });
    });
}

exports.updateSubCategoryImages = function (categoryId, imageUrl, req, res) {
    let sql = `CALL UPDATE_STORE_SUBCATEGORYIMAGES(?,?,?)`;
    let category_id = +categoryId;
    let image_url = imageUrl;
    let status = 1;
    pool.getConnection(function (err, dbConn) {
        dbConn.query(sql, [category_id, image_url, status],
            function (err, updatedCategory) {
                if (err) {
                    console.log("error: ", err);
                    res.json({
                        "status": 400,
                        "message": "category images not updated",
                        "product_id": 0
                    })
                }
                else {
                    res.json({
                        "status": 200,
                        'image_url': req.file.location,
                        "message": "category detail",
                        "product": updatedCategory[0][0]
                    });
                }
                dbConn.release();
            });
    });
}

exports.updateStoreCategoryImages = function (storeCategory_id, imageUrl, req, res) {
    let sql = `CALL UPDATE_STORE_CATEGORY(?,?,?)`;
    let storeCategoryId = +storeCategory_id;
    let image_url = imageUrl;
    let status = 1;
    pool.getConnection(function (err, dbConn) {
        dbConn.query(sql, [storeCategoryId, image_url, status],
            function (err, updatedCategory) {
                if (err) {
                    console.log("error: ", err);
                    res.json({
                        "status": 400,
                        "message": "category images not updated",
                        "product_id": 0
                    })
                }
                else {
                    res.json({
                        "status": 200,
                        'image_url': req.file.location,
                        "message": "category detail",
                        "product": updatedCategory[0][0]
                    });
                }
                dbConn.release();
            });
    });
}


exports.getStoreCategory = function (req, res) {
    pool.getConnection(function (err, dbConn) {
        dbConn.query("select * from main_categories WHERE store_category_id = ?",
            [req.params.category_id], function (err, storeCategory) {
                if (err) {
                    console.log("error: ", err);
                }
                else {
                    res.json({
                        "message": "store category information",
                        "status": 200,
                        "category": storeCategory,
                        "category_id": req.params.category_id
                    });
                }
                dbConn.release();
            });
    });
}


exports.postStoreCategories = function (req, res) {
    const newStoreCategory = req.body;
    let sql = `CALL ADD_NEW_STORE_CATEGORY(?,?,?)`;
    let store_category_name = req.body.storeCategoryName;
    let store_category_ranking = +req.body.storeCategoryRanking;
    let status = +req.body.status;
    pool.getConnection(function (err, dbConn) {
        dbConn.query(sql, [store_category_name, store_category_ranking, status],
            function (err, storeCategory) {
                if (err) {
                    console.log("error: ", err);
                    res.json({
                        "message": "store Category not added",
                        "status": 400,
                        "category_id": 0
                    });
                }
                else {
                    res.json({
                        "message": "store Category added",
                        "status": 200,
                        "category_id": storeCategory[0][0]['store_category_id']
                    });
                }
                dbConn.release();
            });
    });
}

exports.updateStoreCategory = function (req, res) {
    const updateStoreCategories = req.body;
    pool.getConnection(function (err, dbConn) {
        dbConn.query("UPDATE main_categories SET ? WHERE store_category_id = ?",
            [updateStoreCategories, req.body.store_category_id], function (err, storeCategory) {
                if (err) {
                    console.log("error: ", err);
                }
                else {
                    let updated = false;
                    if (storeCategory.affectedRows == 1) {
                        updated = true;
                    }
                    res.json({
                        "message": (updated) ? "store Category updated successfully" : "invalid category id",
                        "status": (updated) ? 200 : 400,
                        "category": storeCategory,
                        "category_id": req.body.store_category_id
                    });
                }
                dbConn.release();
            });
    });
}

exports.postStoreSubCategories = function (req, res) {
    const newStoreCategory = req.body;
    let sql = `CALL ADD_NEW_STORE_SUBCATEGORY(?,?)`;
    let store_category_id = +req.body.store_category_id;
    let category_name = req.body.categoryName;

    pool.getConnection(function (err, dbConn) {
        dbConn.query(sql, [store_category_id, category_name],
            function (err, storeSubCategory) {
                if (err) {
                    console.log("error: ", err);
                    res.json({
                        "message": "store sub category not added",
                        "status": 400,
                        "category_id": 0
                    });
                }
                else {
                    res.json({
                        "message": "store sub category added successfully",
                        "status": 200,
                        "category_id": storeSubCategory[0][0]['store_sub_category_id']
                    });
                }
                dbConn.release();
            });
    });
}

exports.updateStoreSubCategory = function (req, res) {
    const updateStoreSubCategories = req.body;
    pool.getConnection(function (err, dbConn) {
        dbConn.query("UPDATE categories SET ? WHERE category_id = ?",
            [updateStoreSubCategories, req.body.category_id], function (err, storeSubCategory) {
                if (err) {
                    console.log("error: ", err);
                }
                else {
                    let updated = false;
                    if (storeSubCategory.affectedRows == 1) {
                        updated = true;
                    }
                    res.json({
                        "message": (updated) ? "store sub Category updated successfully" : "invalid category id",
                        "status": (updated) ? 200 : 400,
                        "category_id": req.body.category_id
                    });
                }
                dbConn.release();
            });
    });
}

exports.deleteStoreSubCategory = function (req, res) {
    pool.getConnection(function (err, dbConn) {
        dbConn.query("DELETE FROM categories WHERE category_id = ? ", req.params.store_category_id,
            function (err, storeSubCategory) {
                if (err) {
                    console.log("error: ", err);
                }
                else {
                    let deleted = false;
                    if (storeSubCategory.affectedRows == 1) {
                        deleted = true;
                    }
                    res.json({
                        "message": (deleted) ? "store sub Category deleted successfully" : "invalid category id",
                        "status": (deleted) ? 200 : 400,
                        "store_sub_category_id": req.params.store_category_id
                    });
                }
                dbConn.release();
            });
    });
}


exports.deleteStoreCategory = function (req, res) {
    pool.getConnection(function (err, dbConn) {
        dbConn.query("DELETE FROM main_categories WHERE store_category_id = ? ", req.params.category_id,
            function (err, storeCategory) {
                if (err) {
                    console.log("error: ", err);
                }
                else {
                    let deleted = false;
                    if (storeCategory.affectedRows == 1) {
                        deleted = true;
                    }
                    res.json({
                        "message": (deleted) ? "store Category deleted successfully" : "invalid category id",
                        "status": (deleted) ? 200 : 400,
                        "category_id": req.params.category_id
                    });
                }
                dbConn.release();
            });
    });
}


//---------------------------- //

exports.postSubCategory = function (req, res) {
    const newStoreCategory = req.body;
    let sql = `CALL ADD_NEW_SUBCATEGORY(?,?)`;
    let store_sub_category_id = +req.body.store_sub_category_id;
    let sub_category_name = req.body.subCategoryName;
    pool.getConnection(function (err, dbConn) {
        dbConn.query(sql, [store_sub_category_id, sub_category_name],
            function (err, subCategory) {
                if (err) {
                    console.log("error: ", err);
                    res.json({
                        "message": "sub category not added",
                        "status": 400,
                        "category_id": 0
                    });
                }
                else {
                    res.json({
                        "message": "sub category added successfully",
                        "status": 200,
                        "category_id": subCategory[0][0]['sub_category_id']
                    });
                }
                dbConn.release();
            });
    });
}

exports.updateSubCategory = function (req, res) {
    const updateStoreSubCategories = req.body;
    pool.getConnection(function (err, dbConn) {
        dbConn.query("UPDATE categories SET ? WHERE category_id = ?",
            [updateStoreSubCategories, req.body.category_id], function (err, storeSubCategory) {
                if (err) {
                    console.log("error: ", err);
                }
                else {
                    let updated = false;
                    if (storeSubCategory.affectedRows == 1) {
                        updated = true;
                    }
                    res.json({
                        "message": (updated) ? "sub Category updated successfully" : "invalid category id",
                        "status": (updated) ? 200 : 400,
                        "category_id": req.body.category_id
                    });
                }
                dbConn.release();
            });
    });
}

exports.deleteSubCategory = function (req, res) {
    pool.getConnection(function (err, dbConn) {
        dbConn.query("DELETE FROM categories WHERE category_id = ? ", req.params.sub_category_id,
            function (err, subCategory) {
                if (err) {
                    console.log("error: ", err);
                }
                else {
                    let deleted = false;
                    if (subCategory.affectedRows == 1) {
                        deleted = true;
                    }
                    res.json({
                        "message": (deleted) ? "sub Category deleted successfully" : "invalid category id",
                        "status": (deleted) ? 200 : 400,
                        "category_id": req.body.category_id
                    });
                }
                dbConn.release();
            });
    });
}




