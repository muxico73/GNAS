// JavaScript File
function gnasEvent(eventType) {
  this.eventType = eventType;
  this.unique = '';
  this.severity = ''
  this.urgency = ''
  this.certainty = ''
  this.fipsArray = [];
  this.ugcArray = [];
}
gnasEvent.prototype.setUnique = function(uri) {
  var pieces = uri.split(".");
  var index = pieces.length;
  this.unique = pieces[index];
}

var feed = "http://alerts.weather.gov/cap/us.php?x=0";

var FeedParser = require('feedparser'),
    request = require('request'),
    HashMap = require('hashmap');
    
var req = request(feed),
    feedparser = new FeedParser(),
    alerts = new HashMap(),
    weatherEvents = new HashMap();

