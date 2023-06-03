const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const bcrypt = require('bcrypt');
const User = require('../models/users.model');

passport.use(new LocalStrategy({
    usernameField: 'email',
    passwordField: 'password'
}, (email, password, done) => {
    User.findOne({ email: email })
        .exec()
        .then(user => {
            if (!user) {
                return done(null, false, { message: 'Email or password is incorrect.' });
            }

            bcrypt.compare(password, user.password)
                .then(result => {
                    if (result) {
                        return done(null, user);
                    } else {
                        return done(null, false, { message: 'Email or password is incorrect.' });
                    }
                })
                .catch(err => {
                    console.error(err);
                    return done(err);
                });
        })
        .catch(err => {
            console.error(err);
            return done(err);
        });
}));


passport.use(
    'signup',
    new LocalStrategy(
        {
            usernameField: 'email',
            passwordField: 'password',
            passReqToCallback: true
        },
        async (req, email, password, done) => {
            try {
                const existingUser = await User.findOne({ email: email });
                const existingUserPhone = await User.findOne({ phone: req.body.phone });

                if (existingUser) {
                    return done(null, false, { message: 'Email already exists.' });
                }
                if (existingUserPhone) {
                    return done(null, false, { message: 'Phone already exists.' });
                }

                const hash = bcrypt.hashSync(password, bcrypt.genSaltSync(10));
                const newUser = new User({
                    first_name: req.body.first_name,
                    last_name: req.body.last_name,
                    email: email,
                    phone: req.body.phone,
                    age: req.body.age,
                    role: req.body.role,
                    password: hash
                });

                await newUser.save();
                return done(null, newUser);
            } catch (err) {
                console.error(err);
                return done(err);
            }
        }
    )
);

passport.use(
    'signupadmin',
    new LocalStrategy(
        {
            usernameField: 'email',
            passwordField: 'password',
            passReqToCallback: true
        },
        async (req, email, password, done) => {
            try {
                const existingUser = await User.findOne({ email: email });
                const existingUserPhone = await User.findOne({ phone: req.body.phone });

                if (existingUser) {
                    return done(null, false, { message: 'Email already exists.' });
                }
                if (existingUserPhone) {
                    return done(null, false, { message: 'Phone already exists.' });
                }
                
                const hash = bcrypt.hashSync(password, bcrypt.genSaltSync(10));
                const newUser = new User({
                    first_name: req.body.first_name,
                    last_name: req.body.last_name,
                    email: email,
                    phone: req.body.phone,
                    age: req.body.age,
                    role: req.body.role,
                    password: hash
                });

                await newUser.save();
                return done(null, newUser);
            } catch (err) {
                console.error(err);
                return done(err);
            }
        }
    )
);

passport.serializeUser((user, done) => {
    done(null, user.id);
});

passport.deserializeUser((id, done) => {
    User.findById(id)
        .exec()
        .then(user => {
            done(null, user);
        })
        .catch(err => {
            done(err);
        });
});

module.exports = passport;
