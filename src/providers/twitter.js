// dependencies
var passport = require('passport');
var TwitterStrategy = require('passport-twitter').Strategy;
var qs = require("qs");
var accesstoken = '';
var refreshtoken = '';
var callbackUrl = '';


// Configure the Twitter strategy for use by Passport.
//
// OAuth 2.0-based strategies require a `verify` function which receives the
// credential (`accessToken`) for accessing the Twitter API on the user's
// behalf, along with the user's profile.  The function must invoke `done`
// with a user object, which will be set at `req.user` in route handlers after
// authentication.
if (process.env.twitter_clientID && process.env.twitter_clientSecret && process.env.twitter_callbackURL) {
    passport.use(new TwitterStrategy({
            consumerKey: process.env.twitter_clientID,
            consumerSecret: process.env.twitter_clientSecret,
            callbackURL: process.env.twitter_callbackURL
        },
        function(accessToken, refreshToken, profile, done) {
            // In this example, the user's Twitter profile is supplied as the user
            // record.  In a production-quality application, the Twitter profile should
            // be associated with a user record in the application's database, which
            // allows for account linking and authentication with other identity
            // providers.
            accesstoken = accessToken;
            refreshtoken = refreshToken;
            done(null, profile);
        }
    ));
}

function twitter(app){
    app.get('/twitter', function (req, res) {
        if (process.env.twitter_clientID && process.env.twitter_clientSecret && process.env.twitter_callbackURL) {
            callbackUrl = req.query.callbackUrl;
            //res.cookie('callbackUrl', callbackUrl, {httpOnly: true});
            res.redirect("/auth/twitter");
        }
        else {
            res.send(404);
        }
    });

    // GET /auth/twitter
    //   Use passport.authenticate() as route middleware to authenticate the
    //   request.  The first step in Twitter authentication will involve
    //   redirecting the user to twitter.com.  After authorization, Twitter will
    //   redirect the user back to this application at /auth/twitter/callback
    app.get('/auth/twitter',
        passport.authenticate('twitter'),
        function(req, res){
            // The request will be redirected to Twitter for authentication, so this
            // function will not be called.
        }
    );
    // GET /auth/twitter/callback
    //   Use passport.authenticate() as route middleware to authenticate the
    //   request.  If authentication fails, the user will be redirected back to the
    //   login page.  Otherwise, the primary route function function will be called,
    //   which, in this example, will redirect the user to the account page.
    app.get('/auth/twitter/callback',
        passport.authenticate('twitter', { session: false }),
        function(req, res) {
            var params = {
                accessToken: accesstoken,
                refreshToken: refreshtoken,
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

module.exports = twitter;
