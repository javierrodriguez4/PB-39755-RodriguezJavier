const isAdmin = (req, res, next) => {
    if (req.isAuthenticated() && req.user.role === 'admin') {
        next();
    } else {
        res.render('notAuthorized');
    }
};

module.exports = isAdmin;
