const express = require('express');
const router = express.Router();
const db = require('../queries');
const mg = require('../mailgun');

// ###############
const nodemailer = require('nodemailer')
const jwt = require('jsonwebtoken');
// ###############

// ucitaj stranicu za registraciju
router.get('/', async (req, res, next) => {
    res.render('registracija', {
        title: 'Registracija',
        user: req.session.user,
        err: null,
    })
})

// registriraj se
router.post('/', async (req, res, next) => {
    //get HTTP request body
    let body = req.body

    // get users
    let users = await db.getUsers();
    if (users === undefined) {
        res.render('registracija', {
            title: 'Registracija',
            user: req.session.user,
            err: 'Database error',
        })
        return;
    }

    try {
        //check if email already has an account associated with it
        users.every((u) => {
            if (u.email === body.email) {
                // email already has an account associated with it
                throw "email already has an account associated with it"
            }
            return true // continue
        });

        // generiraj password
        let number = null
        let password = ""
        for (let i = 0; i < 4; i++) {
            number = Math.floor(Math.random() * 1000) // od 0 do 1000
            password = password + (number % 10).toString();
        }
        console.log("password is " + password)

        // slanje emaila
        // await mg.send(body.email, {
        //     password: password,
        //     name: body.ime,
        // });

        // ######################################################################################
        // ############################ slanje emaila ###########################################
        let transport = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: 'sci.con.testni@gmail.com',
                pass: 'sci_con_testni',
            },
        });

        const email = body.email;
        const JWT_ACC_ACTIVATE = 'accountactivatekey123';
        const token = jwt.sign({ email, password }, JWT_ACC_ACTIVATE, { expiresIn: '1d' });
        const link = 'http://localhost:3000/aktivacija/?token=' + token;      // ! promijeniti za deploy
    
        const message = {
            from: 'sci.con.testni@gmail.com',
            to: email,
            subject: 'Sci-Con: Aktivacijski link',
            html: `
            <h1>Poštovani ${body.ime},</h1>
            <h2>Molimo potvrdite svoju registraciju:</h2>
            <a href="${link}"><b>${link}</b></a>
            <p>Nakon klika na link, možete se prijaviti u sustav. Vaša lozinka je: <b>${password}</b><p>
            `
        }
    
        transport.sendMail(message, function(err, info) {
            if (err) {
                console.log(err)
            } else {
                console.log(info)
            }
        })
        // ######################################################################################
        
        //dodaj usera u bazu
        try {
            let id = await db.createUser(body.ime, body.prezime, body.institucija, body.država, body.grad, body.ulica, body.kbroj, body.email, password)
        } catch (err) {
            throw "Database error"
        }

    } catch (err) {
        console.log(err)
        res.render('registracija', {
            title: 'Registracija',
            user: req.session.user,
            err: err,
        })
        return
    }

    var result = 'registrated';
    res.redirect('/prijava?result=' + result);

});

module.exports = router;