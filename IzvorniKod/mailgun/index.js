const jwt = require('jsonwebtoken');
const mailgun = require("mailgun-js");

const API_KEY = 'a3c05d7998d6ef8acd77adfd3a63bd6b-3d0809fb-81259829'
const DOMAIN = 'sandbox36946a88669248dbaf1c8ee259ed9e7d.mailgun.org';
const mg = mailgun({ apiKey: API_KEY, domain: DOMAIN });

// usage: mg.send(email, {
//      password: password,
//      name: ime,
// });
const send = async (email, data) => {
    // kod registracije
    if (data.password && data.name) {
        const JWT_ACC_ACTIVATE = 'accountactivatekey123';
        const password = data.password
        const token = jwt.sign({ email, password }, JWT_ACC_ACTIVATE, { expiresIn: '1d' });
        const link = 'http://localhost:3000/aktivacija/?token=' + token;      // ! promijeniti za deploy
        const emailData = {
            from: 'noreply@sci-con.com',
            to: email,
            subject: 'Sci-Con: Aktivacijski link',
            html: `
            <h1>Poštovani ${data.name},</h1>
            <h2>Molimo potvrdite svoju registraciju:</h2>
            <a href="${link}"><b>${link}</b></a>
            <p>Nakon klika na link, možete se prijaviti u sustav. Vaša lozinka je: <b>${password}</b><p>
            `
        };
        mg.messages().send(emailData, function (error, body) {
            if (error) {
                console.log("Internal error: unable to send email: " + error)
            } else {
                console.log('Email has been sent to ' + email);
            }
        });
    }

    // kod slanja obavijesti
    else if (data.obavijest && data.naslov) {
        const emailData = {
            from: 'noreply@sci-con.com',
            to: email,
            subject: data.naslov,
            text: data.obavijest
        };
        mg.messages().send(emailData, function (error, body) {
            if (error) {
                console.log("Internal error: unable to send email: " + error)
            } else {
                console.log('Notification email has been sent to ' + email);
            }
        });
    }
}

module.exports = {
    send,
}