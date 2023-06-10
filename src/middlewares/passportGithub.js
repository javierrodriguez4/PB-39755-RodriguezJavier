const passport = require('passport');
const GitHubStrategy = require('passport-github2').Strategy;
const UserModel = require('../models/users.model');

// Variables de entorno
const clientID = process.env.CLIENTE_ID;
const clientSecret = process.env.CLIENTE_ID_GITHUB;
const callbackURL = process.env.CLIENTE_URL_GITHUB;

// Configurar la estrategia local de Passport
const initializePassport = () => {
    passport.use('github', new GitHubStrategy({
        clientID: clientID,
        clientSecret: clientSecret,
        callbackURL: callbackURL
    }, async (accessToken, refreshToken, profile, done) => {

        try {
            const user = await UserModel.findOne({ email: profile._json.email });
            if (user) return done(null, user);

            const newUser = await UserModel.create({
                first_name: profile._json.name,
                email: profile._json.email,
                role: 'user',
            });

            return done(null, newUser);
        } catch (err) {
            return done(err);
        }
    }));

    passport.serializeUser((user, done) => {
        done(null, user._id);
    });

    passport.deserializeUser(async (id, done) => {
        const user = await UserModel.findById(id);
        done(null, user);
    });
};

module.exports = initializePassport;
