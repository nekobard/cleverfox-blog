var express = require('express');
var app = express();
var config = require('./config.js');
var mongoose = require('mongoose');

app.use(express.static(__dirname + '/public'));

mongoose.connect(config.dbname, function(err){
  if(err){
    console.log(err);
  } else {
    console.log("Connected to database");
  }
});


app.get('/', function (req, res) {
   res.render('index.html');
});

var server = app.listen(config.port, function () {
  var port = server.address().port;
  console.log("Example app listening at " + port + " port");
});
