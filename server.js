var express = require('express');
var app = express();
var config = require('./config.js');
var mongoose = require('mongoose');
var bodyParser = require('body-parser');
var methodOverride = require('method-override');
var bcrypt = require('bcrypt');
var jwt = require('jsonwebtoken');
var cookieParser = require('cookie-parser')
const saltRounds = 10;



app.set('view engine', 'ejs');
app.use(express.static(__dirname + '/public'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(methodOverride());
app.set('superSecret', config.secret);
app.use(cookieParser());

mongoose.connect(config.dbname, function(err){
  if(err){
    console.log(err);
  } else {
    console.log("Connected to database");
  }
});

var Post = require('./models/post');
var User = require('./models/user');

app.get('/', function (req, res) {
   res.render('pages/index', { title : "Sweet home"});
});

app.get('/about', function (req, res) {
   res.render('pages/about', { title : "I'll tell you a story..."});
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
      res.json(posts);
    }
  });
});




app.get(config.adminRoute + "login", function(req, res){
  res.render('pages/admin/login', {url : config.adminRoute + "login"});
});

app.post(config.adminRoute + "login", function(req, res){

  User.findOne({
      username: req.body.username
    },
    function(err, user) {
      if (err) {
        console.log(err);
      }
      if (!user) {
        res.json({ success: false, message: 'Authentication failed' });
      } else if (user) {
        if (!bcrypt.compareSync(req.body.password, user.password)) {
          res.json({ success: false, message: 'Authentication failed' });
        } else {
            var userInfo = {};
            userInfo.username = user.username;
            userInfo.accountType = user.accountType;
            var token = jwt.sign(userInfo, app.get('superSecret'), {
              expiresIn: 60
            });

            res.cookie('auth',token);
            res.json({
              success: true,
              message: 'Enjoy your token!',
              redirect : config.adminRoute
            });
          }
      }
  });
});


// token middleware
app.use(function(req, res, next) {

  var token = req.body.token || req.query.token || req.headers['x-access-token'] || req.cookies.auth;

  if (token) {
    jwt.verify(token, app.get('superSecret'), function(err, decoded) {
      if (err) {
        return res.json({ success: false, message: 'Failed to authenticate token.' });
      } else {
        console.log(decoded);
        req.decoded = decoded;
        next();
      }
    });

  } else {

    return res.status(403).send({
        success: false,
        message: 'No token provided.'
    });

  }
});


app.delete('/api/posts/:id', function(req, res) {
    Post.remove({
        _id : req.params.id
    }, function(err, post) {
        if (err)
            res.send(err);

        Post.find(function(err, posts) {
            if (err)
                res.send(err)
            res.json(posts);
        });
    });
});

app.put('/api/posts/:id',function(req, res) {
  Post.findById(req.params.id, function(err, post) {
      if (err)
          res.send(err);

      post.title = req.body.title;
      post.content = req.body.content;
      post.save(function(err) {
        if (err)
            res.send(err);
        res.send({redirect: config.adminRoute})
      });

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
      res.send({redirect: config.adminRoute})
    }

  });
});

app.post('/api/users', function(req, res){
  bcrypt.hash(req.body.password, saltRounds, function(err, hash) {
    var newUser = User({
      username: req.body.username,
      password: hash,
      accountType: req.body.accountType
    });

    newUser.save(function(err) {
      if (err){
        console.log(err);
        res.send(err);
      } else {
        console.log('User created!');
        res.send({message: 'ok'});
      }

    });
  });
});

app.get(config.adminRoute, function(req, res){
  var urls = {
    posts: config.adminRoute,
    newPost: config.adminRoute + "newpost"
  }
  res.render('pages/admin/index', { name: "NekoBard", adminPageTitle : "Posts", urls : urls});
});

app.get(config.adminRoute + "newpost", function(req, res){
  var urls = {
    posts: config.adminRoute,
    newPost: config.adminRoute + "newpost"
  }
  res.render('pages/admin/newpost', { name: "NekoBard", adminPageTitle : "New post", urls : urls});
});

app.get(config.adminRoute + "editpost/:id", function(req, res){

  Post.find({ _id: req.params.id }, function(err, post) {
    if (err){
      console.log(err);
    } else{
      var urls = {
        posts: config.adminRoute,
        newPost: config.adminRoute + "newpost"
      }

      res.render('pages/admin/editpost', { name: "NekoBard", adminPageTitle : "Edit post", urls : urls, id : req.params.id, post : post[0]});
    }
  });
});



var server = app.listen(config.port, function () {
  var port = server.address().port;
  console.log("Example app listening at " + port + " port");
});
