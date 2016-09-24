
function init() {
	// connect(server, port, clientId, username, password);
	startup();
}

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


function startup(){
	$("body").addClass("bgBrown");
	$("body").removeClass("bgRed");
	// appendLog("Started up");
	$.get("getData", function(payload){
			// console.log(payload);
			calculateTeams(payload);
	});
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

//not currently used
function clearLog() {
	logEntries = 0;
	$("#logContents").html("");
	$("#logSize").html("0");
}


function calculateTeams(payload){
	var currentMonth = new Date().getMonth()+1;
	var teamlist = {};

	// console.log(payload);

	for (var element=0; element < payload.length; element++) {
		if (!(payload[element].name in teamlist)){
			teamlist[payload[element].name] = {"pointsCurrentMonth":0, "pointsTotal":0};
			// console.log("Added " + payload[element].name);
		}
		if (payload[element].month == currentMonth){
			teamlist[payload[element].name].pointsCurrentMonth += parseInt(payload[element].points);
		}
		teamlist[payload[element].name].pointsTotal += parseInt(payload[element].points);
		appendLog(JSON.stringify(payload[element]));


	}
	console.log("teamlist:" + JSON.stringify(teamlist));

}
