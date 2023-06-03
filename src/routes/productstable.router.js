const express = require('express');
const router = express.Router();
const productModel = require('../models/products.model');
const Handlebars = require('handlebars');
const isAdmin = require('../middlewares/isAdmin');

router.get('/', isAdmin, async (req, res) => {
    const isLoggedIn = req.session.user ? true : false;
    const user = req.session.user;
    const sortOption = req.query.sortOption;
    let sortQuery = {};
    if (sortOption === 'desc') {
        sortQuery = { price: -1 };
    } else {
        sortQuery = { price: 1 };
    }

    if (sortOption === 'unorder') {
        return res.redirect('/productos');
    }

    try {
        const products = await productModel.find().sort(sortQuery).lean();
        res.render('productstable', { products, isLoggedIn, user });
    } catch (error) {
        console.error(error);
        res.status(500).send('Error al obtener los productos.');
    }
});

Handlebars.registerHelper("ifEqual", function (a, b, options) {
    if (a === b) {
        return options.fn(this);
    } else {
        return options.inverse(this);
    }
});

module.exports = router;
