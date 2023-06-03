const { Router } = require('express')
const productModel = require('../models/products.model');
const Handlebars = require('handlebars');
const router = Router()


router.get('/', async (req, res) => {
    const limit = parseInt(req.query.limit);
    const products = await productModel.find().lean();
    const isLoggedIn = req.session.user ? true : false;
    const user = req.session.user;
    if (isNaN(limit)) {
        res.status(200).render('index', { products: products.slice(0, 4), productLength: products.length, isLoggedIn, user });
    } else {
        res.status(200).render('index', { products: products.slice(0, limit), productLength: products.length, isLoggedIn, user });
    }
});


Handlebars.registerHelper("ifEqual", function (a, b, options) {
    if (a === b) {
        return options.fn(this);
    } else {
        return options.inverse(this);
    }
});


module.exports = router
