const express = require('express')
const router = express.Router();
const db = require('../queries');
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

router.get('/', async function(req, res, next) {

    let user = req.session.user
    let sekcijeOdOrganizatora = await db.getSectionsByOrganizerId(user.identifikacija)

    let sectionList = []

    for(s of sekcijeOdOrganizatora) {
        let section = {}
        let papers = await db.getPapersFromSection(s.id_sekcije, s.id_konferencije)

        section.konferencija = s.naziv
        section.sekcija = s.naziv_sekcije
        section.radovi = papers

        if (section.radovi.length == 0) {
            continue;
        }
        sectionList.push(section)
    }

    

    res.render('pregledRadova', {
        title: 'Pregled radova',
        user: user,
        sekcije: sectionList,
        err: null
    })
})

router.get('/:id', async (req, res, next) => {
    const id = req.params.id
    let buff = await buffParser.getRadBuff(id)

    res.send(buff)

    // res.redirect('/profil')
})


module.exports = router;