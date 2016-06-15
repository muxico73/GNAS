//var geonames = require('geonames-stream'),
var request = require('request'),
    through = require('through2');
    
var mongo = require('mongodb');
var monk = require('monk');
//var db = monk(process.env.IP + ':27017/alertlist');
var db = monk('localhost:27017/zip');

function writeToDB (data) {
  // Set a collection
  var userCol = db.get('zipcollection');
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
    var result = {
        zipcode: values[0],
        state: values[3],
        county: values[4]
    };
    return result;
}

var linereader = require('through2-linereader');

var fs = require('fs');
fs.createReadStream('us_postal_codes.csv', 'utf8')
    .pipe(linereader())
    .on('data', function(line){
        writeToDB(line);
})


console.log("done!");