// dependencies
var passport = require('passport');
var GoogleStrategy = require('passport-google-oauth2').Strategy;
var qs = require("qs");
var accesstoken = '';
var callbackUrl = '';


// Configure the Google strategy for use by Passport.
//
// OAuth 2.0-based strategies require a `verify` function which receives the
// credential (`accessToken`) for accessing the Google API on the user's
// behalf, along with the user's profile.  The function must invoke `done`
// with a user object, which will be set at `req.user` in route handlers after
// authentication.
if (process.env.google_clientID && process.env.google_clientSecret && process.env.google_callbackURL) {
    passport.use(new GoogleStrategy({
            clientID: process.env.google_clientID,
            clientSecret: process.env.google_clientSecret,
            callbackURL: process.env.google_callbackURL
        },
        function(request, accessToken, refreshToken, profile, done) {
            // In this example, the user's Google profile is supplied as the user
            // record.  In a production-quality application, the Google profile should
            // be associated with a user record in the application's database, which
            // allows for account linking and authentication with other identity
            // providers.
            accesstoken = request;
            done(null, profile);
        }
    ));
}

function google(app){
    app.get('/google', function (req, res) {
        if (process.env.google_clientID && process.env.google_clientSecret && process.env.google_callbackURL) {
            callbackUrl = req.query.callbackUrl;
            //res.cookie('callbackUrl', callbackUrl, {httpOnly: true});
            res.redirect("/auth/google");
        }
        else {
            res.send(404);
        }

    });

    // GET /auth/google
    //   Use passport.authenticate() as route middleware to authenticate the
    //   request.  The first step in google authentication will involve
    //   redirecting the user to google.com.  After authorization, google will
    //   redirect the user back to this application at /auth/google/callback
    app.get('/auth/google',
        passport.authenticate('google', { scope: [
            'https://www.googleapis.com/auth/plus.login',
            'https://www.googleapis.com/auth/plus.profile.emails.read'
        ] }),
        function(req, res){
            // The request will be redirected to Google for authentication, so this
            // function will not be called.
        }
    );

    // GET /auth/google/callback
    //   Use passport.authenticate() as route middleware to authenticate the
    //   request.  If authentication fails, the user will be redirected back to the
    //   login page.  Otherwise, the primary route function function will be called,
    //   which, in this example, will redirect the user to the account page.
    app.get('/auth/google/callback',
        passport.authenticate('google', { session: false }),
        function(req, res) {
            var params = {
                accessToken: accesstoken,
                id: req.user.id,
                displayName: req.user.displayName,
                provider: req.user.provider
            };
            params = qs.stringify(params);
            if(callbackUrl) {
                res.redirect(callbackUrl+'?'+params);
            }
            else {
                res.send("Not a valid redirect URL", 400);
            }
        }
    );
}

module.exports = google;
