

(async () => {
  const db = require('./queries')
  let text = `CREATE TABLE korisnik
    (
      ime VARCHAR NOT NULL, 
      prezime VARCHAR NOT NULL,
      identifikacija INT NOT NULL,
      institucija VARCHAR NOT NULL,
      država VARCHAR NOT NULL,
      grad VARCHAR NOT NULL,
      ulica VARCHAR NOT NULL,
      kbroj VARCHAR NOT NULL,
      email VARCHAR NOT NULL,
      lozinka VARCHAR NOT NULL,
      potvrdjen_email INT NOT NULL,
      recenzent INT NOT NULL,
      organizator INT NOT NULL,
      administrator INT NOT NULL,
      PRIMARY KEY (identifikacija)
    );
    
    CREATE TABLE konferencija
    (
      ID_konferencije INT NOT NULL,
      datum_održavanja DATE NOT NULL,
      naziv VARCHAR NOT NULL,
      ID_organizatora INT NOT NULL,
      opis VARCHAR NOT NULL,
      PRIMARY KEY (ID_konferencije),
      FOREIGN KEY (ID_organizatora) REFERENCES korisnik(identifikacija)
    );
    
    CREATE TABLE sekcija
    (
      naziv VARCHAR NOT NULL,
      ID_sekcije INT NOT NULL,
      ID_konferencije INT NOT NULL,
      PRIMARY KEY (ID_sekcije, ID_konferencije),
      FOREIGN KEY (ID_konferencije) REFERENCES konferencija(ID_konferencije)
    );
    
    CREATE TABLE korisnik_sekcija
    (
      ID_korisnika INT NOT NULL,
      ID_sekcije INT NOT NULL,
      ID_konferencije INT NOT NULL,
      potvrda BOOLEAN NOT NULL
    );
    
    CREATE TABLE rad
    (
      ID_rada TEXT NOT NULL,
      naslov TEXT NOT NULL,
      sadržaj BYTEA NOT NULL
    );
    
    CREATE TABLE korisnik_rad
    (
      ID_korisnika INT NOT NULL,
      ID_rada TEXT NOT NULL
    );
    
    CREATE TABLE rad_sekcija
    (
      ID_sekcije INT NOT NULL,
      ID_rada TEXT NOT NULL
    );
    CREATE TABLE recenzent_sekcija
    (
      ID_recenzenta INT NOT NULL,
      ID_konferencije INT NOT NULL,
      ID_sekcije INT NOT NULL,
      pregledano BOOLEAN NOT NULL,
      PRIMARY KEY (ID_recenzenta, ID_konferencije, ID_sekcije),
      FOREIGN KEY (ID_recenzenta) REFERENCES korisnik(identifikacija),
      FOREIGN KEY (ID_konferencije) REFERENCES konferencija(ID_konferencije),
      FOREIGN KEY (ID_sekcije, ID_konferencije) REFERENCES sekcija(ID_sekcije, ID_konferencije)
    );
    
    insert into korisnik values 
    ('Adminko', 'Adminković', 1, 'FER', 'HR', 'zg', 'ulica', 'kbroj', 'admin@fer.hr', 'admin', 1, 0, 0, 1);
    
    insert into korisnik values 
    ('Organizatorko', 'Organizatorić', 2, 'FER', 'HR', 'zg', 'ulica', 'kbroj', 'organizator@fer.hr', 'organizator', 1, 0, 1, 0);
    
    insert into korisnik values 
    ('Recenzentko', 'Recenzentković', 3, 'FER', 'HR', 'zg', 'ulica', 'kbroj', 'recenzent@fer.hr', 'recenzent', 1, 1, 0, 0);
    
    insert into korisnik values 
    ('Korisnik', 'Korisniković', 4, 'FER', 'HR', 'zg', 'ulica', 'kbroj', 'korisnik@fer.hr', 'korisnik', 1, 0, 0, 0);
    
    
    
    
    `

  let data = await db.query(text);
})();