exports.list = function(req, res) {
    var db = req.db;
    var collection = db.get('citiescollection');
    collection.find({name: req.params.name},function(e,cities){
        var test = cities;
        res.render('citieslist', {
            "citieslist" : cities
        });
    });
}; 
