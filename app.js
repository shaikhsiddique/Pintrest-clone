const createError = require('http-errors');
const fs = require('fs');
const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const expressSession = require('express-session');
const MongoDBStore = require('connect-mongodb-session')(expressSession);
const passport = require('passport');
const mongoose = require('mongoose');
const Usermodel = require('./routes/users'); // Adjust the path based on your project structure
const flash = require('connect-flash');
const indexRouter = require('./routes/index');

app=express();

const imagesUploadsPath = path.join(__dirname, 'images/uploads');

// Serve static files in the "images/uploads" directory
app.use('/images/uploads', express.static(imagesUploadsPath));

// Handle requests to the directory itself
app.get('/images/uploads', (req, res) => {
  // Redirect to the home page or handle it in a way that makes sense for your application
  res.redirect('/');
});

// Check if mongoose is not connected, then connect
if (mongoose.connection.readyState === 0) {
  mongoose.connect('mongodb://localhost:27017/pintrest', {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useFindAndModify: false,
  });
}

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

// Express session setup
const store = new MongoDBStore({
  uri: 'mongodb://localhost:27017/session-store',
  collection: 'sessions',
});

// Express session setup with MongoDBStore
app.use(
  expressSession({
    store: store,
    resave: false,
    saveUninitialized: false,
    secret: 'your-secret-key',
  })
);
app.use(passport.initialize());
app.use(passport.session());

passport.serializeUser(function (user, done) {
  done(null, user._id); // Use user._id as the user ID
});

passport.deserializeUser(async function (id, done) {
  try {
    let user = await Usermodel.findById(id);
    done(null, user);
  } catch (error) {
    done(error, null);
  }
});

// Connect flash setup (place it before routes)
app.use(flash());

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter);

// ...

// catch 404 and forward to error handler
app.use((req, res, next) => {
  next(createError(404));
});

// error handler
app.use((err, req, res, next) => {
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
