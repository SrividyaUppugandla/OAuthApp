// dependencies
var fs = require('fs');
var express = require('express');
var passport = require('passport');
var path = require('path');

var app = express();

// configure Express
app.configure(function() {
    app.set('views', __dirname + '/views');
    app.set('view engine', 'jade');
    app.use(express.logger());
    app.use(express.cookieParser());
    app.use(express.bodyParser());
    app.use(express.methodOverride());
    app.use(express.session({ secret: 'my_precious', maxAge: 1000*60*60 }));

    // Initialize Passport!  Also use passport.session() middleware, to support
    // persistent login sessions (recommended).
    app.use(passport.initialize());
    app.use(passport.session({maxAge: 1000*60*60}));
    app.use(app.router);
    app.use(express.static(__dirname + '/public'));

});

//Initiate provider configuration and routes.
var facebook = require('./providers/facebook');
var google = require('./providers/google');
var linkedin = require('./providers/linkedin');
var twitter = require('./providers/twitter');

new facebook(app);
new google(app);
new linkedin(app);
new twitter(app);

// Configure Passport authenticated session persistence.
//
// In order to restore authentication state across HTTP requests, Passport needs
// to serialize users into and deserialize users out of the session.  In a
// production-quality application, this would typically be as simple as
// supplying the user ID when serializing, and querying the user record by ID
// from the database when deserializing.  However, due to the fact that this
// example does not have a database, the complete Provider(facebook/google/twitter/linkedin)
// profile is serialized and deserialized.
passport.serializeUser(function(user, cb) {
    cb(null, user);
});

passport.deserializeUser(function(obj, cb) {
    cb(null, obj);
});


//Terminate an existing login session and redirect to login page.
app.get('/logout', function(req, res){
    req.logout();
    res.redirect(req.query.callbackUrl);
});

// Simple route middleware to ensure user is authenticated.
//   Use this route middleware on any resource that needs to be protected.  If
//   the request is authenticated (typically via a persistent login session),
//   the request will proceed.  Otherwise, the user will be redirected to the
//   login page.
function ensureAuthenticated(req, res, next) {
    if (req.isAuthenticated()) { return next(); }
    res.redirect('/login');
}

// port
var port = process.env.VCAP_APP_PORT || 3000;
app.listen(port);

module.exports = app;


