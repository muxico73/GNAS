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

// we need MONGO and monk
// DB code
var mongo = require('mongodb');
var monk = require('monk');
//var db = monk(process.env.IP + ':27017/alertlist');
var dbFIPS = monk('localhost:27017/FIPS');
var dbCust = monk('localhost:27017/customer');
var dbZip = monk('localhost:27017/zip');

//TODO:
// Michael, this was my attempt to sync the callbacks from the db.
//NOT WORKING now
//
// This approach might work:
// http://www.codexpedia.com/javascript/nodejs-sync-nested-mysql-queries/
// I have to leave for today. we can catch up tomorrow
// the queries below should all work, but they're breaking because they run async

function countycallback (e,counties){
  var zipcollection = dbZip.get('zipcollection');
  zipcollection.find({county: counties[0].county, state: counties[0].state}, zipcb);
}

function zipcb(e,zips){
  var custcollection = dbCust.get('customercollection');
  custcollection.find({zipcode: zips[0].zipcode},custcb);
}

function custcb(e,cust){
  custList.push(cust);
}

var discoverPhones = function (inputArray) {
  var countyList = [];
  var zipList = [];
  var custList = [];
  //from FIPS, get County
  var collection = dbFIPS.get('countycollection');
  if (inputArray.length < 0) return "";

  for (i = 0; i < inputArray.length; i++) {
    collection.find({FIPS: inputArray[i]}, countycallback);
  }

  // at this point, custList has everything
  // need to return a list of phone numbers, with the right formatting, comma separated
  return formatEmails(custList);
}

function formatEmails(custList) {
  if (custList.length < 0) return "";
  var emails = "";
  for (i = 0; i < custList.length; i++) {
    emails = emails + custList[i].telephonenumber.replace(/-/g, '') + "@txt.att.net, ";
  }
  //need to trim the last ', '
  return emails.substring(0,emails.length-2);
}


feedparser.on('end', function() {
  var customerPhones = '';
  var alertString = "";
  weatherEvents.forEach(function(value, key) {
    switch (value.severity) {
      case "Extreme":
        if ((value.certainty == "Observed" || value.certainty == "Likely")) {
          customerPhones = discoverPhones(value.fipsArray);
          alertString += "Extreme weather event " + value.certainty + " - " + value.eventType + " - need to notify customers\r\n";
          alertString += value.fips + ": " + value.fipsArray + "\r\n";
        }
        break;
      case "Severe":
        if ((value.certainty == "Observed" || value.certainty == "Likely")) {
          customerPhones = discoverPhones(value.fipsArray);
          alertString += "Severe weather event " + value.certainty + " - " + value.eventType + " - need to notify customers\r\n";
          alertString += value.fips + ": " + value.fipsArray + "\r\n";
        }
        break;
    }

  });

  customerPhones = '2176491422@txt.att.net, 3097509512@txt.att.net, 2172026548@txt.att.net';
  console.log("entering mail");
  var mailOptions = {
    from: '"State Farm" <gnas@alvinbaker.com>', // sender address
    to: customerPhones, // list of receivers
    subject: '', // Subject line
    text: "Severe weather alert - take cover now!!!!", // plaintext body
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
