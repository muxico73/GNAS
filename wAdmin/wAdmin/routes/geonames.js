//var geonames = require('geonames-stream'),
var request = require('request'),
    through = require('through2');
    
var mongo = require('mongodb');
var monk = require('monk');
var db = monk(process.env.IP + ':27017/alertlist');

function writeToDB (element) {
  //remove the assigned id
  var temp = element;
  delete temp['_id'];

  // Set a collection
  var userCol = db.get('citiescollection');

  var errFunc = function (err, doc) {
      if (err) {
          // If it failed, return error
          console.log("There was a problem adding " + element.name + " to the database. Error: " + err.message);
      }
  };
  
  // Submit to the DB
  userCol.insert(temp, errFunc);
}

function writeFeatureToDB (feature) {
  //remove the assigned id
  var temp = feature;
  temp.name = temp.properties.NAME;
  // Set a collection
  var userCol = db.get('citiescollection');

  var errFunc = function (err, doc) {
      if (err) {
          // If it failed, return error
          console.log("There was a problem adding " + temp.name + " to the database. Error: " + err.message);
      } else {
         // console.log("Inserted record: " + element.name + " succesffully.");
      }
  };
  
  // Submit to the DB
  userCol.insert(temp, errFunc);
}

var cities = "";

request.get( {url:'http://eric.clst.org/wupl/Stuff/gz_2010_us_050_00_500k.json', json:'true'},
    function(error, response, body) {
        processResult(body);
  }
);

function processResult (cities) {
  var feat = cities.features;
  
  for (var i = feat.length; i--; ) {
    writeFeatureToDB(feat[i]);
  }
};

console.log("done!");