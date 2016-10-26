
function init() {
	startup();
	presetFormDate();
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
    window.sr = ScrollReveal();
    sr.reveal('.animatedpanel',{reset:true, viewFactor:0.1, easing:'ease-in-out'});
	$.get("getData", function(payload){
		var tr;
        for (var i = 0; i < payload.length; i++) {
            tr = $('<tr/>');
            tr.append("<td>" + payload[i].name + "</td>");
            tr.append("<td>" + payload[i].points + "</td>");
            tr.append("<td>" + getMonthName(payload[i].month) + "</td>");
            tr.append("<td>" + payload[i].comment + "</td>");
            $('#logContentsTable').append(tr);
        }
                
        calculateTeams(payload);
	});

}

var logEntries = 0;
function appendLog(msg) {
	logEntries++;
	msg = "<div id='logLine-"+logEntries+"' class='logLine'><span class='logMessage'>" + msg + "</span></div>";
//    msg = "<div id='logLine-"+logEntries+"' class='logLine'><span class='logTime'>(" + ((new Date()).toISOString().split("T"))[1].substr(0, 12) + ")</span><span class='logMessage'>" + msg + "</span></div>";
	$("#logContents").append(msg + "\n");
	$("#logSize").html(logEntries);
//	if ($("#stickyLog").prop("checked")) {
//		$("#logContents").prop("scrollTop", $("#logContents").prop("scrollHeight") - $("#logContents").height());
//	}
    $("#logContents").prop("scrollTop", $("#logContents").prop("scrollHeight") - $("#logContents").height());
}

//not currently used
function clearLog() {
	logEntries = 0;
	$("#logContents").html("");
	$("#logSize").html("0");
}

function getMonthName(number) {
    var names = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
    return names[number-1];
}



// Takes payload and calculates points for current month and total and draws graph
function calculateTeams(payload){
	var currentMonth = new Date().getMonth()+1;
	var teamlist = {};

	// console.log(payload);

	for (var element=0; element < payload.length; element++) {
		if (!(payload[element].name in teamlist)){
			teamlist[payload[element].name] = {"pointsCurrentMonth":0, "pointsTotal":0};
			// console.log("Added team " + payload[element].name to teamlist);
		}
		if (payload[element].month == currentMonth){
			teamlist[payload[element].name].pointsCurrentMonth += parseInt(payload[element].points);
		}
		teamlist[payload[element].name].pointsTotal += parseInt(payload[element].points);
		delete payload[element]._id;
//		appendLog(JSON.stringify(payload[element]));

	}
	console.log("teamlist:" + JSON.stringify(teamlist));

	$(function () {
		  //hardcode graph data labels for now..
			var currMonthData = {
				labels: ["Phêrô", "Anrê", "Giacôbê Tiền", "Gioan", "Philiphê", "Nathanaen", "Tôma","Matthêu"],
				datasets: [
						{
								label: "Current Month",
								fillColor: "rgba(0,92,179,0.6)",
								strokeColor: "rgba(0,77,153,0.8)",
								highlightFill: "rgba(0,66,128,0.75)",
								highlightStroke: "rgba(0,53,102,1)",
								data: [teamlist.phero.pointsCurrentMonth, teamlist.anre.pointsCurrentMonth, teamlist.giacobetien.pointsCurrentMonth, teamlist.gioan.pointsCurrentMonth, teamlist.philiphe.pointsCurrentMonth, teamlist.nathanaen.pointsCurrentMonth, teamlist.toma.pointsCurrentMonth, teamlist.mattheu.pointsCurrentMonth]
						}
				]
			};

			var totalData = {
				labels: ["Phêrô", "Anrê", "Giacôbê Tiền", "Gioan", "Philiphê", "Nathanaen", "Tôma","Matthêu"],
				datasets: [
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
	    var canvas1 = document.getElementById("currMonthChart").getContext('2d');
			var canvas2 = document.getElementById("totalChart").getContext('2d');
	    var monthChart = new Chart(canvas1).Bar(currMonthData, option);
			var totalChart = new Chart(canvas2).Bar(totalData, option);
	});

}

function presetFormDate(){
	var pagedate = new Date();

	var pagemonth = pagedate.getMonth()+1;
	var pageday = pagedate.getDate();
	var pageyear = pagedate.getFullYear();
	document.getElementById("datefield").value=pagemonth + "/"+ pageday + "/" + pageyear;
}
