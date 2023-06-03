const express = require('express');
const passport = require('../middlewares/passport');
const router = express.Router();


router.get('/', (req, res) => {
    res.render('login');
});

router.post('/', passport.authenticate('local', {
    failureRedirect: '/notLoggedIn'
}), async (req, res) => {
    if (!req.user) {
        return res.status(400).send({ status: 'error', error: 'Invalid credentials' })
    }

    req.session.user = {
        first_name: req.user.first_name,
        last_name: req.user.last_name,
        email: req.user.email,
        role: req.user.role,
    }
    res.redirect('/');
});

module.exports = router;
