const express = require('express')
const router = express.Router();
const db = require('../queries');
const nodemailer = require('nodemailer')

router.get('/', async (req, res, next) => {

    let msg = undefined
    let konferencija = undefined

    try {
        result = req.query['chosen'];
        if (result) {
            konferencija = result
            msg = 'Prijava uspješno poslana.'
        }
    } catch (ex) {
        console.log(ex)
    }
    

    let conferences = await db.getConferences();
    let sections = await db.getConferencesAndSections();
    let user = req.session.user

    let korSekc = await db.getFromKorisnikSekcijaById(user.identifikacija)
    let recSekc = await db.getAllSectionsByReviewerId(user.identifikacija)
    

    let sekcije = []

    for (s of sections) {
        let provjera1 = true
        for (ks of korSekc) {
            if (s.id_konferencije == ks.id_konferencije && s.id_sekcije == ks.id_sekcije) {
                provjera1 = false
            }
        }

        let provjera2 = true
        for (rs of recSekc) {
            if (s.id_konferencije == rs.id_konferencije && s.id_sekcije == rs.id_sekcije) {
                provjera2 = false
            }
        }

        let provjera3 = true
        if (s.id_organizatora == user.identifikacija) {
            provjera3 = false
        }

        if (provjera1 && provjera2 && provjera3) {
            sekcije.push(s);
        }
    }




    for (c of conferences) {
        let organizator = await db.getUserById(c.id_organizatora)
        c.organizator = organizator.ime + ' ' + organizator.prezime;
        let datum = String(c.datum_održavanja).split(' ')
        let dan = datum[2]
        let mjesec = datum[1]
        let godina = datum[3]
        c.datum_održavanja = dan + '. ' + mjesec + ' ' + godina + '.'

        c.pitanja = await JSON.parse(c.pitanja);
    }

    

    res.render('popisKonferencija', {
        title: 'Popis konferencija',
        user: user,
        err: null,
        conferences: conferences,
        sections: sekcije, 
        message: msg,
        chosen: konferencija
    })

        
})


router.post('/', async (req, res, next) => {
    
    let sekcija = req.body.sekcija.split(' ')[0];
    let konferencija = req.body.sekcija.split(' ')[1];
    let korisnik = req.session.user.identifikacija;

    await db.insertIntoKorisnikSekcija(korisnik, sekcija, konferencija,  false)

    let conferences = await db.getConferences();
    let sections = await db.getConferencesAndSections();

    let currentSection = await db.getSectionById(sekcija, konferencija)
    let currentConference = await db.getConferenceById(konferencija)

    // ######################################################################################
    // ############################ slanje emaila ###########################################
    let transport = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: 'sci.con.testni@gmail.com',
            pass: 'sci_con_testni',
       },
    });
    
    let user = req.session.user
    var today = new Date();
    var date = today.getFullYear()+'-'+(today.getMonth()+1)+'-'+today.getDate();
    var time = today.getHours()+1 + ":" + today.getMinutes() + ":" + today.getSeconds();
    var dateTime = date+' '+time;

    let datum = String(currentConference[0].datum_održavanja).split(' ')
    let dan = datum[2]
    let mjesec = datum[1]
    let godina = datum[3]

    let dtm = dan + '. ' + mjesec + ' ' + godina + '.'
    let vrijeme = currentConference[0].vrijeme

    const message = {
        from: 'sci.con.testni@gmail.com',
        to: user.email,
        subject: 'Sci-Con: Potvrda prijave',
        html: `
            <h1>Poštovani ${user.ime},</h1>
            <h2>Uspješno ste prijavljeni na odabranu sekciju!</h2>
            <h3>Vaši podatci i odabrana konferencija navedeni su u nastavku:</h3>
            <h4><strong>Moji podatci:<strong></h4>
            <ul>
                <li>Ime: ${user.ime}</li>
                <li>Prezime: ${user.prezime}</li>
                <li>Institucija: ${user.institucija}</li>
                <li>Država: ${user.država}</li>
            </ul>
            <br></br>
            <h4><strong>Konferencija:<strong></h4>
            <ul>
                <li>Naziv: ${currentConference[0].naziv}</li>
                <li>Opis: ${currentConference[0].opis}</li>
                <li>Odabrana sekcija: ${currentSection[0].naziv}</li>
                <li>Datum održavanja: ${dtm}</li>
                <li>Vrijeme održavanja: ${vrijeme}</li>
            </ul>
            <br></br>

            <p>Vaš rad sada je moguće poslati na odabranu sekciju.</p>
            <p>Dostupno vrijeme za učitavanje rada: 1 sat. </p>
            <p>Rok predaje: ${dateTime} .</p>

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

/*
    res.render('popisKonferencija', {
        title: 'Popis konferencija',
        user: req.session.user,
        err: null,
        conferences: conferences,
        sections: sections,
        message: 'Prijava uspješno poslana.',
        chosen: konferencija
    })
*/
    res.redirect('/popis-konferencija?chosen=' + konferencija)
    return
});

module.exports = router;
