const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const User = require('../models/user'); 

passport.use(new LocalStrategy(
    async function(username, password, done) {
        try{
            const user = await User.findOne({ username: username });
            if (!user) {
                return done(null, false, { message: 'Incorrect username.' })
            }
            const isValid = await user.validPassword(password);
            if (!isValid) {
                return done(null, false, { message: 'Incorrect password.' });
            }
            return done(null, user);
        } catch (err) {
            return done(err);
        }    
    }
));

passport.serializeUser(function(user, done) {
    done(null, user.id);
})

passport.deserializeUser(async function(id, done) {
    try {
        const user = await User.findById(id);
        done(null, user);
    } catch (err) {
        done(err);
    }
});

