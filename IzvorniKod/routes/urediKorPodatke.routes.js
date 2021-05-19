///urediKorPodatke/:id

const express = require('express');
const router = express.Router();
const db = require('../queries')


router.get('/:id', async (req, res, next) => {

    let idZaUredit = req.params.id;
    let forEditUser = await db.getUserById(idZaUredit);

    res.render('adminUredjujePodatke', {
        title: 'Uredi korisnika',
        user: req.session.user,
        err: null,
        forEditUser: forEditUser
    })
    return
})

// update podataka
router.post('/', async (req, res, next) => {
    //get HTTP request body
    let body = req.body
    let user = req.session.user

    if (!user.administrator) {
        res.redirect('/postavke');
        return;
    }

    let updatedUser = {}

    updatedUser.prezime = body?.prezime
    updatedUser.institucija = body?.institucija
    updatedUser.ime = body?.ime
    updatedUser.država = body?.država
    updatedUser.grad = body?.grad
    updatedUser.ulica = body?.ulica
    updatedUser.kbroj = body?.kbroj
    updatedUser.email = body?.email
    updatedUser.identifikacija = body?.identifikacija

    try {
        await db.updateUser(updatedUser.identifikacija, updatedUser);
        console.log('User updated successfully.')
    } catch (err) {
        console.log(err)
        res.render('urediKorPodatke', {
            title: 'Uredi korisnicke podatke',
            user: req.session.user,
            err: err,
        })
        return
    }
    res.redirect('/statistika');
})

module.exports = router;