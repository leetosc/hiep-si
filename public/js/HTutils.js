// update scores page - general HT admin activities

//set selected to current month
var pagedate = new Date();
function setSelectedIndex(s, i)  {
  s.options[i-1].selected = true;
  return;
}
var pagemonth = pagedate.getMonth()+1;
var pageyear = pagedate.getFullYear();
setSelectedIndex(document.getElementById("monthselect"),pagemonth);
setSelectedIndex(document.getElementById("bhtmonthselect"),pagemonth);
// setSelectedIndex(document.getElementById("bhtyearselect"),pageyear);



function getBHTforMonth(){
  var month = document.getbhtform.month.value;
  var year = document.getbhtform.year.value;
  var team = document.getbhtform.name.value;
  console.log("month:" + month + " team:" + team);
  var geturl = "api/getmonthbht/" + month + "/" + year;

  

  $.get("api/getmonthbht/11/2016", function(payload){
    var tr;
    var kidcount = {};
    console.log(payload);


    
    
    //TODO: fill the table with the selected bht counts
    
    for (var i = 0; i < payload.length; i++) {
        tr = $('<tr/>');
        tr.append("<td>" + payload[i].name + "</td>");
        tr.append("<td>" + payload[i].points + "</td>");
        tr.append("<td>" + getMonthName(payload[i].month) + "</td>");
        tr.append("<td>" + payload[i].comment + "</td>");
        $('#bhtContentsTable').append(tr);
        logEntries++;
    }
    // $("#logSize").html(logEntries);
  });

}