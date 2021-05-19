const express = require('express');
const router = express.Router();
const db = require('../queries');
const nodemailer = require('nodemailer')

// generiranje nove lozinke
router.post('/', async (req, res) => {
    //get HTTP request body
    let body = req.body;

    try {
        // provjeri je li email u bazi
        let exists = false
        try {
            exists = await db.checkEmailExists(body.email);
        } catch {
            throw 'Database error';
        }

        //dohvati usera
        let user = null
        try {
            user = await db.getUserByEmail(body.email);
            if (user === null) {
                throw 'user is null, but this should never happen'
            }
        }
        catch (err) {
            throw 'database error: ' + err
        }

        // generate password
        newPassword = ""
        for (let i = 0; i < 4; i++) {
            number = Math.floor(Math.random() * 1000) // od 0 do 1000
            newPassword = newPassword + (number % 10).toString();
        }
        console.log("new password is " + newPassword)


        // spremi novu lozinku u bazu
        try {
            id = await db.updatePassword(user.identifikacija, newPassword);
        } catch {
            throw "Database error. Couldn't update password";
        }
        console.log('Lozinka uspješno promijenjena!')

        // salji email
        let transport = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: 'sci.con.testni@gmail.com',
                pass: 'sci_con_testni',
            },
        });

        const email = body.email;

        const message = {
            from: 'sci.con.testni@gmail.com',
            to: email,
            subject: 'Sci-Con: Aktivacijski link',
            html: `
        <h1>Poštovani ${user.ime},</h1>
        <p>Vaša nova lozinka je: <b>${newPassword}</b><p>
        `
        }

        transport.sendMail(message, function (err, info) {
            if (err) {
                console.log(err)
            } else {
                console.log(info)
            }
        })

        // redirekt
        var result = 'lozinka-promijenjena';
        res.redirect('/prijava?result=' + result);
    }
    catch (err) {
        res.redirect('/prijava?result=' + "error1");
        return
    }


});

module.exports = router;