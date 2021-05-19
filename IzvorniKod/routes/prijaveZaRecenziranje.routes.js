const express = require('express')
const router = express.Router();
const db = require('../queries');

router.get('/', async (req, res, next) => {
    let user = req.session.user
    recenzenti = []

    if (user.organizator == 0) {
        console.log('Korisnik nema ovlasti organizatora.')
        res.redirect('/prijava')
        return
    } else {

        var msg;
        try {
            result = req.query['application'];
            if (result == 'accepted') {
                msg = 'Prijava za recenziranje prihvaćena.'
            } else if (result == 'denied') {
                msg = "Prijava za recenziranje odbijena.";
            }
        } catch (ex) {
            msg = null
        }

        try {
            var konferencije = await db.getConferencesByOrganizerId(user.identifikacija)
            
            for (k of konferencije) {
                var sekcije = await db.getSectionsByConferenceId(k.id_konferencije);


                for(s of sekcije) {
                    var prijave = await db.getApplications(k.id_konferencije, s.id_sekcije)

                    for(p of prijave) {
                        if(p.pregledano == false) {
                            var sudionik = await db.getUserById(p.id_recenzenta)

                            recenzent = {}
                            recenzent.ime = sudionik.ime
                            recenzent.prezime = sudionik.prezime
                            recenzent.institucija = sudionik.institucija
                            recenzent.email = sudionik.email
                            recenzent.konferencija = k.naziv
                            recenzent.sekcija = s.naziv
                            recenzenti.push(recenzent)

                            //pomoćne vrijednosti za POST
                            recenzent.konfID = k.id_konferencije
                            recenzent.sekcID = s.id_sekcije
                            recenzent.korID = sudionik.identifikacija
                        } else {
                            continue
                        }
                    }
                }
            }
        } catch(ex) {
            console.log(ex)
        }

        res.render('prijaveZaRecenziranje', {
            title: 'Prijave za recenziranje',
            user: req.session.user,
            recenzenti: recenzenti,
            msg: msg,
            err: null,
        })
    }

    
})

router.post('/', async (req, res) => {
    //get HTTP request body
    let body = req.body;
    let user = req.session.user

    let arr = body.sekcija.split(' ')
    let sekcijaID = arr[0]
    let konferencijaID = arr[1]
    let sudionikID = user.identifikacija

    try {
        db.prijavaZaRecenziranje(sudionikID, konferencijaID, sekcijaID, false)
    }
    catch (err) {
        console.log(err)
    }

    res.redirect('/popis-konferencija')
    return


});

module.exports = router;