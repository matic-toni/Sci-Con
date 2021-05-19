//uvoz modula
const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
const db = require('./queries')
const session = require('express-session');
const port = process.env.PORT || 1234

const app = express();



//uvoz routera
const prijavaRouter = require('./routes/prijava.routes');
const registracijaRouter = require('./routes/registracija.routes');
const uslugeRouters = require('./routes/usluge.routes');
const indexRouter = require('./routes/index.routes');
const aktivacijaRouter = require('./routes/aktivacija.routes');
const AdminRouter = require('./routes/administrator.routes');
const profilRouter = require('./routes/profil.routes');
const popisKonferencijaRouter = require('./routes/popisKonferencija.routes');
const ucitavanjeRadaRouter = require('./routes/ucitavanjeRada.routes');
const mojiRadoviRouter = require('./routes/mojiRadovi.routes');
const recenzijaRadaRouter = require('./routes/recenzijaRada.routes');
const prijaveZaRecenziranjeRouter = require('./routes/prijaveZaRecenziranje.routes');
const stvoriKonferencijuRouter = require('./routes/stvoriKonferenciju.routes');
const postavkeRouter = require('./routes/postavke.routes');
const obavijestiRouter = require('./routes/obavijesti.routes');
const urediKorPodatkeRouter = require('./routes/urediKorPodatke.routes');
const odjavaRouter = require('./routes/odjava.routes')

const novaLozinkaRouter = require('./routes/generirajLozinku.routes');
const brisanjeRacunaRouter = require('./routes/izbrisiRacun.routes');
const prihvatPrijaveZaRecenziranjeRouter = require('./routes/prihvatiRecenzenta.routes')
const odbijanjePrijaveZaRecenziranjeRouter = require('./routes/odbijRecenzenta.routes')
//const recenzirajRouter = require('./routes/recenziraj.routes')
const organizatorRadovi = require('./routes/organizatorRadovi.routes')

//views
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

//public directory, omogucuje da se file-ovi iz tog foldera salju klijentu
app.use(express.static(path.join(__dirname, 'public')));

//middleware za dekodiranje parametara iz url
app.use(express.urlencoded({ extended: true }))  


app.use(bodyParser.json()) // parsiranje HTTP body-a tipa json
app.use(bodyParser.urlencoded({extended: true,})) // parsiranje HTTP body-a tipa ime=vrijednost&ime2=vrijednost2


// midleware za upravljanje sjednicama pomocu express-session modula 
app.use(session({
    secret: 'strebam ovaj predmet ko da sam u srednjoj opet',
    resave: false,
    saveUninitialized: true,
    cookie: {maxAge: 24 * 60 * 60 * 1000}, // 1 dan
}));




// rute koje radi bez da je user ulogiran
app.use('/', indexRouter);
app.use('/prijava', prijavaRouter);
app.use('/registracija', registracijaRouter);
app.use('/aktivacija', aktivacijaRouter);
app.use('/usluge', uslugeRouters);
app.use('/generiraj-lozinku', novaLozinkaRouter);







//provjeri je li cookie kaze da je user ulogiran. Ako je idi dalje, ako ne redirektaj na prijavu

// =========!!!***VAZNO***!!!===========
// iznad ovoga stavi rute koje rade bez da je user log-inan, a ispod stavi samo rute koje trebaju
// raditi samo kad je user log-inan
app.use(async (req, res, next) => {
    if (!req.session.user) {
        res.redirect('/prijava')
        return
    }else {
        next()
    }
})

// rute koje rade samo kad je user ulogiran
// dohvati intranet nakon prijave
app.use('/profil', profilRouter);
app.use('/popis-konferencija', popisKonferencijaRouter);
app.use('/ucitavanje-rada', ucitavanjeRadaRouter);
app.use('/moji-radovi', mojiRadoviRouter);
app.use('/recenzija-rada', recenzijaRadaRouter);
app.use('/prijave-za-recenziranje', prijaveZaRecenziranjeRouter);
app.use('/slanje-obavijesti', obavijestiRouter);
app.use('/stvori-konferenciju', stvoriKonferencijuRouter);
app.use('/postavke', postavkeRouter);
app.use('/izbrisi-racun', brisanjeRacunaRouter);

app.use('/prihvati-recenzenta', prihvatPrijaveZaRecenziranjeRouter);
app.use('/odbij-recenzenta', odbijanjePrijaveZaRecenziranjeRouter)
app.use('/odjava', odjavaRouter)
//app.use('/recenziraj', recenzirajRouter)


app.use('/pregled-radova', organizatorRadovi)



//provjeri je li session user admin

// =========!!!***VAZNO***!!!===========
// iznad ovoga stavi rute koje rade bez da je user admin, a ispod stavi samo rute koje trebaju
// raditi samo kad je user admin
app.use(async (req, res, next) => {
    if (!req.session.user.administrator) {
        res.redirect('/')
        return
    }else {
        next()
    }
})

// admin only rute
app.use('/administrator', AdminRouter);
app.use('/statistika', AdminRouter);
app.use('/urediKorPodatke', urediKorPodatkeRouter);


app.listen(port, () => {
    console.log('Serving on port ', port)
})
