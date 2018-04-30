var _         = require('underscore');
var jwt       = require('jsonwebtoken');
var validator = require('validator');
var axios     = require('axios');
var crypto    = require("crypto");

var SettingsController = require('../controllers/SettingsController');
var UserController = require('../controllers/UserController');

module.exports = function(router){

  // ---------------------------------------------
  // AUTHENTICATION
  // ---------------------------------------------

  /**
   * Login a user with a username (email) and password.
   * Find em', check em'.
   * Pass them an authentication token on success.
   * Otherwise, 401. You fucked up.
   *
   * body {
   *  email: email,
   *  password: password
   *  token: ?
   * }
   *
   */
  router.post('/login',
    function(req, res, next){
      var email = req.body.email;
      var password = req.body.password;
      var token = req.body.token;

      if (token) {
        UserController.loginWithToken(token,
          function(err, token, user){
            if (err || !user) {
              return res.status(400).send(err);
            }
            return res.json({
              token: token,
              user: user
            });
          });
      } else {
        UserController.loginWithPassword(email, password,
          function(err, token, user){
            if (err || !user) {
              return res.status(400).send(err);
            }
            return res.json({
              token: token,
              user: user
            });
          });
      }

  }); 

  router.post('/mlh/login',
    function(req, res, next){
      var mlhToken = req.body.token;

      axios.get('https://my.mlh.io/api/v2/user.json?access_token=' + mlhToken)
      .then(function (response) {
        console.log("user exists: " + UserController.doesEmailExist(response.data.data.email));
        if (UserController.doesEmailExist(response.data.data.email)) {
          UserController.mlhLogin(response.data.data.email,
            function(err, token, user){
              if (err || !user) {
                return res.status(400).send(err);
              }
              return res.json({
                token: token,
                mlhToken: mlhToken,
                user: user
              });
            });
        } else {
          var randPassword = crypto.randomBytes(20).toString('hex');

          UserController.createUser(response.data.data.email, randPassword,
            function(err, user){
              if (err){
                return res.status(500).send(err);
              }

              user.mlhToken = mlhToken;

              return res.json(user);
          });
        }
      })
      .catch(function (error) {
        return res.status(500).send(error);
      });
  }); 

  router.get('/mlh/authorize',
    function(req, res, next){
      res.redirect('https://my.mlh.io/oauth/authorize?client_id=' + process.env.MLH_CLIENT_ID + '&redirect_uri=' + process.env.REDIRECT_URI + '&response_type=token&scope=email+demographics');
  }); 

  /**
   * Register a user with a username (email) and password.
   * If it already exists, then don't register, duh.
   *
   * body {
   *  email: email,
   *  password: password
   * }
   *
   */
  router.post('/register',
    function(req, res, next){
      // Register with an email and password
      var email = req.body.email;
      var password = req.body.password;

      UserController.createUser(email, password,
        function(err, user){
          if (err){
            return res.status(400).send(err);
          }
          return res.json(user);
      });
  });

  router.post('/reset',
    function(req, res, next){
      var email = req.body.email;
      if (!email){
        return res.status(400).send();
      }

      UserController.sendPasswordResetEmail(email, function(err){
        if(err){
          return res.status(400).send(err);
        }
        return res.json({
          message: 'Email Sent'
        });
      });
  });

  /**
   * Reset user's password.
   * {
   *   token: STRING
   *   password: STRING,
   * }
   */
  router.post('/reset/password', function(req, res){
    var pass = req.body.password;
    var token = req.body.token;

    UserController.resetPassword(token, pass, function(err, user){
      if (err || !user){
        return res.status(400).send(err);
      }
      return res.json(user);
    });
  });

  /**
   * Resend a password verification email for this user.
   *
   * body {
   *   id: user id
   * }
   */
  router.post('/verify/resend',
    function(req, res, next){
      var id = req.body.id;
      if (id){
        UserController.sendVerificationEmailById(id, function(err, user){
          if (err || !user){
            return res.status(400).send();
          }
          return res.status(200).send();
        });
      } else {
        return res.status(400).send();
      }
  });

  /**
   * Verify a user with a given token.
   */
   router.get('/verify/:token',
    function(req, res, next){
      var token = req.params.token;
      UserController.verifyByToken(token, function(err, user){

        if (err || !user){
          return res.status(400).send(err);
        }

        return res.json(user);

      });
    });

};