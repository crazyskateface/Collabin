const express = require('express');
const passport = require('passport');
const User = require('../models/user');
const router = express.Router();

// Registration route
router.get('/register', (req, res) => {
    res.render('register', { title: 'Register' });
});

router.post('/register', async (req, res) => {
    try{
        const newUser = new User( {
            username: req.body.username,
            password: req.body.password
        });

    await newUser.save();
    res.redirect('/');
    } catch(err) {
        res.status(500).send('Error registering new user');
    }
});

// login route
router.get('/login', (req, res) => {
    res.render('login', { title: 'Login' });
});

router.post('/login', passport.authenticate('local', {
    successRedirect: '/',
    failureRedirect: '/login',
    failureFlash: false
}));

// Logout route
router.get('/logout', (req, res) => {
    req.logout((err) => {
        if (err) {
            return next(err);
        }
        res.redirect('/');
    });
});

module.exports = router;