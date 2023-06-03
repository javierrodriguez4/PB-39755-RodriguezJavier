const express = require('express');
const router = express.Router();
const Cart = require('../models/carts.model');
const mongoose = require('mongoose');

router.get('/:cartId/:itemId', async (req, res) => {
    const { cartId, itemId } = req.params;
    if (!mongoose.Types.ObjectId.isValid(cartId)) {
        return res.status(400).json({ error: 'ID de carrito inválido' });
    }

    try {
        const cart = await Cart.findById(cartId);
        if (!cart) {
            return res.status(404).json({ error: 'Carrito no encontrado' });
        }

        const itemIndex = cart.items.findIndex((item) => item._id.equals(itemId));
        if (itemIndex === -1) {
            return res.status(404).json({ error: 'Producto no encontrado en el carrito' });
        }

        cart.items.splice(itemIndex, 1);
        await cart.save();
        return res.render('cartsDeleteById', { cartId, itemId });
    } catch (error) {
        console.error(error);
        return res.status(500).render('notCart');
    }
});

module.exports = router;
