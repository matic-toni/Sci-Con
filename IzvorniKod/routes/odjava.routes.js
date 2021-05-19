const express = require('express');
const router = express.Router();

router.get('/', async (req, res, next) => {
    req.session.user = undefined
    res.redirect('/')
    console.log("successfull log out")
    return
})

module.exports = router;