const express = require('express')
const router = express.Router()


router.get('/', async (req, res) => {
    req.session.destroy((err) => {
        if (err) {
            console.error(`Error al destruir la sesión: ${err}`);
            return res.status(500).send('Error de servidor');
        }
        res.redirect('/');
    });
})

module.exports = router;
