var server = "5gjnve.messaging.internetofthings.ibmcloud.com";
var port = 1883;
var clientId = "a:5gjnve:cogroom-"+(Math.floor(Math.random() * 90000)+10000);
var username = "a-5gjnve-jymdez4wjx";
var password = "_!RaA++40z8sp3NBKw";
window.client = null;

function init() {
	connect(server, port, clientId, username, password);
}

$(".requiresConnect").attr("disabled", true);

var Panel = {
	CONNECT: "connect",
	LOG: "log"
};

function openPanel(type) {
	$("#collapse"+(type.charAt(0).toUpperCase() + type.substring(1))).collapse("show");
	resize();
}

function closePanel(type) {
	$("#collapse"+(type.charAt(0).toUpperCase() + type.substring(1))).collapse("hide");
}

function connect(server, port, clientId, username, password) {
	try {
		client = new Messaging.Client(server, parseFloat(port), clientId);

		client.onMessageArrived = onMessage;
		client.onMessageDelivered = onMessageSent;
		client.onConnectionLost = function(e) {
			console.log(e)
			$("#connectedAlert").fadeOut();
			$("#connectionStatus").html("disconnected!");
			$("body").addClass("bgRed");
			$("body").removeClass("bgBrown");
			$(".requiresConnect").attr("disabled",true);
			$(".requiresDisconnect").attr("disabled",false);
			appendLog("Disconnected from " + server + ":" + port);
			subsList = {};
			$("#subscribeList").html("");
		}

		var connectOptions = new Object();
		connectOptions.useSSL = false;
		connectOptions.cleanSession = true;
		connectOptions.userName = username;
		connectOptions.password = password;

		connectOptions.onSuccess = function() {
			$("#connectionStatus").html("<i style='padding-right: 7px' class='glyphicon glyphicon-ok'></i>" + server + ":" + port);
			$("body").addClass("bgBrown");
			$("body").removeClass("bgRed");
			$(".requiresConnect").attr("disabled",false);
			$(".requiresDisconnect").attr("disabled",true);
			appendLog("Connected to " + server + ":" + port);
			var topic = "iot-2/type/RoomDevice/id/Room1/evt/+/fmt/json";
			var qos = 0;
			client.subscribe(topic, {
				qos: qos,
				onSuccess: function() {
					appendLog("Subscribed to [<span class='logTopic'>" + topic + "</span>][qos " + qos + "]");
				}
			})
			// will use this to get data from database and make graph
			// $.get("lastData", function(payload){
			// 		var parsed = JSON.parse(payload)
			// 		statusUpdate(parsed.d.occupiedState, parsed.d.stats)
			// });
		}
		connectOptions.onFailure = function() {
			$("#errorAlertText").html("Failed to connect!");
			$("#connectedAlert").fadeOut();
			$("#connectionStatus").html("connection failure!");
			$("body").addClass("bgRed");
			$("body").removeClass("bgBrown");
			$("#errorAlert").fadeIn();
			setTimeout(function() { $("#errorAlert").fadeOut(); }, 2000);
			$(".requiresConnect").attr("disabled",true);
			$(".requiresDisconnect").attr("disabled",false);
			appendLog("Failed to connect to " + server + ":" + port);
		}

		$("#connectionStatus").html("connecting...");

		client.connect(connectOptions);
	} catch (e) {
		console.log(e);
	}
}

function statusUpdate(occupiedState, stats) {
	$(".light").removeClass('active');
	if (occupiedState === 'No') {
		$(".green").addClass('active');
	} else if (occupiedState === 'Maybe') {
		$(".yellow").addClass('active');
	} else if (occupiedState === 'Yes') {
		$(".red").addClass('active');
	}

	var html = ""
	for (var i in stats) {
		html += "<div><b>" + i + ":</b> " + stats[i] + "</div>";
	}
	$(".roomStats").html(html)
}

// function called whenever our MQTT connection receives a message
function onMessage(msg) {
	try {
		var topic = msg.destinationName;
		var payload = msg.payloadString;
		var qos = msg._getQos();
		var retained = msg._getRetained();

		var qosStr = ((qos > 0) ? "[qos " + qos + "]" : "");
		var retainedStr = ((retained) ? "[retained]" : "");
		appendLog("<span class='logRCV'>RCV [<span class='logTopic'>" + topic + "</span>]" + qosStr + retainedStr + " <span class='logPayload'>" + payload + "</span></span>");

		if (topic.split("/")[6] === 'roomStatus') {
			var parsed = JSON.parse(payload)
			statusUpdate(parsed.d.occupiedState, parsed.d.stats)
		}

	} catch (e) {
		console.log(e);
	}
}

var logEntries = 0;
function appendLog(msg) {
	logEntries++;
	msg = "<div id='logLine-"+logEntries+"' class='logLine'><span class='logTime'>(" + ((new Date()).toISOString().split("T"))[1].substr(0, 12) + ")</span><span class='logMessage'>" + msg + "</span></div>";
	$("#logContents").append(msg + "\n");
	$("#logSize").html(logEntries);
	if ($("#stickyLog").prop("checked")) {
		$("#logContents").prop("scrollTop", $("#logContents").prop("scrollHeight") - $("#logContents").height());
	}
}

function clearLog() {
	logEntries = 0;
	$("#logContents").html("");
	$("#logSize").html("0");
}

//Other functions for dashboard

function setLightsColor(picker) {
    var hue = Math.round(picker.hsv[0]/360*65535);
    var sat = Math.round(picker.hsv[1]*0.01*254);
    var bri = Math.round(picker.hsv[2]*0.01*254);
    console.log("Setting lights to: hue:" + hue + ", sat: " + sat + ", bri: " + bri);
    // publish command
    // {"d":{"msg":"setHue","target":"4","hue":hue,"sat":sat}}
    var topic = "iot-2/type/RaspberryPi/id/b827eb6ecceb/cmd/setLights/fmt/json";
    try {
	    var message = new Messaging.Message(JSON.stringify({d:{msg:"setHue","target":"4","hue":hue,"sat":sat,"bri":bri}}));
	    message.destinationName = topic;
	    client.send(message);

	    message = new Messaging.Message(JSON.stringify({d:{msg:"setHue","target":"6","hue":hue,"sat":sat,"bri":bri}}));
	    message.destinationName = topic;
	    client.send(message);

	    message = new Messaging.Message(JSON.stringify({d:{msg:"setHue","target":"7","hue":hue,"sat":sat,"bri":bri}}));
	    message.destinationName = topic;
	    client.send(message);

	    message = new Messaging.Message(JSON.stringify({d:{msg:"setHue","target":"8","hue":hue,"sat":sat,"bri":bri}}));
	    message.destinationName = topic;
	    client.send(message);
	  } catch (e) {
	  	console.log(e);
	  }


}


function turnoff() {
    console.log("turning off lights..");
    var topic = "iot-2/type/RaspberryPi/id/b827eb6ecceb/cmd/setLights/fmt/json";

    var message = new Messaging.Message(JSON.stringify({d:{msg:"turnoff","target":"4"}}));
    message.destinationName = topic;
    client.send(message);

    message = new Messaging.Message(JSON.stringify({d:{msg:"turnoff","target":"6"}}));
    message.destinationName = topic;
    client.send(message);

    message = new Messaging.Message(JSON.stringify({d:{msg:"turnoff","target":"7"}}));
    message.destinationName = topic;
    client.send(message);

    message = new Messaging.Message(JSON.stringify({d:{msg:"turnoff","target":"8"}}));
    message.destinationName = topic;
    client.send(message);

}

function onMessageSent(msg) {
	try {
		var topic = msg.destinationName;
		var payload = msg.payloadString;
		var qos = msg._getQos();
		var retained = msg._getRetained();

		var qosStr = ((qos > 0) ? "[qos " + qos + "]" : "");
		var retainedStr = ((retained) ? "[retained]" : "");
		appendLog("<span class='logPUB'>PUB [<span class='logTopic'>" + topic + "</span>]" + qosStr + retainedStr + " <span class='logPayload'>" + payload + "</span></span>");


	} catch (e) {
		console.log(e);
	}
}
