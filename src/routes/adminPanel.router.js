const { Router } = require('express')
const router = Router()
const productModel = require('../models/products.model');
const isAdmin = require('../middlewares/isAdmin');

router.get('/', isAdmin, async (req, res) => {
    const products = await productModel.find().lean();
    const isLoggedIn = req.session.user ? true : false;
    const user = req.session.user;
    res.status(200).render('admin_panel', {products, isLoggedIn, user})
});




module.exports = router
