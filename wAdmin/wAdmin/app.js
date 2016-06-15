
/**
 * Module dependencies.
 */

var express = require('express')
  , routes = require('./routes')
  , user = require('./routes/user')
  , alertlist = require('./routes/alertlist')
  , alertinfo = require('./routes/alertinfo')
//  , geonode = require('./routes/geonode')
  , http = require('http')
  , path = require('path');

var app = express();

// DB code
var mongo = require('mongodb');
var monk = require('monk');
var db = monk(process.env.IP + ':27017/alertlist');
// Make our db accessible to our router
app.use(function(req,res,next){
    req.db = db;
    next();
});

// pass in express app
var smartalert = require('./routes/smartalert')(app);

// all environments
app.set('port', process.env.PORT || 3000);
app.set('views', __dirname + '/views');
app.set('view engine', 'jade');
app.use(express.favicon());
app.use(express.logger('dev'));
app.use(express.bodyParser());
app.use(express.methodOverride());
app.use(app.router);
app.use(express.static(path.join(__dirname, 'public')));


// development only
if ('development' == app.get('env')) {
  app.use(express.errorHandler());
}


//var alertlist = require('./routes/alertlist');
//default Express routing comes here
app.get('/', routes.index);
app.get('/users', user.list);
app.get('/alertlist', alertlist.list);
app.get('/alertinfo/:name', alertinfo.list);
//app.get('/:collection.:format', geonode.list);

http.createServer(app).listen(app.get('port'), function(){
  console.log('Express server listening on port ' + app.get('port'));
});
