
function init() {
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
	// appendLog("Started up");
	$.get("getData", function(payload){
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

// Takes payload and calculates points for current month and total and draws graph
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

	$(function () {
		  //hardcode graph data labels for now..
			var data = {
				labels: ["Phêrô", "Anrê", "Giacôbê Tiền", "Gioan", "Philiphê", "Nathanaen", "Tôma","Matthêu"],
				datasets: [
						{
								label: "Current Month",
								fillColor: "rgba(0,92,179,0.6)",
								strokeColor: "rgba(0,77,153,0.8)",
								highlightFill: "rgba(0,66,128,0.75)",
								highlightStroke: "rgba(0,53,102,1)",
								data: [teamlist.phero.pointsCurrentMonth, teamlist.anre.pointsCurrentMonth, teamlist.giacobetien.pointsCurrentMonth, teamlist.gioan.pointsCurrentMonth, teamlist.philiphe.pointsCurrentMonth, teamlist.nathanaen.pointsCurrentMonth, teamlist.toma.pointsCurrentMonth, teamlist.mattheu.pointsCurrentMonth]
						},
						{
								label: "Total",
								fillColor: "rgba(151,187,205,0.5)",
								strokeColor: "rgba(151,187,205,0.8)",
								highlightFill: "rgba(151,187,205,0.75)",
								highlightStroke: "rgba(151,187,205,1)",
								data: [teamlist.phero.pointsTotal, teamlist.anre.pointsTotal, teamlist.giacobetien.pointsTotal, teamlist.gioan.pointsTotal, teamlist.philiphe.pointsTotal, teamlist.nathanaen.pointsTotal, teamlist.toma.pointsTotal, teamlist.mattheu.pointsTotal]
						}
				]
			};
	    var option = {
	    responsive: true,
	    };

	    // Get the context of the canvas element we want to select
	    var ctx = document.getElementById("myChart").getContext('2d');
	    var myBarChart = new Chart(ctx).Bar(data, option);
	});

}
