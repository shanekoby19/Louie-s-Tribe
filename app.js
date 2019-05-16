const express = require('express');
const pug = require('pug');
const mongoose = require('mongoose');
const User = require('./models/user');
const bodyParser = require('body-parser');
const session = require('express-session');
const mongoStore = require('connect-mongo')(session);


var app = express();


//Sets up a connection to the mongoDB Atlas cloud.
mongoose.connect('mongodb+srv://shanekoby19:Polkiop23@louiestribe-mbxcw.mongodb.net/test?retryWrites=true', {useNewUrlParser: true})
var db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function() {
  console.log('Connection to MongoDB Atlas successful');
})

//Sets up body-parser for post request.
app.use(bodyParser.urlencoded({ extended: true }));

//Makes the userId available to templates
// app.use(function (req, res, next) {
//   res.locals.currentUser = req.session.userId;
//   next();
// });

//Sets up a path to use sessions.
app.use(session( {
  secret: "Louie's Tribe",
  resave: true,
  saveUninitialized: false,
  store: new mongoStore({
    mongooseConnection: db
  })
}));

//Sets the views directory and the templating engine.
app.set('views', './views')
app.set('view engine', 'pug');

//Sets up a static file server to server css and javascript
app.use('/static', express.static('static'));

//Get request to the home route
app.get('/', (req, res) => {
  res.render('index.pug', {title: "Louie's Tribe",
                           link: '../static/css/index.css'})
});

//Get Request to the sign up page.
app.get('/signup', (req, res) => {
  res.render('signup.pug', {title: "Louie's Tribe | Sign Up"});
});

//Get Request on the login page.
app.get('/login', function(req, res, next) {
  res.render('login');
});

//Get Request to the profile page
app.get('/profile', function(req, res, next) {
  console.log(req.session.userId);
  User.findById(req.session.userId)
    .exec(function (error, user) {
      if(error) {
        return next(error);
      }
      else {
        return res.render('profile', {title: 'Profile', name: user.name, favorite: user.favoriteBook});
      }
  });
});

//Post Request from the sign up page.
app.post('/signup', function(req, res, next) {

  if(req.body.fName && req.body.lName && req.body.email && req.body.password && req.body.confirm_Password) {

     if(req.body.password === req.body.confirm_Password) {
       var userData = {
         fName: req.body.fName,
         lName: req.body.lName,
         email: req.body.email,
         password: req.body.password
      };

       User.create(userData, function(error, user) {
         if(error) {
           console.log(error);
         }
         else {
           res.redirect('/login');
         }
       });
     }
     else {
       var err = new Error('Passwords do not match please try again.');
       err.status = 404;
       next(err);
     }
   }
   else {
     var err = new Error('All information is required please try again.');
     err.status = 404;
     next(err);
   }
});

//Post Request to the login page.
app.post('/login', function(req, res, next) {
  if(req.body.email && req.body.password) {
    User.authenticate(req.body.email, req.body.password, function(error, user) {
      if(error || !user) {
        var err = new Error('Wrong email or password');
        err.status = 401;
        return next(err);
      }
      else {
        req.session.userId = user._id;
        return res.redirect('/profile');
      }
    });
  }
  else {
    var err = new Error("Email or password was not provided.");
    err.status = 404;
    next(err);
  }
});

//Error Handler
app.use(function(err, req, res, next) {
  res.status(err.status || 500);
  res.render('error', {
    error_Message: err.message,
    error_Status: err.status
  });
});

//Sets up a listener on our server.
app.listen(3000, (req, res) => {
  console.log('Your application is running at localhost://3000')
});
