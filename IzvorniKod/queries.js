

const Pool = require('pg').Pool;
const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: {
      rejectUnauthorized: false
    }
  });

//obican query
const query = (text, params) => {
    return pool.query(text, params)
        .then(res => {
            return res;
        });
}

// get all users
const getUsers = async () => {
    let text = 'SELECT * FROM korisnik ORDER BY identifikacija ASC'
    let data = await query(text);
    return data.rows
}

// vrati ne zauzet id
// pomocna funkcija ne exportat
const getFreeId = async () => {
    let id = null
    while (true) {
        id = Math.floor((Math.random() * 1000) + 1)
        if (isIdFree(id)) {
            return id;
        } else {
            continue;
        }
    }
}

// vrati je li zauzet id
// pomocna funkcija ne exportat
const isIdFree = async (id) => {
    let users = await getUsers()
    let result = true;
    users.every(user => {
        if (id === user.identifikacija) {
            result = false;
            return false; // break
        }
        return true; // continue
    });
    return result;
}

// napravi usera
const createUser = async (ime, prezime, institucija, država, grad, ulica, kbroj, email, password) => {
    let id = await getFreeId()
    let text = `INSERT INTO korisnik VALUES ('${ime}', '${prezime}', '${id}', '${institucija}', '${država}', '${grad}', '${ulica}', '${kbroj}', '${email}', '${password}', 0, 0, 0, 0)`;
    let data = await query(text);
    return id
}

// update user
// parametar je id i objekt ciji su kljucevi imena stupaca a vrijednosti nove vrijednosti na koje se stupci trebaju postaviti
const updateUser = async (id, user) => {
    let text = `UPDATE korisnik 
                SET ime = '${user?.ime}',
                    prezime = '${user?.prezime}',
                    institucija = '${user?.institucija}',
                    država = '${user?.država}',
                    grad = '${user?.grad}',
                    ulica = '${user?.ulica}',
                    kbroj = '${user?.kbroj}'
                WHERE identifikacija = ${id}`
    let data = await query(text);
    return id;
}

const updatePassword = async (id, lozinka) => {
    let text = `UPDATE korisnik SET lozinka = '${lozinka}' WHERE identifikacija = ${id}`
    let data = await query(text);
    return id;
}

// get user by ID 
const getUserById = async (id) => {
    let text = `SELECT * FROM korisnik WHERE identifikacija = ${id}`
    let data = await query(text);
    return data.rows[0];
}


// vrati usera za email
const getUserByEmail = async (email) => {
    let users = await getUsers();

    if (!users) {
        throw "Database error"
    }
    let user = null
    users.every((u) => {
        if (u.email === email) {
            user = u
            return false // break
        }
        return true // continue
    });

    return user;
}

// delete user
const deleteUser = async (id) => {
    let text = `DELETE FROM korisnik WHERE identifikacija = ${id}`
    await query(text);
    return true
}

// postavi potvrdjen_Email stupac na 1
const confirmEmail = async (email, password) => {
    let text = ""
    if (email && password) {
        const potvrda = 1
        text = `UPDATE korisnik SET potvrdjen_email = ${potvrda} WHERE email = '${email}' AND lozinka = '${password}'`
    } else {
        throw "falsy email or password"
    }
    let data = await query(text);
    console.log('confirmed email for ' + email)
    return true
}

// vrati true/false je li potvrđen_email stupac na 0 ili na 1
const checkMailConfirmation = async (email) => {
    let text = ""
    if (email) {
        text = `SELECT potvrdjen_Email from korisnik WHERE email = '${email}'`
    } else {
        return false
    }
    let data = await query(text);
    if (data.rows) {
        if (data.rows[0].potvrdjen_email) {
            return true;
        } else {
            return false;
        }
    }
    else {
        return false;
    }
}

// provjeri je li email postoji u bazi
const checkEmailExists = async (email) => {
    let user = await getUserByEmail(email);
    if (user === null) {
        return false;
    } else {
        return true;
    }
}



// rad s konferencijama i sekcijama
const getConferences = async () => {
    let text = 'SELECT * FROM konferencija ORDER BY naziv ASC'
    let data = await query(text);
    return data.rows
}



const getConferenceById = async (id) => {
    let text = `SELECT * FROM konferencija WHERE id_konferencije = ${id}`
    let data = await query(text)
    return data.rows
}

const getConferenceIdBySectionId = async (id) => {
    let data = await getConferencesAndSections();
    let result = -1
    data.forEach(cis => {
        if (cis.id_sekcije == id) {
            result = cis.id_konferencije
        }
    })

    return result;
}

const getConferenceAndSectionById = async (id) => {
    let data = await getConferencesAndSections();
    let result;
    data.forEach(d => {
        if (d.id_sekcije == id) {
            result = d
        }
    })

    return result
}

const getConferencesAndSections = async () => {
    let text = 'SELECT * FROM konferencija INNER JOIN sekcija ON konferencija.ID_konferencije=sekcija.ID_konferencije'
    let data = await query(text)
    return data.rows
}


const getSections = async () => {
    let text = 'SELECT * FROM sekcija'
    let data = await query(text)
    return data.rows
}

const getSectionById = async (ids, idk) => {
    let text = `SELECT * FROM sekcija WHERE sekcija.id_sekcije = ${ids} AND sekcija.id_konferencije=${idk}`
    let section = await query(text)
    return section.rows
}

const getLastConferenceId = async () => {
    let text = `SELECT ID_konferencije FROM konferencija ORDER BY ID_konferencije DESC limit 1`
    let id = await query(text)
    if (id.rows[0] == undefined) {
        return 0;
    } else {
        return id.rows[0].id_konferencije
    }

}


const createConference = async (id, datum_održavanja, vrijeme,naziv, organizatorID, opis, pitanja) => {
    let text = `INSERT INTO konferencija VALUES (${id}, '${datum_održavanja}', '${vrijeme}', '${naziv}', ${organizatorID}, '${opis}', '${pitanja}');`
    await query(text)
}

const createSection = async (naziv, idSekc, idKonf) => {
    let text = `INSERT INTO sekcija VALUES ('${naziv}', ${idSekc}, ${idKonf});`
    await query(text)
}

const insertIntoKorisnikSekcija = async (korisnik, sekcija, konferencija, potvrda) => {
    let text = `INSERT INTO korisnik_sekcija VALUES (${korisnik}, ${sekcija}, ${konferencija}, ${potvrda});`
    await query(text)
}

const getFromKorisnikSekcijaById = async (id) => {
    let text = `SELECT * FROM korisnik_sekcija 
                INNER JOIN sekcija ON 
                korisnik_sekcija.ID_sekcije=sekcija.ID_sekcije AND
                korisnik_sekcija.ID_konferencije=sekcija.ID_konferencije
                WHERE id_korisnika = ${id}`;
    let data = await query(text);
    return data.rows;
}

const getUsersFromSection = async(s, k) => {
    let text = `SELECT * FROM korisnik_sekcija
                INNER JOIN korisnik ON
                korisnik_sekcija.ID_korisnika = korisnik.identifikacija
                WHERE ID_sekcije = ${s} AND ID_konferencije = ${k};`
    let data = await query(text);
    return data.rows;
}

const getKorisnikRadById = async (id) => {
    let text = `select * from
	            korisnik inner join korisnik_rad
	            on korisnik.identifikacija = korisnik_rad.id_korisnika
			            inner join rad
                        on korisnik_rad.id_rada = rad.id_rada
                where korisnik.identifikacija = ${id}`
    let data = await query(text)
    return data.rows
}

const getKorisnikRad = async () => {
    let text = `select * from
	            korisnik inner join korisnik_rad
	            on korisnik.identifikacija = korisnik_rad.id_korisnika
			            inner join rad
                        on korisnik_rad.id_rada = rad.id_rada`
    let data = await query(text)
    return data.rows
}

const getRadovi = async () => {
    let text = `SELECT * FROM rad`
    let data = await query(text)
    return data.rows
}

const getRadById = async (id) => {
    let text = `SELECT * FROM rad WHERE ID_rada = '${id}';`
    let data = await query(text)
    return data.rows[0]
}

const getRadSekcijaKonferencija = async () => {
    // let text = `create view sekcija
    // as select
    //     s.naziv as naziv_sekcije,
    //     s.id_sekcije,
    //    s.id_konferencije
    // from sekcija s;`    // -------> potrebno izvesti samo 1. put

    let text = `select * from
                    rad inner join rad_sekcija
                        on rad.id_rada = rad_sekcija.id_rada
                        inner join sekcija2
                        on rad_sekcija.id_sekcije = sekcija2.id_sekcije and 
                        rad_sekcija.id_konferencije = sekcija2.id_konferencije
                        inner join konferencija
                        on sekcija2.id_konferencije = konferencija.id_konferencije
                        inner join korisnik
                        on konferencija.id_organizatora = korisnik.identifikacija`
    let data = await query(text)
    return data.rows
}

const getSectionsByReviewerId = async(id) => {
    let text = `SELECT * FROM recenzent_sekcija WHERE ID_recenzenta = ${id} AND pregledano = TRUE;`
    let data = await query(text)
    return data.rows
}

const getAllSectionsByReviewerId = async(id) => {
    let text = `SELECT * FROM recenzent_sekcija WHERE ID_recenzenta = ${id}`
    let data = await query(text)
    return data.rows
}

const prijavaZaRecenziranje = async(sudionikID, sekcijaID, konferencijaID, pregledano) => {
    let text = `INSERT INTO recenzent_sekcija VALUES(${sudionikID}, ${konferencijaID}, ${sekcijaID}, ${pregledano})`
    await query(text)
}

const getConferencesByOrganizerId = async(id) => {
    let text = `SELECT * FROM konferencija WHERE ID_organizatora = ${id};`
    let data = await query(text)
    return data.rows
}

const getSectionsByConferenceId = async(id) => {
    let text = `SELECT * FROM sekcija WHERE ID_konferencije = ${id};`
    let data = await query(text)
    return data.rows
}

const getSectionsByOrganizerId = async(id) => {
    let text = `SELECT * FROM konferencija
                INNER JOIN sekcija2
                ON konferencija.ID_konferencije = sekcija2.ID_konferencije
                WHERE ID_organizatora = ${id};`
    let data = await query(text)
    return data.rows
}

const getPapersFromSection = async(s, k) => {
    let text = `SELECT * FROM rad_sekcija
                INNER JOIN rad ON
                rad_sekcija.ID_rada = rad.ID_rada
                INNER JOIN sekcija ON
                rad_sekcija.id_sekcije = sekcija.id_sekcije AND
                rad_sekcija.id_konferencije = sekcija.id_konferencije
                WHERE sekcija.ID_sekcije = ${s} AND sekcija.ID_konferencije = ${k};`
    let data = await query(text);
    return data.rows;
}

const getApplications = async(idKonf, idSekc) => {
    let text = `SELECT * FROM recenzent_sekcija WHERE ID_konferencije = ${idKonf} and ID_sekcije = ${idSekc};`
    let data = await query(text)
    return data.rows
}

const setApplicationExamined = async(idKonf, idSekc, idKor) => {
    let text = `UPDATE recenzent_sekcija SET pregledano = TRUE 
                WHERE ID_konferencije = ${idKonf} AND ID_sekcije = ${idSekc} AND ID_recenzenta = ${idKor};`
    await query(text)
}

const deleteApplication = async(idKonf, idSekc, idKor) => {
    let text = `DELETE FROM recenzent_sekcija
                WHERE ID_konferencije = ${idKonf} AND ID_sekcije = ${idSekc} AND ID_recenzenta = ${idKor};`
    await query(text)
}

const spremiRecenziju = async(idRecenzent, idRad, ocjena, komentar) => {
    let text = `UPDATE recenzija SET ID_recenzenta = ${idRecenzent}, ocjena = '${ocjena}', komentar = '${komentar}'
                WHERE ID_rada = '${idRad}';`
    await query(text)
}

const getRewievById = async(id) => {
    let text = `SELECT * FROM recenzija
                WHERE ID_rada = '${id}';`
    let data = await query(text)
    return data.rows
}

        
const makeReviewer = async(id) => {
    let text = `UPDATE korisnik SET recenzent = 1 
                WHERE identifikacija = ${id};`
    await query(text)
}

//promijeni atribut organizatoror u poslanu vrijednost za poslani mail ili id
// usage: await db.changeOrganizatorAtribute(1,{id: organizatorID, email: orgEmail})
const changeOrganizatorAtribute = async (value, idOrEmail) => {
    let text = ""

    if (idOrEmail?.id) {
        text = `UPDATE korisnik 
                SET organizator = ${value}
                WHERE identifikacija = ${idOrEmail?.id}`
    } else if (idOrEmail?.email) {
        text = `UPDATE korisnik 
                SET organizator = ${value}
                WHERE email = ${idOrEmail?.email}`
    } else {
        throw "changeOrganizatorAtribute(): bad arguments passed\n usage: await db.changeOrganizatorAtribute(1,{id: organizatorID, email: orgEmail})"
    }

    let data = await query(text)
    return data.rows
}


const dohvatiRadoveZaSekciju = async (idKonf, idSekc) => {
    
    let text = `SELECT * FROM recenzija WHERE ID_konferencije = ${idKonf} AND ID_sekcije = ${idSekc} AND ID_RECENZENTA = 0;`

    let data = await query(text)
    return data.rows
}

module.exports = {
    confirmEmail,
    query,
    getUsers,
    getUserById,
    getUserByEmail,
    createUser,
    updateUser,
    deleteUser,
    checkMailConfirmation,
    checkEmailExists,
    getConferences,
    getConferencesAndSections,
    getSections,
    insertIntoKorisnikSekcija,
    getConferenceIdBySectionId,
    getConferenceAndSectionById,
    getSectionById,
    getFromKorisnikSekcijaById,
    getConferenceById,
    updatePassword,
    getKorisnikRadById,
    getRadovi,
    getRadById,
    getKorisnikRad,
    getRewievById,
    getRadSekcijaKonferencija,
    getLastConferenceId,
    createConference,
    createSection,
    prijavaZaRecenziranje,
    getConferencesByOrganizerId,
    getSectionsByOrganizerId,
    getSectionsByConferenceId,
    getApplications,
    deleteApplication,
    setApplicationExamined,
    makeReviewer,
    getAllSectionsByReviewerId,
    getSectionsByReviewerId,
    dohvatiRadoveZaSekciju,
    spremiRecenziju,
    changeOrganizatorAtribute,
    getUsersFromSection,
    getPapersFromSection
}