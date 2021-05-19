const express = require('express');
const router = express.Router();
const db = require('../queries');
const jwt = require('jsonwebtoken');

const JWT_ACC_ACTIVATE = 'accountactivatekey123';

// provjera kod potvrde emaila
router.get('/', (req, res) => {
    const token = req.query['token'];
    if(token) {
        jwt.verify(token, JWT_ACC_ACTIVATE, async function(err, decodedToken) {
            if(err) {
                return res.status(400).json({error: 'Incorrect or expired link.'});
            }
            const { email, password } = decodedToken;
            console.log(email, password)
            try {
                await db.confirmEmail(email, password)
            } catch (err) {
                throw "Database error: " + err
            }
        })
    } else {
        return res.json({error: 'Something went wrong'})
    }

    var result = 'activated';
    res.redirect('/prijava?result=' + result);
})

module.exports = router;