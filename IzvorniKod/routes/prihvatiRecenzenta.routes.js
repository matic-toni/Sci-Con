const express = require('express')
const router = express.Router();
const db = require('../queries');

router.post('/', async (req, res) => {
    //get HTTP request body
    let body = req.body;
    let user = req.session.user
    let provjera = false

    let konf = await db.getConferencesByOrganizerId(user.identifikacija)
    for (k of konf) {
        if (k.id_konferencije == body.konfID)
            provjera = true
    }
    try {
        if(!provjera) {
            // da ne bi netko mijenjao post zahtjeve (hidden elemente u formi)
            // kojima ne bi trebao imati pristup
            throw 'trenutni korisnik nije organizator ove konferencije'
        } else {
            await db.setApplicationExamined(body.konfID, body.sekcID, body.korID)
            await db.makeReviewer(body.korID)
        }
        console.log('uspješno prihvaćen zahtjev za recenziranje')
    } catch(err) {
        console.log('greška ', err)
    }
    res.redirect('/prijave-za-recenziranje?application=accepted')
    return
})

module.exports = router;
