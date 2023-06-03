const express = require('express');
const router = express.Router();
const Product = require('../models/products.model');
const Cart = require('../models/carts.model');
const Handlebars = require('handlebars');
const Swal = require('sweetalert2');
const mongoose = require('mongoose');


Handlebars.registerHelper('reduce', function (array, prop) {
    return array.reduce((acc, item) => acc + item[prop], 0);
});
Handlebars.registerHelper('multiply', function (a, b) {
    return a * b;
});
Handlebars.noEscape = true;


async function getOrCreateCart(userEmail = null) {
    if (userEmail) {
        const cart = await Cart.findOne({ 'user.email': userEmail }).exec();
        if (cart) {
            return cart;
        } else {
            const newCart = new Cart({ user: { email: userEmail }, items: [] });
            return newCart.save();
        }
    } else {
        const cart = await Cart.findOne({ 'user.email': null }).exec();
        if (cart) {
            return cart;
        } else {
            const newCart = new Cart({ items: [] });
            return newCart.save();
        }
    }
}

// Visualizar el Carrito
router.get('/', async (req, res) => {
    try {
        const { sortOption } = req.query;
        const userEmail = req.session.user && req.session.user.email ? req.session.user.email : null;

        let cart;
        if (userEmail) {
            cart = await getOrCreateCart(userEmail);
        } else {
            cart = await getOrCreateCart();
        }

        if (!cart || cart.items.length === 0 || (!userEmail && cart.user.email)) {
            req.flash('info', 'No hay productos en el carrito');
            return res.redirect('/');
        }
        const cartId = cart._id.toString();

        let sortedItems = [...cart.items];

        if (sortOption === 'asc') {
            sortedItems.sort((a, b) => a.producto.price - b.producto.price);
        } else if (sortOption === 'desc') {
            sortedItems.sort((a, b) => b.producto.price - a.producto.price);
        }

        const totalPriceAggregate = await Cart.aggregate([
            { $match: { _id: cart._id } },
            { $unwind: '$items' },
            {
                $lookup: {
                    from: 'products',
                    localField: 'items.producto',
                    foreignField: '_id',
                    as: 'product',
                },
            },
            { $unwind: '$product' },
            {
                $group: {
                    _id: '$_id',
                    totalPrice: {
                        $sum: { $multiply: ['$product.price', '$items.cantidad'] },
                    },
                },
            },
        ]);

        const totalPrice = totalPriceAggregate.length > 0 ? totalPriceAggregate[0].totalPrice : 0;

        res.render('carts', { cart: { ...cart, items: sortedItems }, totalPrice, cartId });


    } catch (err) {
        console.error(err);
        res.status(500).render('notCart');
    }
});

// Vaciar el carrito por su ID
router.post('/:cartId/vaciar', async (req, res) => {
    try {
        const cartId = req.params.cartId;
        const cart = await Cart.findOneAndUpdate({ _id: cartId, 'user.email': req.session.user.email }, { items: [] });


        if (!cart) {
            req.flash('error', 'No se encontró el carrito');
            return res.redirect('/');
        }

        cart.items = [];
        await cart.save();
        req.flash('success', 'Carrito vaciado exitosamente');
        res.redirect('/');
    } catch (err) {
        console.error(err);
        res.status(500).send('Error al vaciar el carrito');
    }
});

// Eliminar el carrito de la base de datos
router.post('/:cartId/eliminar', async (req, res) => {
    try {
        const cartId = req.params.cartId;
        const result = await Cart.deleteOne({ _id: cartId, 'user.email': req.session.user.email });


        if (result.deletedCount === 0) {
            req.flash('error', 'No se encontró el carrito');
            return res.redirect('/');
        }

        req.flash('success', 'Carrito vaciado exitosamente');
        res.redirect('/');
    } catch (err) {
        console.error(err);
        res.status(500).send('Error al vaciar el carrito');
    }
});

// Actualizar la cantidad de un producto en el carrito
router.put('/:cartId/:itemId', async (req, res) => {
    try {
        const cartId = req.params.cartId;
        const itemId = req.params.itemId;
        const { cantidad } = req.body;

        if (!mongoose.Types.ObjectId.isValid(cartId)) {
            req.flash('error', 'ID de carrito inválido');
            return res.redirect('/');
        }

        const cart = await Cart.findOneAndUpdate(
            { _id: cartId, 'user.email': req.session.user.email, 'items._id': itemId },
            { $set: { 'items.$.cantidad': cantidad } },
            { new: true }
        );

        if (!cart) {
            req.flash('error', 'No se encontró el carrito');
            return res.redirect('/');
        }

        req.flash('success', 'Cantidad actualizada exitosamente');
        res.redirect('/carts');
    } catch (err) {
        console.error(err);
        res.status(500).send('Error al actualizar la cantidad del producto');
    }
});

// Agregar productos al carrito
router.post('/:pid', async (req, res) => {
    try {
        const userEmail = req.session.user.email;
        const { cantidad } = req.body;
        const productId = req.params.pid;
        const producto = await Product.findOne({ _id: productId });

        if (!userEmail) {
            req.flash('error', 'Usuario no autenticado');
            res.status(500).redirect('/login');
            return;
        }

        let cart = await getOrCreateCart(userEmail);

        // Verificar si el producto ya está en el carrito
        const itemExists = cart.items.some(item => item.producto.toString() === productId);
        if (itemExists) {
            Swal.fire({
                icon: 'error',
                title: 'Oops...',
                text: 'Something went wrong!',
                footer: '<a href="">Why do I have this issue?</a>'
            })
        } else {

            cart.items.push({ producto: producto, cantidad: cantidad });

            cart.user.email = userEmail;
            await cart.save();
            Swal.fire({
                icon: 'success',
                title: 'Bien..!!',
                text: 'Producto agregado al carrito'
            })
            const referer = req.header('Referer');
            res.redirect(referer || '/');
        }
    } catch (err) {
        res.status(500).redirect('/login');
    }
});



module.exports = router;
