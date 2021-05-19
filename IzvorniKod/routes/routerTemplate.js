const express = require('express');
const router = express.Router();

router.get('/', async (req, res, next) => {
    res.render('', {
        title: '',
        user: req.session.user,
        err: null,
    })
    return
})

module.exports = router;