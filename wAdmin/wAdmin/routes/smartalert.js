// just a dummy response for now, persistence we'll add later
var dummyResponse =  {
    "name":"Hail Warning",
    "id":123,
    "phenomenon":"Hail",
    "level":"Warning",
    "description":"Weather Alert! Hail Warning.",
    "zip":"61761",
    "links":[
        {
            "linkType":"application/vnd.smartbid.send",
            "rel":"Send email to customers",
            "href":"/alerts/123/sendmail"
        },
        {
            "linkType":"application/vnd.smartbid.report",
            "rel":"Get reports on this alert",
            "href":"/info/123/alertReport"
        },
        {
            "linkType":"application/vnd.smartbid.info",
            "rel":"Get alert's details",
            "href":"/info/123"
        }
    ]
};

var get = function(req, res){
    res.type('application/vnd.smartbid.info+json');
    res.send(200,dummyResponse);
};

 
module.exports = function(app) {
    app.get('/info/:itemid', get);
}
