const express = require('express')
const router = express.Router();
const db = require('../queries')
const buffParser = require('../bufferParser')

const knex = require('knex')({
    client: 'pg',
    connection: {
        host: '127.0.0.1',
        user: 'postgres',
        password: 'grupa1',
        database: 'sci-con',
        port: 5432
    }
});

router.get('/', async (req, res, next) => {

    let user = req.session.user
    
    let sekcije = await db.getSectionsByReviewerId(user.identifikacija)

    let radovi = []
    for (s of sekcije) {
        let radovi_sekcije = await db.dohvatiRadoveZaSekciju(s.id_konferencije, s.id_sekcije)

        for (r of radovi_sekcije) {
            let rad = {}
            if(r.length == 0)
                continue
            let rr = await db.getRadById(r.id_rada)
            rad.naslov = rr.naslov
            let korisnikRad = await db.getKorisnikRad()
            let autori = []
            for (kr of korisnikRad) {
                if (rr.id_rada == kr.id_rada)
                    autori.push(kr.id_korisnika)
            }

            rad.autori = ""
            let prvi = true
            for (a of autori) {
                let autor = await db.getUserById(a)
                let imeprez = autor.ime + ' ' + autor.prezime
                if (prvi) {
                    rad.autori = rad.autori + imeprez
                    prvi = false
                    continue
                }
                rad.autori = rad.autori + ', ' + imeprez
            }

            rad.id = rr.id_rada
            radovi.push(rad)
        }
    }
    

    res.render('radoviZaRecenzirati', {
        title: 'Radovi',
        user: req.session.user,
        radovi: radovi,
        err: null,
    })
})


router.post('/', async (req, res, next) => {
    body = req.body
    user = req.session.user

    console.log(body)
    try {
        await db.spremiRecenziju(user.identifikacija, body.id, body.ocjena, body.komentar);
        res.redirect('/recenzija-rada')
    return
    }
    catch (ex) {
        console.log(ex)
    }
})

//////////////////////////////////////////////////////////////////////////////////////////
router.get('/:id', async (req, res, next) => {
    const id = req.params.id
    console.log(id)
    let buff = await buffParser.getRadBuff(id)

    res.send(buff)

    // res.redirect('/profil')
})



module.exports = router;