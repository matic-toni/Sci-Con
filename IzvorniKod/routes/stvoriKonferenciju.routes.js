const express = require('express')
const router = express.Router();
const db = require('../queries')

router.get('/', async (req, res, next) => {

    var msg;
    try {
        result = req.query['result'];
        if (result == 'conference-created')
            msg = 'Konferencija uspješno kreirana!'
    } catch (ex) {
        msg = null
    }

    user = req.session.user

    if (!(user.administrator)) {
        res.redirect('/profil')
        return
    }

    else {
        res.render('stvoriKonferenciju', {
            title: 'Stvori konferenciju',
            user: req.session.user,
            err: null,
            msg: msg
        })
    }
})

router.post('/', async (req, res, next) => {
    let body = req.body

    let organizator = await db.getUserByEmail(body.email_organizatora)

    let organizatorID = organizator.identifikacija
    let lastID = await db.getLastConferenceId();
    idKonf = lastID + 1

    //napravi pitanja
    let pitanja = {}
    for (var key of Object.keys(body)) {
        if (key.startsWith('question'))
            pitanja[key] = body[key]
    }

    //napravi konf
    try {
        await db.createConference(idKonf, body.datum_održavanja, body.vrijeme, body.naziv, organizatorID, body.opis, JSON.stringify(pitanja))
    } catch (ex) {
        console.log(ex)
    }
    console.log(pitanja)
    console.log(body)
    let sekcije = []

    //napravi sekcije
    for (var key of Object.keys(body)) {
        if (key.startsWith('sekcija'))
            sekcije.push(body[key])
    }

    try {
        for (sekcija of sekcije) {
            await db.createSection(sekcija, sekcije.indexOf(sekcija) + 1, idKonf)
        }
    } catch (ex) {
        console.log(ex)
    }

    

    //oznaci organizatora
    await db.changeOrganizatorAtribute(1, { id: organizatorID })

    res.redirect('/stvori-konferenciju?result=conference-created')
})

module.exports = router;

