const express = require('express')
const router = express.Router();
const db = require('../queries');


router.post('/', async(req, res, next) => {
    
    let user = req.session.user

    // get users
    let users = await db.getUsers();
    if (users === undefined) {
        res.render('registracija2', {
            title: 'Registracija',
            user: req.session.user,
            err: 'Database error',
        })
        return;
    }

    try {
        let result = await db.deleteUser(user.identifikacija)
            if(result) {
                console.log('Korisnički račun s identifikacijom ' + user.identifikacija + ' uspješno izbrisan.')
            } else {
                console.log('Korisnički račun nije izbrisan.')
            }
        } catch (err) {
            console.log(err)
        }
    res.redirect('/');
})

module.exports = router;