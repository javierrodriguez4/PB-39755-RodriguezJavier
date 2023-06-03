const express = require('express');
const router = express.Router();
const productModel = require('../models/products.model');
const isAdmin = require('../middlewares/isAdmin');

router.get('/:id', isAdmin, async (req, res) => {
    try {
        const productId = req.params.id;
        const product = await productModel.findByIdAndRemove(productId).lean();

        if (product) {
            res.render('productsdeletebyid', { product });
        } else {
            res.sendStatus(404);
        }
    } catch (error) {
        res.sendStatus(500);
    }
});

module.exports = router;
