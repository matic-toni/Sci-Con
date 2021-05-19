CREATE TABLE korisnik
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
  vrijeme TIME NOT NULL,
  naziv VARCHAR NOT NULL,
  ID_organizatora INT NOT NULL,
  opis VARCHAR NOT NULL,
  pitanja VARCHAR NOT NULL,
  PRIMARY KEY (ID_konferencije),
  FOREIGN KEY (ID_organizatora) REFERENCES korisnik(identifikacija) ON DELETE CASCADE
);

CREATE TABLE sekcija
(
  naziv VARCHAR NOT NULL,
  ID_sekcije INT NOT NULL,
  ID_konferencije INT NOT NULL,
  PRIMARY KEY (ID_sekcije, ID_konferencije),
  FOREIGN KEY (ID_konferencije) REFERENCES konferencija(ID_konferencije) ON DELETE CASCADE
);

CREATE TABLE korisnik_sekcija
(
  ID_korisnika INT NOT NULL,
  ID_sekcije INT NOT NULL,
  ID_konferencije INT NOT NULL,
  potvrda BOOLEAN NOT NULL,
  PRIMARY KEY (ID_korisnika, ID_sekcije, ID_konferencije),
  FOREIGN KEY (ID_korisnika) REFERENCES korisnik(identifikacija) ON DELETE CASCADE,
  FOREIGN KEY (ID_sekcije, ID_konferencije) REFERENCES sekcija(ID_sekcije, ID_konferencije) ON DELETE CASCADE,
  FOREIGN KEY (ID_konferencije) REFERENCES konferencija(ID_konferencije) ON DELETE CASCADE
);

CREATE TABLE rad
(
  ID_rada TEXT NOT NULL,
  naslov TEXT NOT NULL,
  sadržaj TEXT NOT NULL,
  PRIMARY KEY (ID_rada)
);

CREATE TABLE korisnik_rad
(
  ID_korisnika INT NOT NULL,
  ID_rada TEXT NOT NULL,
  PRIMARY KEY (ID_korisnika, ID_rada),
  FOREIGN KEY (ID_korisnika) REFERENCES korisnik(identifikacija) ON DELETE CASCADE,
  FOREIGN KEY (ID_rada) REFERENCES rad(ID_rada) ON DELETE CASCADE
);

CREATE TABLE rad_sekcija
(
  ID_sekcije INT NOT NULL,
  ID_konferencije INT NOT NULL,
  ID_rada TEXT NOT NULL,
  PRIMARY KEY (ID_sekcije, ID_konferencije, ID_rada),
  FOREIGN KEY (ID_rada) REFERENCES rad(ID_rada) ON DELETE CASCADE,
  FOREIGN KEY (ID_sekcije, ID_konferencije) REFERENCES sekcija(ID_sekcije, ID_konferencije) ON DELETE CASCADE,
  FOREIGN KEY (ID_konferencije) REFERENCES konferencija(ID_konferencije) ON DELETE CASCADE
);


CREATE TABLE recenzent_sekcija
(
  ID_recenzenta INT NOT NULL,
  ID_konferencije INT NOT NULL,
  ID_sekcije INT NOT NULL,
  pregledano BOOLEAN NOT NULL,
  PRIMARY KEY (ID_recenzenta, ID_konferencije, ID_sekcije),
  FOREIGN KEY (ID_recenzenta) REFERENCES korisnik(identifikacija) ON DELETE CASCADE,
  FOREIGN KEY (ID_konferencije) REFERENCES konferencija(ID_konferencije) ON DELETE CASCADE,
  FOREIGN KEY (ID_sekcije, ID_konferencije) REFERENCES sekcija(ID_sekcije, ID_konferencije) ON DELETE CASCADE
);

CREATE TABLE recenzija
(
  ID_recenzenta INT NOT NULL,
  ID_rada TEXT NOT NULL,
  ID_konferencije INT NOT NULL,
  ID_sekcije INT NOT NULL,
  OCJENA VARCHAR NOT NULL,
  KOMENTAR TEXT NOT NULL,
  PRIMARY KEY (ID_recenzenta, ID_rada),
  FOREIGN KEY (ID_rada) REFERENCES rad(ID_rada) ON DELETE CASCADE
);


insert into korisnik values 
('Adminko', 'Adminković', 1, 'FER', 'HR', 'zg', 'ulica', 'kbroj', 'admin@fer.hr', 'admin', 1, 0, 0, 1);


create view sekcija2
as select
s.naziv as naziv_sekcije,
s.id_sekcije,
s.id_konferencije
from sekcija s;
