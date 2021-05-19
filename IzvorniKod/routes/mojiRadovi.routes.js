const express = require('express')
const router = express.Router();
const db = require('../queries');
const bodyParser = require('body-parser')
const fileUpload = require('express-fileupload')
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

    // treba mi: naziv rada
    //           autor(i)
    //           ime konferencije za koju je rad prijavljen
    //           ime sekcije na konferenciji

    // 1. spoji sve radove i korisnika po šifri korisnika i šifri rada i izdvoji radove trenutnog korisnika
    let trenutniKorisnikRad = null
    let korisnici = null
    let radovi = null
    let korisnikRad = null
    let radSekcijaKonferencija = null
    try {
        trenutniKorisnikRad = await db.getKorisnikRadById(req.session.user.identifikacija);
        korisnici = await db.getUsers();
        radovi = await db.getRadovi();
        korisnikRad = await db.getKorisnikRad();
        radSekcijaKonferencija = await db.getRadSekcijaKonferencija();

        for (tkr of trenutniKorisnikRad) {
            let recenzija = await db.getRewievById(tkr.id_rada)
            tkr.ocjena = recenzija[0].ocjena
            tkr.komentar = recenzija[0].komentar
        }

    }
    catch (err) {
        console.log("database error")
    }
    res.render('mojiRadovi', {
        title: 'Moji radovi',
        user: req.session.user,
        err: null,
        trenutniKorisnikRad: trenutniKorisnikRad,
        korisnikRad: korisnikRad,
        korisnici: korisnici,
        radovi: radovi,
        radSekcijaKonferencija: radSekcijaKonferencija
    })
})

// router.use(bodyParser.urlencoded({ extended: false }))
// router.use(bodyParser.json())
// router.use(fileUpload())

router.get('/:id', async (req, res, next) => {
    const id = req.params.id
    console.log(id)
    let buff = await buffParser.getRadBuff(id)

    res.send(buff)

    // res.redirect('/profil')
})

module.exports = router;
