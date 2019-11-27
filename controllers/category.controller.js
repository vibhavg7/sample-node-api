var mysql = require('mysql');
var _ = require('lodash');
var dbConn = mysql.createConnection({
    host: 'vibhavg91.cce5kiug4ajr.us-east-2.rds.amazonaws.com',
    user: 'root',
    password: 'password',
    database: 'grostep'
});
// connect to database
dbConn.connect();


exports.getSubCategoryInfo = function(req,res)
{
    let sql = `CALL GET_SUBCATEGORYINFO(?)`;
    let sub_category_id = +req.params.sub_category_id;
    

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
    _});
}

exports.getCategoryInfo = function (req, res) {
    let sql = `CALL GET_CATEGORY_INFO(?)`;
    let categoryId = +req.params.store_category_id;
    

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
                        "sub_store_category_id": item.sub_store_category_id,
                        "sub_category_data": []
                    })
                }
            }
            map.clear();

            storeSubCategoryResult.forEach((data) => {
                var newArray = categoriesData
                    .filter(item => item.parent_category_id === data.store_sub_category_id)
                    .map(item => ({
                        'sub_category_name': item.sub_category_name,
                        'sub_category_id': item.sub_category_id
                    }));
                data['sub_category_data'] = (newArray);
            });

            mainCategoryResult.forEach((data) => {
                var newArray = storeSubCategoryResult
                    .filter(item => item.sub_store_category_id === data.main_category_id)
                    // .map(item => ({
                    //     'sub_category_name': item.sub_category_name,
                    //     'sub_category_id': item.sub_category_id
                    // }));
                data['store_sub_category_name'] = (newArray);
            })
            res.json({
                "message": "Category list",
                "store_categories": mainCategoryResult
            });
        }
    });
}

exports.getAllStoreCategories = function(req,res) {
    const newStoreCategory = req.body;
    let sql = `CALL GET_ALL_STORE_CATEGORIES(?)`;    

    dbConn.query(sql,[req.body.filterBy],
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
        });
}


exports.getStoreCategory = function(req,res){
    // const updateStoreCategories = req.body;
    // console.log(req.body)
    dbConn.query("select * from store_categories WHERE store_category_id = ?",
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
        });
}


exports.postStoreCategories = function (req, res) {
    const newStoreCategory = req.body;
    let sql = `CALL ADD_NEW_STORE_CATEGORY(?,?,?)`;
    let store_category_name = req.body.storeCategoryName;
    let store_category_ranking = +req.body.storeCategoryRanking;
    let status = +req.body.status;

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
        });
}

exports.updateStoreCategory = function (req, res) {
    const updateStoreCategories = req.body;
    dbConn.query("UPDATE store_categories SET ? WHERE store_category_id = ?",
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
        });
}

exports.postStoreSubCategories = function (req, res) {
    const newStoreCategory = req.body;
    let sql = `CALL ADD_NEW_STORE_SUBCATEGORY(?,?)`;
    let store_category_id = +req.body.store_category_id;
    let category_name = req.body.categoryName;
    // let url = '';
    // let status = +req.body.status;
    // let ranking = +req.body.categoryRanking;

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
        });
}

exports.updateStoreSubCategory = function (req, res) {
    const updateStoreSubCategories = req.body;
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
        });
}

exports.deleteStoreSubCategory = function (req, res) {
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
        });
}


exports.deleteStoreCategory = function (req, res) {
    dbConn.query("DELETE FROM store_categories WHERE store_category_id = ? ", req.params.category_id,
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
        });
}


//---------------------------- //

exports.postSubCategory = function (req, res) {
    const newStoreCategory = req.body;
    let sql = `CALL ADD_NEW_SUBCATEGORY(?,?)`;
    let store_sub_category_id = +req.body.store_sub_category_id;
    let sub_category_name = req.body.subCategoryName;
    // let url = '';
    // let status = +req.body.status;
    // let ranking = +req.body.categoryRanking;

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
        });
}

exports.updateSubCategory = function (req, res) {
    const updateStoreSubCategories = req.body;
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
        });
}

exports.deleteSubCategory = function (req, res) {
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
        });
}




