const express = require('express')
const router = express.Router();
const db = require('../queries');

router.get('/', async (req, res, next) => {
    res.render('profil', {
        title: 'Profil',
        user: req.session.user,
        err: null,
    })
})
// update podataka
router.post('/', async (req, res, next) => {
    //get HTTP request body
    let body = req.body
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
        //check if email already has an account associated with it
        users.every((u) => {
            if (u.email === body.email && u.identifikacija !== user.identifikacija) {
                console.log(u.id, user.identifikacija)
                // email already has an account associated with it but not the current one
                throw "email already has an account associated with it"
            }
            return true // continue
        });

        //update usera
        console.log(body)
        try {
            user.prezime = body?.prezime || user.prezime
            user.institucija = body?.institucija || user.institucija
            user.ime = body?.ime || user.ime
            user.država = body?.država || user.država
            user.grad = body?.grad || user.grad
            user.ulica = body?.ulica || user.ulica
            user.kbroj = body?.kbroj || user.kbroj
            await db.updateUser(user.identifikacija, user)
            console.log('User updated successfully.')
        } catch (err) {
            throw "Database error"
        }

    } catch (err) {
        console.log(err)
        res.render('postavke', {
            title: 'Postavke',
            user: req.session.user,
            err: err,
        })
        return
    }
    res.redirect('/profil');
})

module.exports = router;