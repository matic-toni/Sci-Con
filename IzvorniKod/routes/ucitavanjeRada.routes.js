const express = require('express');
const router = express.Router();
const db = require('../queries')
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

    // svi parovi korisnik-sekcija u kojima je korisnik
    let sections = await db.getFromKorisnikSekcijaById(req.session.user.identifikacija)

    let conferences = await db.getConferences();

    let users = await db.getUsers();

    let notAdminUsers = []
    for (u of users) {
        if (u.administrator == 0)
            notAdminUsers.push(u)
    }

    for (s of sections) {
        let sudionici = await db.getUsersFromSection(s.id_sekcije, s.id_konferencije)
        s.sudionici = sudionici
    }

    res.render('ucitavanjeRada', {
        title: 'Učitavanje rada',
        user: req.session.user,
        err: null,
        conferences: conferences,
        sections: sections,
        users: notAdminUsers,
        message: undefined
    })
})

router.use(bodyParser.urlencoded({ extended: false }))
router.use(bodyParser.json())
router.use(fileUpload())

router.post('/', async (req, res, next) => {
    let sections = await db.getFromKorisnikSekcijaById(req.session.user.identifikacija)

    let conferences = await db.getConferences();

    let users = await db.getUsers();

    let notAdminUsers = []
    for (u of users) {
        if (u.administrator == 0)
            notAdminUsers.push(u)
    }
    const { name, data } = req.files.pic
    if (name && data) {

        await buffParser.addRadBuff(name, req.body.naslov, data);

        let autori = req.body.test
        console.log("body:")
        console.log(req.body)
        console.log("autori:")
        console.log(autori)
        console.log("name: " + name)
        if (typeof autori === "string") {
            await db.query(`INSERT INTO korisnik_rad VALUES (${autori},'${name}')`)
        }
        else {
            for (let autor of autori) {
                await db.query(`INSERT INTO korisnik_rad VALUES (${autor},'${name}')`)

            }
        }

        let arr = req.body.sekcija.split(' ')
        let s = arr[0]
        let k = arr[1]

        await db.query(`INSERT INTO recenzija VALUES (0,'${name}', ${k}, ${s}, '0', '/')`)
/*          ID_recenzenta INT NOT NULL,
            ID_rada TEXT NOT NULL,
            ID_konferencije INT NOT NULL,
            ID_sekcije INT NOT NULL,
            OCJENA VARCHAR NOT NULL,
            KOMENTAR TEXT NOT NULL,*/
        //await knex.insert({ id_sekcije: s, id_rada: name, id_konferencije: k }).into('rad_sekcija')
        await db.query(`INSERT INTO rad_sekcija VALUES (${s}, ${k} ,'${name}')`)
        /*  ID_sekcije INT NOT NULL,
            ID_konferencije INT NOT NULL,
            ID_rada TEXT NOT NULL,*/ 

        res.redirect('/ucitavanje-rada')
        return

    } else {
        res.render('ucitavanjeRada', {
            title: 'Učitavanje rada',
            user: req.session.user,
            err: "Pogreška pri učitavanju rada. Pokušajte ponovno",
            conferences: conferences,
            sections: sections,
            users: users,
            message: undefined
        })
    }
})

router.post('/izmjena/:id_rada', async (req, res, next) => {

    const { name, data } = req.files.pic
    let id_rada = req.params.id_rada
    if (name && data) {
        await buffParser.addRadBuff(name, req.body.naslov, data);
    }

    //await knex('recenzija').where('id_rada', '=', id_rada).update({ id_recenzenta: 0, komentar: '/', ocjena: 0 })
    let text = `UPDATE recenzija 
                SET id_recenzenta = 0,
                    komentar = '/',
                    ocjena = 0
                WHERE id_rada = ${id_rada}`
    await query(text);


    res.redirect('/moji-radovi')
    return

})

module.exports = router;