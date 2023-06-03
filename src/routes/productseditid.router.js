const express = require('express');
const router = express.Router();
const productModel = require('../models/products.model');
const isAdmin = require('../middlewares/isAdmin');


router.get('/:pid', isAdmin, async (req, res) => {
    const productId = req.params.pid;
    try {
        const producto = await productModel.findById(productId).lean();
        if (producto) {
            res.render('productsedit', { producto });
        } else {
            res.status(404).send('Producto no encontrado');
        }
    } catch (error) {
        res.status(500).send('Error al obtener información del producto');
    }
});


module.exports = router;
