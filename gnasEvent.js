// JavaScript File
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
  this.unique = pieces[index-1];
};
gnasEvent.prototype.toString = function() {
  var returnString = "Event: " + this.eventType;
  returnString += " Severity: " + this.severity;
  returnString += " Urgency: " + this.urgency;
  returnString += " Certainty: " + this.certainty;
  returnString += " " + this.fips + ": " + this.fipsArray;
  returnString += " " + this.ugc + ": " + this.ugcArray;
  return(returnString);
};