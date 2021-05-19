const express = require('express');
const router = express.Router();

router.get('/', async (req, res, next) => {
    res.render('index', {
        title: 'Home',
        user: req.session.user,
        err: null,
    })
})

module.exports = router;