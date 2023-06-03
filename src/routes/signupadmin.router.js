const express = require('express');
const router = express.Router();
const passport = require('passport');

router.get('/', (req, res) => {
    res.render('signupadmin');
});

router.post('/', (req, res, next) => {
    passport.authenticate('signupadmin', (err, user, info) => {
        if (err) {
            console.error(err);
            return res.status(500).send('Error de servidor');
        }

        if (!user) {
            if (info.message === 'Email already exists.') {
                return res.redirect('/notSignupByEmail');
            } else if (info.message === 'Phone already exists.') {
                return res.render('notSignupByPhone');
            }
        }

        req.login(user, (err) => {
            if (err) {
                console.error(err);
                return res.status(500).send('Error de servidor');
            }

            res.redirect('/users');
        });
    })(req, res, next);
});

module.exports = router;
