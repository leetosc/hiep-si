var express = require('express');
var app = express();
var bodyParser = require('body-parser');
var MongoClient = require('mongodb').MongoClient;
var fetch = require('node-fetch');
var CronJob = require('cron').CronJob;
var http = require("http");

app.set('port', (process.env.PORT || 5000));


MongoClient.connect('mongodb://leeto:hiepsi@ds035836.mlab.com:35836/hiepsi', function(err, database) {
  // .. start the server
  if (err) return console.log(err);
  db = database;
  //start server only if database is connected
  app.listen(app.get('port'), function() {
    console.log('Node app is running on port', app.get('port'));
  });
});



app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static(__dirname + '/public'));
app.use(bodyParser.json());

//home page
app.get('/', function(req,res) {
  res.sendFile(__dirname + '/public/index.html');
  var cursor = db.collection('teams').find().toArray(function(err, results) {
    // console.log(results);
    console.log("Page loaded");
  });
});

//resources page
app.get('/resources', function(req,res) {
  res.sendFile(__dirname + '/public/resources.html');
});

//called on form submit
app.post('/add', function(req, res) {
  console.log(req.body);
  if (req.body.name != "none" && req.body.points != ""){
    db.collection('teams').save(req.body, function(err, result) {
      if (err) return console.log(err);

      console.log('saved score to database');
      res.redirect('/htpage');
    });
  }
  else{
    console.log("Bad input");
  }
});

app.post('/submitBHT', function(req, res) {
  console.log(req.body);
  if (req.body.teamname != "none" && req.body.fullname != ""){
    db.collection('bht').save(req.body, function(err, result) {
      if (err) return console.log(err);

      console.log('saved bht to database');
      // for testing - calculating bht on submit - move to schedule job after done
      // calculateDayBHT()
    });
  }
  else{
    console.log("Bad input");
  }
  // console.log("logged bht submission");

  res.redirect('/');
});

//called on load to get data to populate graph
app.get('/getData', function(req, res) {
  var cursor = db.collection('teams').find().toArray(function(err, results) {
    // console.log(results);
    res.send(results);
  });
});

// Generic error handler used by all endpoints.
function handleError(res, reason, message, code) {
  console.log("ERROR: " + reason);
  res.status(code || 500).json({"error": message});
}

/*
  !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
  TODO: APIs currently don't handle year yet, and no error handling
  should work for rest of 2016 though
*/


// API to get list of BHT submissions for a kid since a given month
// returns json array
//Example: hiepsiaustin.herokuapp.com/api/getkidmonthbht/An%20Dinh/11

//db.bht.find({$and:[{date:{$gte: '11/1/2016'}},{fullname:"<kid name>"}]})
app.get('/api/getkidmonthbht/:fullname/:month/:year', function(req, res) {
  if (req.params.month > 12){
    res.status(500).send("invalid month");
    return
  }
  
  var monthDate = req.params.month + "/1/" + req.params.year;
  var kidname = req.params.fullname;

  console.log("monthdate:" + monthDate);
  console.log("kidname: " + kidname);

  var cursor = db.collection('bht').find({$and:[{date:{$gte: monthDate}},{fullname:kidname}]}).toArray(function(err, results) {
    if (err){
      handleError(res, err.message, "Failed to get kid or month");
    } else {
      // console.log(results);
      console.log("got bht, count:"+ results.length);
      res.send(results);
    }
    
  });
});

// gets list of all BHT submissions since given month
// returns json array
// hiepsiaustin.herokuapp.com/api/getmonthbht/11

app.get('/api/getmonthbht/:month/:year', function(req, res) {
  if (req.params.month > 12){
    res.status(500).send("invalid month");
    return
  }
  
  var monthDate = req.params.month + "/1/" + req.params.year;

  console.log("monthdate:" + monthDate);

  var cursor = db.collection('bht').find({date:{$gte: monthDate}}).toArray(function(err, results) {
    if (err){
      handleError(res, err.message, "Failed to get bht for month");
    } else {
      // console.log(results);
      console.log("got bht, count:"+ results.length);
      res.send(results);
    }
    
  });
});


// Gets all BHT submitted by given kid, returns json array
// hiepsiaustin.herokuapp.com/api/getkidbht/An%20Dinh

app.get('/api/getkidbht/:fullname', function(req, res) {
  var kidname = req.params.fullname;

  console.log("getting bht for " + kidname);

  var cursor = db.collection('bht').find({fullname:kidname}).toArray(function(err, results) {
    if (err){
      handleError(res, err.message, "Failed to get kid");
    } else {
      // console.log(results);
      console.log("got bht, count:"+ results.length);
      res.send(results);
    }
    
  });
});


//-------- end db query api -----------

//page to update scores
app.get('/htpage', function(req, res){
  res.sendFile(__dirname + '/public/update.html');
});

//not used
app.put('/update', function(req, res){
  //handle put request
  db.collection('teams').findOneAndUpdate({name:'testteam'},{
    $set:{
      name: req.body.name,
      points: req.body.points
    }
  },  {
    sort: {_id: -1},
    upsert: false
  }, function(err, result) {
    if (err) return res.send(err);
    res.send(result);
  });
});

//generic consent form for events
app.get('/consentForm', function(req, res) {
  res.sendFile(__dirname + '/public/files/ConsentForm.pdf');
});

//DCYC letter
app.get('/DCYCLetter', function(req, res) {
  res.sendFile(__dirname + '/public/files/DCYC2017Letter.pdf');
});

//DCYC form
app.get('/DCYCForm', function(req, res) {
  res.sendFile(__dirname + '/public/files/DCYC2017Registration.pdf');
});








// Should be the last route
app.get('*', function(req, res){
  // res.send('Something went wrong, please try again.', 404);
  res.status(404).send("Something went wrong, please try again.");
});



new CronJob('00 59 23 * * *', function(){
  var date = new Date();
  console.log("Running calculate BHT function..");
  console.log(date.toString());
  calculateDayBHT();
}, null, true, 'America/Chicago');

//ping app every 10 minutes to prevent heroku from putting it to sleep
setInterval(function(){
  http.get("http://hiepsiaustin.herokuapp.com");
}, 600000);

function calculateDayBHT() {
  //should run each midnight and calculate BHT points for each team
  //iterate through database for each team, ignore matching strings for names (case insensitive)
  //for each team post a database entry in same format as normal points
  var cursor = db.collection('bht').find().toArray(function(err, dbentries) {
    // console.log(dbentries);
    var date = new Date();
    date.setDate(date.getDate()-1);//app runs on GMT time so midnight Austin time is one day before
    var currentMonth = date.getMonth()+1;
    var currentDay = date.getDate();
    var currentYear = date.getFullYear();
    var teamlist = {}; //json with array of names for each team for that day
    var teamcounts = {}; //number of unique names for each team for that day
    console.log("current month: " + currentMonth + " current date: " + currentDay + " current year: " + currentYear);

    //generate teamlist object
    for (var element=0; element < dbentries.length; element++) {
      if (!(dbentries[element].teamname in teamlist)){
        teamlist[dbentries[element].teamname] = [];
        teamcounts[dbentries[element].teamname] = 0;
        console.log("Added team " + dbentries[element].teamname + " to teamlist");
      }
      var datestring = new Date(dbentries[element].date);
      // console.log("date from bht entry: " + datestring.toString());

      if (datestring.getMonth()+1 == currentMonth && datestring.getDate() == currentDay && datestring.getFullYear() == currentYear){
        teamlist[dbentries[element].teamname].push(dbentries[element].fullname);
        // console.log("date matched for " + dbentries[element].fullname + " entry");
      }
    }


    //for each team in teamlist, check for duplicates and get count of unique names
    for (var team in teamlist){
      if(teamlist.hasOwnProperty(team)){
        // console.log("team:" + team);
        var uniquenames = [];
        var prev = "";
        var templist = [];
        templist = teamlist[team];
        lctemplist = [];//lowercase

        //make everything lowercase to make it easier
        for (var j = 0; j<templist.length; j++) {
          lctemplist.push(templist[j].toLowerCase());
        }

        lctemplist.sort();
        // console.log(templist);
        for ( var i = 0; i < lctemplist.length; i++ ) {
          if ( lctemplist[i] !== prev ) {
              uniquenames.push(lctemplist[i]);
              prev = lctemplist[i];
          }
        }
        // console.log(uniquenames);
        teamcounts[team] = uniquenames.length;
      }
    }

    console.log("teamlist:" + JSON.stringify(teamlist));
    console.log("teamcounts:" + JSON.stringify(teamcounts));

    // 1-3: 1 points, 4-5: 2 point, 6+: 3 points per day for team

    //3-8-17: during Lent BHT worth triple points

    for (var team in teamcounts){
      // console.log("teamcounts[team]:" + teamcounts[team]);
      var body = {
        name: team,
        points: 0,
        month: currentMonth,
        comment: "BHT for " + currentMonth + "/" + currentDay + "/" + currentYear
        };
      if (teamcounts[team] >=1 && teamcounts[team] < 4){
        body.points = 3;
      } else if (teamcounts[team] >= 4 && teamcounts[team] <6){
          body.points = 6;
      } else if (teamcounts[team] >= 6){
          body.points = 9;
      }

      console.log(body);
      //no point in saving to database if zero points
      if(body.points != 0){
        db.collection('teams').save(body, function(err, result) {
          if (err) return console.log(err);
          console.log("saving bht score..");
          // console.log(body);
          // console.log("added points to db");
        });
        console.log('added bht points for team ' + team);
      }

    }

  });

}
