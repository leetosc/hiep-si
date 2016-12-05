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
//should change geturl to get all bht since filtering is done here anwyays
  

  $.get(geturl, function(payload){
    var tr;
    var kidcount = {};
    // console.log(payload);
    // console.log(JSON.stringify(payload));

    //filter out, get for specific team
    for (var i = 0; i<payload.length;i++){
      if ((payload[i].teamname == team || team == "all") && new Date(payload[i].date).getMonth()+1 == month && new Date(payload[i].date).getFullYear() == year){
        if (!(payload[i].fullname in kidcount)){
          kidcount[payload[i].fullname] = [1, payload[i].teamname];
          // console.log("added " + payload[i].fullname + " to kidcount");
        } else {
          kidcount[payload[i].fullname][0]++;
          // console.log("incremented count for " + payload[i].fullname);
        }
        
      }
      
    }
    console.log("kidcount: " + JSON.stringify(kidcount));
    // Summary table
    $("#SummaryTable tr").remove();
    //fill in table headers
    tr = $('<tr/>');
    tr.append("<th>" + "Name" + "</th>");
    tr.append("<th>" + "Team" + "</th>");
    tr.append("<th>" + "Count" + "</th>");
    $('#SummaryTable').append(tr);

    //fill in table
    for (var key in kidcount) {
        tr = $('<tr/>');
        tr.append("<td>" + key + "</td>");
        tr.append("<td>" + kidcount[key][1] + "</td>"); //teamname
        tr.append("<td>" + kidcount[key][0] + "</td>"); //count
        $('#SummaryTable').append(tr);
    }

    // Raw bht table
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
        if(entrymonth == month){
          tr = $('<tr/>');
          tr.append("<td>" + payload[i].teamname + "</td>");
          tr.append("<td>" + payload[i].fullname + "</td>");
          tr.append("<td>" + payload[i].date + "</td>");
          $('#bhtContentsTable').append(tr);
        }
    }
  });

}