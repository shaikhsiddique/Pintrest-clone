// routes/index.js
var express = require('express');
var router = express.Router();
const Usermodel = require('./users'); // Assuming your user model is in the 'models' directory
const Postmodel= require('./post');
const passport = require('passport');
const upload= require('./multer');
passport.use(Usermodel.createStrategy());

/* GET home page. */
router.get('/', function (req, res, next) {
  res.render('index', { title: 'Express' });
});

router.get('/login', function (req, res, next) {
  const errorMessage = req.flash('error');
  // console.log(errorMessage); // Check if error messages are logged
  res.render('login', { error: errorMessage });
});
router.get('/profile', isloggedin, async function (req, res, next) {
  try {
    const userId = req.user._id;
    let userdata = await Usermodel.findById(userId).populate('posts').exec();

    if (!userdata) {
      console.log(`User with ID '${userId}' not found.`);
      res.redirect('/');
      return;
    }

    // Log the content of userdata.posts
    console.log('User posts:', userdata.posts);

    res.render('profile', { userdata: userdata });
  } catch (error) {
    console.error(error);
    res.redirect('/');
  }
});

router.get('/feed', function (req, res, next) {
  res.render('feed');
});

router.post('/register', function (req, res) {
  const { username, email, fullName } = req.body;
  const userdata = new Usermodel({ username, email, fullName });
  Usermodel.register(userdata, req.body.password, (err, user) => {
    if (err) {
      console.error(err);
      return res.redirect('/');
    }

    passport.authenticate('local')(req, res, () => {
      res.redirect('/profile');
    });
  });
});

router.post('/login', passport.authenticate('local', {
  successRedirect: '/profile',
  failureRedirect: '/login',
  failureFlash: true,
}), function (req, res) {
  data = req.session.passport.user;
  console.log(data);
});
router.post('/upload',isloggedin, upload.single('file'), async  (req, res) => {
  console.log('Received request for /upload');
  if (!req.file) {
      console.log('No file available');
      return res.status(404).send('No file available');
  }
  console.log('File uploaded successfully');
  const userId = req.user._id; // Use req.user._id as the user ID
  const user= await Usermodel.findById(userId);
  const post= await Postmodel.create({
    image : req.file.filename,
    postText : req.body.Caption,
    user : userId,

  });
  user.posts.push(post._id);
  await user.save();
  res.redirect('/profile');
});

router.get('/logout', function (req, res) {
  // Change the following line to include a callback function
  req.logout(function(err) {
    if (err) {
      console.error(err);
    }
    res.redirect('/');
  });
});



function isloggedin(req, res, next) {
  if (req.isAuthenticated()) return next();
  res.redirect('/');
}

module.exports = router;
