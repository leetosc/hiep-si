var express = require('express');
var app = express();
var bodyParser = require('body-parser')
var MongoClient = require('mongodb').MongoClient
var fetch = require('node-fetch');

app.set('port', (process.env.PORT || 5000));


MongoClient.connect('mongodb://leeto:hiepsi@ds035836.mlab.com:35836/hiepsi', function(err, database) {
  // .. start the server
  if (err) return console.log(err)
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

//called on form submit
app.post('/add', function(req, res) {
  console.log(req.body);
  if (req.body.name != "none" && req.body.points != ""){
    db.collection('teams').save(req.body, function(err, result) {
      if (err) return console.log(err)

      console.log('saved to database');
      res.redirect('/updateScores');
    });
  }
  else{
    console.log("Bad input");
  }
});

app.post('/submitBHT', function(req, res) {
  console.log(req.body);
  // db.collection('bht').save(req.body, function(err, result) {
  //   if (err) return console.log(err)
  //
  //   console.log('Logged BHT submission');
  //   res.redirect('/');
  // });
  console.log("logged bht submission");
  res.redirect('/');
});

//called on load to get data to populate graph
app.get('/getData', function(req, res) {
  var cursor = db.collection('teams').find().toArray(function(err, results) {
    // console.log(results);
    res.send(results);
  });
});

//page to update scores
app.get('/updateScores', function(req, res){
  res.sendFile(__dirname + '/public/update.html')
})

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
    if (err) return res.send(err)
    res.send(result);
  })
})
