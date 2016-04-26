var express = require('express');
var app = express();
var config = require('./config.js');
var mongoose = require('mongoose');
var bodyParser = require('body-parser');

app.set('view engine', 'ejs');
app.use(express.static(__dirname + '/public'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

mongoose.connect(config.dbname, function(err){
  if(err){
    console.log(err);
  } else {
    console.log("Connected to database");
  }
});

var Post = require('./models/post');

app.get('/', function (req, res) {
   res.render('pages/index', { title : "Sweet home"});
});

app.get('/about', function (req, res) {
   res.render('pages/about', { title : "I tell you a story..."});
});

app.get('/details/:id', function (req, res) {
  Post.find({ _id: req.params.id }, function(err, post) {
    if (err){
      console.log(err);
    } else{
      res.render('pages/details', { title : "Details", post : post[0]});
    }
  });
});

app.get('/api/posts', function(req, res){
  Post.find({}, function(err, posts) {
    if (err){
      console.log(err);
    } else {
      console.log(posts);
      res.json(posts);
    }
  });
});

app.post('/api/posts', function(req, res){
  var newPost = Post({
    author: req.body.author,
    title: req.body.title,
    content: req.body.content
  });

  newPost.save(function(err) {
    if (err){
      console.log(err);
    } else {
      console.log('Post created!');
    }

  });
});

var server = app.listen(config.port, function () {
  var port = server.address().port;
  console.log("Example app listening at " + port + " port");
});
