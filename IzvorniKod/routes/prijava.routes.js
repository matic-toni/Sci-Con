const express = require('express');
const router = express.Router();
const db = require('../queries')

//ucitaj login stranicu
router.get('/', async (req, res, next) => {
    var msg;
    try {
        result = req.query['result'];
        if (result == 'registrated') {
            msg = 'Na Vašu e-mail adresu dostavljena je lozinka i aktivacijski link. Molimo, prvo potvrdite svoju registraciju.'
        } else if (result == 'activated') {
            msg = "Aktivacija računa uspješna! Prijavite se.";
        } else if (result == 'error1' || result == 'error2') {
            msg = 'Pogrešna e-mail adresa ili lozinka.'
        } else if (result == 'error3') {
            msg = 'Vaša registracija nije potvrđena. Provjerite e-mail.'
        } else if (result == 'lozinka-promijenjena') {
            msg = 'Nova lozinka dostavljena je na vašu e-mail adresu.'
        }
    } catch (ex) {
        msg = null
    }
    res.render('prijava', {
        title: 'Prijava',
        user: req.session.user,
        err: null,
        registrationMsg: msg
    })
})

//logiraj se
router.post('/', async (req, res, next) => {
    //get HTTP request body
    let body = req.body
    let user = null
    let error = null

    try {
        let postoji = await db.checkEmailExists(body.email)

        // provjeri email
        if (postoji) {
            user = await db.getUserByEmail(body.email);
        } else {
            error = 'error1'
            throw "Kriva email adresa"
        }

        // provjeri je li potvrđen email
        if (!(user.potvrdjen_email)) {
            // nije potvrđen email
            error = 'error3'
            throw "Nije potvrđen email"
        }

        // provjeri lozinku
        if (!(user.lozinka == body.lozinka)) {
            // wrong password
            error = 'error2'
            throw "Kriva šifra"
        }

        // provjeri je li admin
        console.log("admin?: " + user.administrator)

    } catch (err) {
        // unsuccessfull login
        console.log(err)
        res.redirect('/prijava?result=' + error)
        return
    }

    // successfull login
    console.log("successfull login")
    req.session.user = user;

    if (req.session.user.administrator) {
        res.redirect('/administrator');
        return;
    }

    res.redirect('/profil');
})

module.exports = router;