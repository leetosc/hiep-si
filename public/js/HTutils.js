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

  

  $.get(geturl, function(payload){
    var tr;
    var kidcount = {};
    // console.log(payload);
    console.log(JSON.stringify(payload));

    //filter out, get for specific team
    
    

    $("#bhtContentsTable tr").remove();
    //fill in table headers
    tr = $('<tr/>');
    tr.append("<th>" + "Team Name" + "</th>");
    tr.append("<th>" + "Kid Name" + "</th>");
    tr.append("<th>" + "Date" + "</th>");
    $('#bhtContentsTable').append(tr);

    //fill in table
    for (var i = 0; i < payload.length; i++) {
        var entrymonth = new Date(payload[i].date).getMonth()+1;
        tr = $('<tr/>');
        tr.append("<td>" + payload[i].teamname + "</td>");
        tr.append("<td>" + payload[i].fullname + "</td>");
        tr.append("<td>" + payload[i].date + "</td>");
        // tr.append("<td>" + payload[i].comment + "</td>");
        $('#bhtContentsTable').append(tr);
        // logEntries++;
    }
    // $("#logSize").html(logEntries);
  });

}