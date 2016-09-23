/*eslint-env node*/
var express = require('express');
var cfenv = require('cfenv');
var atob = require('atob');
var app = express();
// serve the files out of ./public as our main files
app.use(express.static(__dirname + '/public'));
// get the app environment from Cloud Foundry
var appEnv = cfenv.getAppEnv();
// start server on the specified port and binding host
app.listen(appEnv.port, '0.0.0.0', function() {
	// print a message when the server starts listening
  console.log("server starting on " + appEnv.url);
});

//sleep function..
function sleep(ms) {
    var unixtime_ms = new Date().getTime();
    while(new Date().getTime() < unixtime_ms + ms) {}
}
var XMLHttpRequest = require("xmlhttprequest").XMLHttpRequest;
var Httpreq = new XMLHttpRequest();

//*******************************************
// IoTP Configs
var Client = require("ibmiotf");
var http = require("http");
var https = require("https");

var deviceClientConfig = {
	"org":"5gjnve",
	"id":"Room1",
	"type":"RoomDevice",
	"auth-method":"token",
	"auth-token":"u0+Du_xrhxueAErY_N"
};
var deviceClient = new Client.IotfDevice(deviceClientConfig);

var appClientConfig = {
	"org":"5gjnve",
	"id":"analyticsapp" + randomString(5),
	"auth-key":"a-5gjnve-jymdez4wjx",
	"auth-token":"_!RaA++40z8sp3NBKw"
};
var appClient = new Client.IotfApplication(appClientConfig);

//---------------------------------------

function randomString(length){
  var text = "";
  var allowed = "abcdefghijklmnopqrstuvwvxyz12345678";
  for (var i = 0; i<length;i++){
    text += allowed.charAt(Math.floor(Math.random() * allowed.length));
  }
  return text;
}

//----------------------------------------

appClient.connect();
deviceClient.connect();

deviceClient.on('connect', function() {
	console.log("device connected");
	updateOccupancy();
});

appClient.on('connect',function() {
	console.log("application connected");
	appClient.subscribeToDeviceEvents();
});


appClient.on("deviceEvent", function (deviceType, deviceId, eventType, format, payload) {

    console.log("Device Event from :: "+deviceType+" : "+deviceId+" of event "+eventType+" with payload : "+payload);
    //parse payload, update corresponding current state variable
    if (deviceType != "RoomDevice"){
	    var receivedData = JSON.parse(payload);
      var dataType;
      //var dataType = Object.keys(receivedData)[0];
      //dataType = Object.keys(receivedData)[1];
      for (var i in Object.keys(receivedData)){
        var tmptype = Object.keys(receivedData)[i];
        //console.log("tmptype: " + tmptype);
        if (tmptype != "timestamp"){
          dataType = tmptype;
        }
      }
      console.log("dataType set to : " + dataType);
	    
	    switch(true) {
	    case (dataType == "motion"):
	    	currentMotion = receivedData[dataType];
	    	console.log("Updated currentMotion to " + currentMotion);
	    	break;
    	case (dataType == "temperature"):
    		currentTemp = receivedData[dataType];
    		console.log("Updated currentTemp to " + currentTemp);
    		break;
    	case (dataType == "contact"):
    		currentDoorClosed = receivedData[dataType];
    		console.log("Updated currentDoorClosed to " + currentDoorClosed);
    		break;
      case (dataType == "motion_image"):
        currentMotionImage = receivedData[dataType];
        console.log("Updated currentMotionImage to " + currentMotionImage);
        break;
  		default:
  			console.log("Unrecognized data type: " + dataType);

	    }
		updateOccupancy();
	}

//Device Event from :: smartthings : fb5d41b4-2e69-4f44-8cdb-f27ae4189e68 of event motion with payload : {"timestamp":"2016-07-12T21:29:14.932Z","motion":false}

});

// Handle errors
deviceClient.on("error", function (err) {
    console.log("DeviceError : "+err);
});

appClient.on("error", function (err) {
    console.log("AppError : "+err);
});

//**************************************************************************
// Weights of each sensor data type to determine occupancy
// Update as more sensors and types are added
//**************************************************************************
var OCCUPIED_STATUS = ["No","Maybe","Yes"];
var OCCUPIED_THRESHOLD_YES = 0.7;
var OCCUPIED_THRESHOLD_MAYBE = 0.3;
var WEIGHT_MOTION = 0.8;
var WEIGHT_CONTACT = 0.3;
var WEIGHT_MOTION_IMAGE = 0.5;

//**************************************************************************

// How confident we are that someone is in the room
var occupiedConfidence = 0;

//initialize the following by getting last value from database

var currentOccupied = OCCUPIED_STATUS[0];
var currentTemp = getDataFromDB("motion_temp");
var currentMotion = getDataFromDB("motion");
var currentDoorClosed = getDataFromDB("contact");
var currentMotionImage = false;
//-------------------------------------------------------

function createURL(dataType) {
// Get latest data from database
	var timeObject = new Date();

	var yesterday = new Date(timeObject);
	yesterday.setDate(timeObject.getDate() - 1);

	var timeObj2   = new Date();

	timeObj2 = yesterday.toISOString();
	timeObject = timeObject.toISOString();

	var url = encodeURI('http://cognitiveroom.mybluemix.net/data?type='+dataType+'&start_key='+timeObj2+'&end_key='+timeObject);
	console.log(url);
	return url;
}

/**********************
Data Types:
"motion"
"motion_temp" - temperature
"contact" - door open/closed

**********************/

function getDataFromDB(dataType) {
// Get latest datapoint from database
	var timeObject = new Date();
	var yesterday = new Date(timeObject);
	yesterday.setDate(timeObject.getDate() - 1);
	var timeObj2   = new Date();
	timeObj2 = yesterday.toISOString();
	timeObject = timeObject.toISOString();

	var url = encodeURI('http://cognitiveroom.mybluemix.net/data?type='+dataType+'&start_key='+timeObj2+'&end_key='+timeObject);
	console.log("getting data from : " + url);

	try {
    var datapoint = filterGetLatest(GetReq(url));
  }
  catch(err) {
    console.log(err.message);
  }
	console.log("Initializing value of " + dataType + " to " + datapoint);
	return datapoint;
}

function GetReq(yourUrl){
	Httpreq.open("GET",yourUrl,false);
	Httpreq.send(null);
	return Httpreq.responseText;
}

function filterGetLatest(msg){
	var original = JSON.parse(msg);
	var j = original.data.length;
	var lastrow = original.data[j-1];

	// console.log("lastrow" + JSON.stringify(lastrow));

	var name = Object.keys(lastrow)[1]; // Get the first item of the list;  = key name
	var value = lastrow[name];
	// console.log(name + ': ' +value);

	return value;
}

//-------------------------------------------------

function updateOccupancy() {
	//called after receive a device event
	//calculate occupiedConfidence based on current values of sensors then publish room state
	var motionNum = 0;
	var doorClosedNum = 0;
  var motionImageNum = 0;

	// if motion, probably someone in room
	if (currentMotion == true){ motionNum = 1;}
  // if motion from image , probably someone in room
  if (currentMotionImage == "true"){ motionImageNum = 1;}
	// door is closed all the time
	if (currentDoorClosed == false) { doorClosedNum = 1;}

  // occupiedConfidence = sum(weight * data)
	occupiedConfidence = (motionNum * WEIGHT_MOTION) + (doorClosedNum * WEIGHT_CONTACT) + (motionImageNum * WEIGHT_MOTION_IMAGE);
  console.log("occupied confidence: " + occupiedConfidence);

	switch(true) {
    case (occupiedConfidence >= OCCUPIED_THRESHOLD_YES):
        currentOccupied = OCCUPIED_STATUS[2];
        break;
    case (occupiedConfidence >= OCCUPIED_THRESHOLD_MAYBE && occupiedConfidence < OCCUPIED_THRESHOLD_YES):
        currentOccupied = OCCUPIED_STATUS[1];
        break;
    default:
        currentOccupied = OCCUPIED_STATUS[0];
	}

	publishRoomState();
}

function publishRoomState(){
	//publish room state
	var time = new Date().toISOString();

	//TODO: add averages
	var payload = '{"d":{"occupiedState":"'+ currentOccupied + '", "stats":{"temp":' + currentTemp + ', "motion":' + (currentMotion) + ', "motion_image":' + currentMotionImage + ', "doorClosed":' + currentDoorClosed + '}}, "ts":"'+time+ '"}';

	console.log("Publishing room state with payload: " + payload);
	deviceClient.publish("roomStatus","json",payload);
}

app.get('/lastData', function(req, res) {
  var apiKey = appClientConfig['auth-key'];
  var apiToken = appClientConfig['auth-token'];
  var options = {
    host: "5gjnve.internetofthings.ibmcloud.com",
    path: "/api/v0002/device/types/RoomDevice/devices/Room1/events/roomStatus",
    port: 443,
    method: "GET",
    auth: apiKey + ':' + apiToken,
    headers: { "Content-Type": "application/json" }
  };
  var iot_req = https.request(options, function(iot_res) {
    var str = '';
    iot_res.on('data', function(chunk) {
      str += chunk;
    });
    iot_res.on('end', function() {
      try {
        var payload = atob(JSON.parse(str).payload);
        res.status(iot_res.statusCode).send(payload);
        console.log("Got last event: " + payload);
      } catch (e) { console.log(e.stack); }
    });
  }).on('error', function(e) {
    res.status(500).send(e);
  });
  iot_req.end();
})

