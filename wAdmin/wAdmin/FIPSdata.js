//var geonames = require('geonames-stream'),
var request = require('request'),
    through = require('through2');
    
var mongo = require('mongodb');
var monk = require('monk');
//var db = monk(process.env.IP + ':27017/alertlist');
var db = monk('localhost:27017/FIPS');

function writeToDB (data) {
  // Set a collection
  var userCol = db.get('countycollection');
    //define error function
  var errFunc = function (err, doc) {
      if (err) {
          // If it failed, return error
          console.log("There was a problem adding " + data.toJSON().name + " to the database. Error: " + err.message);
      } else {
         // console.log("Inserted record: " + element.name + " succesffully.");
      }
  };

    userCol.insert(sanitize(data), errFunc);
}

function sanitize (line) {
    text = line.toString();
    var values = text.split(",");
    var countyData  = "";
    if (values[3].indexOf(" County") > 0) {
        countyData = values[3].substring(0,values[3].indexOf(" County"));
    } else {
        countyData = values[3];
    }
    var result = {
        state: values[0],
        FIPS: "0" + values[1] + values[2],
        county: countyData
    };
    return result;
}

var linereader = require('through2-linereader');

var fs = require('fs');
fs.createReadStream('national_county.txt', 'utf8')
    .pipe(linereader())
    .on('data', function(line){
        writeToDB(line);
})


console.log("done!");