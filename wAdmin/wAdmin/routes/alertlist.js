
// DB code
//var mongo = require('mongodb');
//var db = require('monk')(process.env.IP + ':27017/alertlist');

/* GET Userlist page. */
exports.list = function(req, res) {
    var db = req.db;
    var collection = db.get('usercollection');
    collection.find({},function(e,alerts){
        res.render('alertlist', {
            "alertlist" : alerts
        });
    });
}; 
