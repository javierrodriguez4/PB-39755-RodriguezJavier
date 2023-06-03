const express = require('express');
const router = express.Router();
const productModel = require('../models/products.model');
const Handlebars = require('handlebars');


router.get('/:pid', async (req, res) => {
    const productId = req.params.pid;
    const product = await productModel.findById(productId).lean();
    const isLoggedIn = req.session.user ? true : false;
    const user = req.session.user;
    if (product) {
        res.render('productsid', { product, isLoggedIn, user });
    } else {
        res.status(404).send('Producto no encontrado');
    }
});

router.post('/', (req, res) => {
    const newProduct = req.body;
    products.push(newProduct);
    res.redirect('/products');
});

Handlebars.registerHelper("ifEqual", function (a, b, options) {
    if (a === b) {
        return options.fn(this);
    } else {
        return options.inverse(this);
    }
});


module.exports = router;
