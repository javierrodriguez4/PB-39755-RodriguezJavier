const express = require('express');
const router = express.Router();
const passport = require('passport');

router.get('/', passport.authenticate('github', { scope: ['user:email'] }));
router.get('/githubcallback', 
passport.authenticate('github', { failureRedirect: '/login' }), 
async (req, res) => {
    req.session.user = req.user;
    res.redirect('/');
}
);

module.exports = router;