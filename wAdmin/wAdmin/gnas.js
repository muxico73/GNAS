function gnasEvent(eventType) {
  this.eventType = eventType;
  this.unique = '';
  this.severity = ''
  this.urgency = ''
  this.certainty = ''
  this.fips = "FIPS6";
  this.fipsArray = [];
  this.ugc = "UGC";
  this.ugcArray = [];
};
gnasEvent.prototype.setUnique = function(uri) {
  var pieces = uri.split(".");
  var index = pieces.length;
  this.unique = pieces[index - 1];
};
gnasEvent.prototype.toString = function() {
  var returnString = "Event: " + this.eventType;
  returnString += " Severity: " + this.severity;
  returnString += " Urgency: " + this.urgency;
  returnString += " Certainty: " + this.certainty;
  returnString += " " + this.fips + ": " + this.fipsArray;
  returnString += " " + this.ugc + ": " + this.ugcArray;
  return (returnString);
};

var feed = "http://alerts.weather.gov/cap/us.php?x=0";

var FeedParser = require('feedparser'),
  request = require('request'),
  HashMap = require('hashmap'),
  MongoClient = require('mongodb').MongoClient,
  nodemailer = require('nodemailer');
  
var smtpConfig = {
    host: 'smtp.1and1.com',
    port: 587,
    secure: false, // use SSL
    requireTLS: true,
    auth: {
        user: 'gnas@alvinbaker.com',
        pass: 'G00dn31ghbor'
    }
};

var   transporter = nodemailer.createTransport(smtpConfig);
// verify connection configuration
transporter.verify(function(error, success) {
   if (error) {
        console.log(error);
   } else {
        console.log('Server is ready to take our messages');
   }
});


var req = request(feed),
  feedparser = new FeedParser(),
  weatherEvents = new HashMap();

setInterval(function() {
  req = "";
  req = request(feed);
  console.log("Interval expired");
}, 2 * 60 * 1000);

req.on('error', function(error) {
  console.error(error);
});

req.on('response', function(res) {
  var stream = this;

  if (res.statusCode != 200) return this.emit('error', new Error('Bad status code'));

  stream.pipe(feedparser);
});

feedparser.on('error', function(error) {
  console.error(error);
});

feedparser.on('readable', function() {
  // This is where the action is!
  var stream = this,
    alert, event, map_key = "#";
  //  var capArray = ["cap:event", "cap:status", "cap:msgtyp", "cap:category", "cap:urgency", "cap:severity", "cap:certainty", "cap:areadesc", "cap:polygon"];

  while (alert = stream.read()) {
    var unique = alert.guid;
    if (event = weatherEvents.get(unique)) {
      console.log("Found event");
    }
    else {
      event = new gnasEvent(alert["cap:event"][map_key]);
      event.certainty = alert["cap:certainty"][map_key];
      event.urgency = alert["cap:urgency"][map_key];
      event.severity = alert["cap:severity"][map_key];
      event.setUnique(alert.guid);
      var geocode = alert["cap:geocode"];
      event.fipsArray = geocode["value"][0][map_key].split(" ");
      event.ugcArray = geocode["value"][1][map_key].split(" ");

      weatherEvents.set(unique, event);
    }
  }

});

feedparser.on('end', function() {
  var alertString = "";
  weatherEvents.forEach(function(value, key) {
    switch (value.severity) {
      case "Extreme":
        if ((value.certainty == "Observed" || value.certainty == "Likely")) {
          alertString += "Extreme weather event " + value.certainty + " - " + value.eventType + " - need to notify customers\r\n";
          alertString += value.fips + ": " + value.fipsArray + "\r\n";
        }
        break;
      case "Severe":
        if ((value.certainty == "Observed" || value.certainty == "Likely")) {
          alertString += "Severe weather event " + value.certainty + " - " + value.eventType + " - need to notify customers\r\n";
          alertString += value.fips + ": " + value.fipsArray + "\r\n";
        }
        break;
    }

  });

  console.log("entering mail");
  var mailOptions = {
    from: '"GNAS Alert" <gnas@alvinbaker.com>', // sender address
    to: 'gnas@alvinbaker.com, lyonsden@lyons-family.net', // list of receivers
    subject: '', // Subject line
    text: alertString, // plaintext body
    // html: '<b>Hello world 🐴</b>' // html body
  };

  // send mail with defined transport object
  console.log("sending mail");
  transporter.sendMail(mailOptions, function(error, info) {
    if (error) {
      return console.log(error);
    }
    console.log('Message sent: ' + info.response);
  });
  console.log("sent mail");
});
