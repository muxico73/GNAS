//var geonames = require('geonames-stream'),
var request = require('request'),
    through = require('through2');
    
var mongo = require('mongodb');
var monk = require('monk');
//var db = monk(process.env.IP + ':27017/alertlist');
var db = monk('localhost:27017/customer');

function writeToDB (data) {
  // Set a collection
  var userCol = db.get('customercollection');

  var errFunc = function (err, doc) {
      if (err) {
          // If it failed, return error
          console.log("There was a problem adding " + temp.name + " to the database. Error: " + err.message);
      } else {
         // console.log("Inserted record: " + element.name + " succesffully.");
      }
  };
  
  // Submit to the DB
  userCol.insert(data, errFunc);
}

var linereader = require('through2-linereader');

var fs = require('fs');
fs.createReadStream('../customer.json', 'utf8')
    .pipe(linereader())
    .on('data', function(line){
        writeToDB(line);
})


console.log("done!");