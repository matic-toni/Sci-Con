const express = require('express');
const router = express.Router();
const mg = require('../mailgun');
const db = require('../queries');
const bodyParser = require('body-parser');
const nodemailer = require('nodemailer');

router.get('/', async (req, res, next) => {

    let user = req.session.user
    let sekcije = await db.getSectionsByOrganizerId(user.identifikacija)
    msg = null

    try {
        result = req.query['result'];
        if (result == 'success') {
            msg = 'Obavijest uspješno poslana.'
        }
    } catch (ex) {
        console.log(ex)
    }
    
    let sectionList = []

    for (s of sekcije) {
        let section = {}
        let users = await db.getUsersFromSection(s.id_sekcije, s.id_konferencije)

        section.konferencija = s.naziv
        section.sekcija = s.naziv_sekcije
        section.sudionici = users

        if (section.sudionici.length == 0)
            continue
        sectionList.push(section)
    }


    res.render('obavijesti', {
        title: 'Slanje obavijesti',
        user: req.session.user,
        sekcije: sectionList,
        err: null,
        msg: msg
    })
})

router.post('/', async (req, res, next) => {
    let body = req.body
    let sudionici = []

    // određivanje liste emailova na koje treba slati obavijesti
    for (var key of Object.keys(body)) {
        if (key.startsWith('sudionik'))
            sudionici.push(body[key])
    }

    let users = await db.getUsers();

    let transport = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: 'sci.con.testni@gmail.com',
            pass: 'sci_con_testni',
        },
    });

    try {
        // slanje obavijesti
        sudionici.forEach(email => {

            const message = {
                from: 'sci.con.testni@gmail.com',
                to: email,
                subject: body.naslov,
                text: body.obavijest
            }
        
            transport.sendMail(message, function(err, info) {
                if (err) {
                    console.log(err)
                } else {
                    console.log(info)
                }
            })
    })
    
        res.redirect('/slanje-obavijesti?result=success')
        return
        
    } catch (err) {
        console.log(err)
        res.redirect('/slanje-obavijesti?result=failed')
        return
    
    }
})


module.exports = router;