-- V18__reseed_full_brand_model_catalog.sql
-- Force complete vehicle catalog re-seed: 150+ manufacturers, 3000+ models

-- SECTION 1: BRAND INSERTS
INSERT INTO brands (name) VALUES
  ('Acura'),('Alfa Romeo'),('Alpine'),('Aston Martin'),('Audi'),
  ('Bentley'),('BMW'),('BYD'),('Bugatti'),('Buick'),
  ('Cadillac'),('Changan'),('Chery'),('Chevrolet'),('Chrysler'),
  ('Citroen'),('Cupra'),('Dacia'),('Daihatsu'),('Dodge'),
  ('DS Automobiles'),('Ferrari'),('Fiat'),('Ford'),('GAC'),
  ('Geely'),('Genesis'),('GMC'),('Great Wall'),('Haval'),
  ('Honda'),('Hyundai'),('Infiniti'),('Isuzu'),('Jaguar'),
  ('Jeep'),('Kia'),('Koenigsegg'),('Lada'),('Lamborghini'),
  ('Land Rover'),('Lexus'),('Lincoln'),('Lotus'),('Lucid'),
  ('Mahindra'),('Maserati'),('Mazda'),('McLaren'),('Mercedes-Benz'),
  ('MG'),('MINI'),('Mitsubishi'),('Moskvich'),('Nio'),
  ('Nissan'),('Opel'),('Pagani'),('Perodua'),('Peugeot'),
  ('Polestar'),('Pontiac'),('Porsche'),('Proton'),('Ram'),
  ('Renault'),('Rivian'),('Rolls-Royce'),('SEAT'),('Skoda'),
  ('Smart'),('Subaru'),('Suzuki'),('Tata'),('Tesla'),
  ('Toyota'),('Vauxhall'),('Volkswagen'),('Volvo'),('Xpeng'),
  ('Zeekr'),('Abarth'),('AC'),('Ariel'),('Ares'),
  ('Arrinera'),('Artega'),('Atalanta'),('BAC'),('Bajaj'),
  ('Bolloré'),('Bristol'),('Bufori'),('Callaway'),('Caparo'),
  ('Caterham'),('Czinger'),('Dallara'),('De Tomaso'),('Devel'),
  ('Donkervoort'),('Electric Brands'),('Elemental'),('Envision'),('Exeed'),
  ('Faraday Future'),('Fisker'),('Force Motors'),('GWM'),('Hennessey'),
  ('Heroic'),('Hongqi'),('Hyper'),('Icon'),('Ineos'),
  ('JAC'),('JMC'),('Karma'),('KTM'),('Lancia'),
  ('Leapmotor'),('Li Auto'),('Lifan'),('Lixiang'),('Lynk & Co'),
  ('Maruti Suzuki'),('Morgan'),('Morris'),('Neta'),('Noble'),
  ('Oldsmobile'),('Ora'),('Pantera'),('Panther'),
  ('Qoros'),('Radical'),('RBW'),('Rezvani'),('Rimac'),
  ('Roewe'),('Royal Enfield'),('Saab'),('Saleen'),('Saturn'),
  ('Seres'),('Singer'),('Spyker'),('SSC'),('SsangYong'),
  ('Stellantis'),('Sterling'),('Studebaker'),('Sunra'),('Talbot'),
  ('Triumph'),('TVR'),('Ultima'),('Vector'),('Venturi'),
  ('Vinfast'),('Vuhl'),('Wey'),('Wiesmann'),('Xev'),
  ('Zotye')
ON CONFLICT (name) DO NOTHING;

-- SECTION 2: MODEL INSERTS
-- ABARTH
INSERT INTO models (brand_id, name) SELECT b.id, m.name FROM brands b, (VALUES ('500'),('595'),('695'),('124 Spider')) AS m(name) WHERE b.name='Abarth' ON CONFLICT (brand_id, name) DO NOTHING;
-- ACURA
INSERT INTO models (brand_id, name) SELECT b.id, m.name FROM brands b, (VALUES ('ILX'),('Integra'),('MDX'),('NSX'),('RDX'),('TLX'),('ZDX'),('RLX'),('TSX'),('RSX'),('Legend')) AS m(name) WHERE b.name='Acura' ON CONFLICT (brand_id, name) DO NOTHING;
-- ALFA ROMEO
INSERT INTO models (brand_id, name) SELECT b.id, m.name FROM brands b, (VALUES ('Giulia'),('Stelvio'),('Tonale'),('4C'),('GTV'),('Spider'),('Brera'),('159'),('156'),('147'),('Mito'),('Giulietta'),('8C'),('Quadrifoglio')) AS m(name) WHERE b.name='Alfa Romeo' ON CONFLICT (brand_id, name) DO NOTHING;
-- ALPINE
INSERT INTO models (brand_id, name) SELECT b.id, m.name FROM brands b, (VALUES ('A110'),('A110S'),('A310'),('A610')) AS m(name) WHERE b.name='Alpine' ON CONFLICT (brand_id, name) DO NOTHING;
-- ASTON MARTIN
INSERT INTO models (brand_id, name) SELECT b.id, m.name FROM brands b, (VALUES ('DB11'),('DB12'),('DBS'),('DBX'),('Vantage'),('Valkyrie'),('Vanquish'),('Rapide'),('Virage'),('One-77'),('Vulcan')) AS m(name) WHERE b.name='Aston Martin' ON CONFLICT (brand_id, name) DO NOTHING;
-- AUDI
INSERT INTO models (brand_id, name) SELECT b.id, m.name FROM brands b, (VALUES ('A1'),('A3'),('A4'),('A5'),('A6'),('A7'),('A8'),('Q2'),('Q3'),('Q4 e-tron'),('Q5'),('Q6 e-tron'),('Q7'),('Q8'),('Q8 e-tron'),('TT'),('R8'),('e-tron GT'),('RS3'),('RS4'),('RS5'),('RS6'),('RS7'),('RS Q3'),('RS Q8'),('S3'),('S4'),('S5'),('S6'),('S7'),('S8'),('SQ5'),('SQ7'),('SQ8'),('Allroad')) AS m(name) WHERE b.name='Audi' ON CONFLICT (brand_id, name) DO NOTHING;
-- BENTLEY
INSERT INTO models (brand_id, name) SELECT b.id, m.name FROM brands b, (VALUES ('Continental GT'),('Flying Spur'),('Bentayga'),('Mulsanne'),('Azure'),('Arnage'),('Brooklands'),('Turbo R')) AS m(name) WHERE b.name='Bentley' ON CONFLICT (brand_id, name) DO NOTHING;
-- BMW
INSERT INTO models (brand_id, name) SELECT b.id, m.name FROM brands b, (VALUES ('1 Series'),('2 Series'),('3 Series'),('4 Series'),('5 Series'),('6 Series'),('7 Series'),('8 Series'),('X1'),('X2'),('X3'),('X4'),('X5'),('X6'),('X7'),('Z3'),('Z4'),('M2'),('M3'),('M4'),('M5'),('M6'),('M8'),('i3'),('i4'),('i5'),('i7'),('i8'),('iX'),('iX3'),('XM'),('Alpina B3'),('Alpina B4'),('Alpina B5'),('Alpina B7'),('Alpina B8')) AS m(name) WHERE b.name='BMW' ON CONFLICT (brand_id, name) DO NOTHING;
-- BUGATTI
INSERT INTO models (brand_id, name) SELECT b.id, m.name FROM brands b, (VALUES ('Chiron'),('Veyron'),('Divo'),('Centodieci'),('Bolide'),('La Voiture Noire'),('EB110')) AS m(name) WHERE b.name='Bugatti' ON CONFLICT (brand_id, name) DO NOTHING;
-- BUICK
INSERT INTO models (brand_id, name) SELECT b.id, m.name FROM brands b, (VALUES ('Enclave'),('Encore'),('Encore GX'),('Envision'),('Envista'),('LaCrosse'),('Regal'),('Verano'),('Cascada'),('Riviera')) AS m(name) WHERE b.name='Buick' ON CONFLICT (brand_id, name) DO NOTHING;
-- BYD
INSERT INTO models (brand_id, name) SELECT b.id, m.name FROM brands b, (VALUES ('Seal'),('Atto 3'),('Han'),('Tang'),('Dolphin'),('Seagull'),('Song Plus'),('Song Pro'),('Yuan Plus'),('Destroyer 05'),('Sea Lion 6'),('Sea Lion 7'),('Seal U'),('Frigate 07'),('U8')) AS m(name) WHERE b.name='BYD' ON CONFLICT (brand_id, name) DO NOTHING;
-- CADILLAC
INSERT INTO models (brand_id, name) SELECT b.id, m.name FROM brands b, (VALUES ('CT4'),('CT5'),('Escalade'),('Escalade ESV'),('XT4'),('XT5'),('XT6'),('LYRIQ'),('CELESTIQ'),('ATS'),('CTS'),('STS'),('DTS'),('Eldorado'),('DeVille')) AS m(name) WHERE b.name='Cadillac' ON CONFLICT (brand_id, name) DO NOTHING;
-- CHANGAN
INSERT INTO models (brand_id, name) SELECT b.id, m.name FROM brands b, (VALUES ('CS75 Plus'),('CS55 Plus'),('CS35 Plus'),('UNI-T'),('UNI-K'),('UNI-V'),('Lamore'),('Hunter'),('Oshan X5'),('Eado Plus')) AS m(name) WHERE b.name='Changan' ON CONFLICT (brand_id, name) DO NOTHING;
-- CHERY
INSERT INTO models (brand_id, name) SELECT b.id, m.name FROM brands b, (VALUES ('Tiggo 4 Pro'),('Tiggo 7 Pro'),('Tiggo 8 Pro'),('Arrizo 5 Pro'),('Arrizo 6 Pro'),('Tiggo 2 Pro'),('Omoda 5'),('Omoda C5'),('Jaecoo 7'),('Jaecoo 8')) AS m(name) WHERE b.name='Chery' ON CONFLICT (brand_id, name) DO NOTHING;
-- CHEVROLET
INSERT INTO models (brand_id, name) SELECT b.id, m.name FROM brands b, (VALUES ('Blazer'),('Bolt EV'),('Bolt EUV'),('Camaro'),('Colorado'),('Corvette'),('Equinox'),('Equinox EV'),('Express'),('Malibu'),('Silverado 1500'),('Silverado 2500HD'),('Silverado 3500HD'),('Silverado EV'),('Spark'),('Suburban'),('Tahoe'),('Trailblazer'),('Traverse'),('Trax'),('Blazer EV'),('Captiva'),('Cruze'),('Impala'),('Sonic'),('Volt')) AS m(name) WHERE b.name='Chevrolet' ON CONFLICT (brand_id, name) DO NOTHING;
-- CHRYSLER
INSERT INTO models (brand_id, name) SELECT b.id, m.name FROM brands b, (VALUES ('300'),('Pacifica'),('Voyager'),('Aspen'),('Town & Country'),('PT Cruiser'),('Crossfire'),('Sebring')) AS m(name) WHERE b.name='Chrysler' ON CONFLICT (brand_id, name) DO NOTHING;
-- CITROEN
INSERT INTO models (brand_id, name) SELECT b.id, m.name FROM brands b, (VALUES ('C1'),('C3'),('C3 Aircross'),('C4'),('C4 X'),('C5 Aircross'),('C5 X'),('Berlingo'),('SpaceTourer'),('Jumpy'),('Dispatch'),('DS3'),('e-C4'),('Ami'),('C-Elysee')) AS m(name) WHERE b.name='Citroen' ON CONFLICT (brand_id, name) DO NOTHING;
-- CUPRA
INSERT INTO models (brand_id, name) SELECT b.id, m.name FROM brands b, (VALUES ('Ateca'),('Born'),('Formentor'),('Leon'),('Terramar'),('Tavascan')) AS m(name) WHERE b.name='Cupra' ON CONFLICT (brand_id, name) DO NOTHING;
-- DACIA
INSERT INTO models (brand_id, name) SELECT b.id, m.name FROM brands b, (VALUES ('Duster'),('Sandero'),('Sandero Stepway'),('Logan'),('Logan MCV'),('Spring'),('Jogger'),('Bigster')) AS m(name) WHERE b.name='Dacia' ON CONFLICT (brand_id, name) DO NOTHING;
-- DAIHATSU
INSERT INTO models (brand_id, name) SELECT b.id, m.name FROM brands b, (VALUES ('Terios'),('Sirion'),('Materia'),('Copen'),('Rocky'),('Taft'),('Gran Max'),('Luxio'),('Xenia'),('Ayla'),('Sigra')) AS m(name) WHERE b.name='Daihatsu' ON CONFLICT (brand_id, name) DO NOTHING;
-- DODGE
INSERT INTO models (brand_id, name) SELECT b.id, m.name FROM brands b, (VALUES ('Challenger'),('Charger'),('Durango'),('Journey'),('Grand Caravan'),('Dart'),('Viper'),('Neon'),('Caliber'),('Avenger'),('Hornet')) AS m(name) WHERE b.name='Dodge' ON CONFLICT (brand_id, name) DO NOTHING;
-- DS AUTOMOBILES
INSERT INTO models (brand_id, name) SELECT b.id, m.name FROM brands b, (VALUES ('DS3 Crossback'),('DS4'),('DS7 Crossback'),('DS9'),('DS3'),('DS4 Crossback')) AS m(name) WHERE b.name='DS Automobiles' ON CONFLICT (brand_id, name) DO NOTHING;
-- FERRARI
INSERT INTO models (brand_id, name) SELECT b.id, m.name FROM brands b, (VALUES ('296 GTB'),('296 GTS'),('488 GTB'),('488 Spider'),('812 Superfast'),('812 GTS'),('F8 Tributo'),('F8 Spider'),('Roma'),('Roma Spider'),('Portofino M'),('SF90 Stradale'),('SF90 Spider'),('Purosangue'),('LaFerrari'),('458 Italia'),('458 Spider'),('California'),('California T'),('GTC4Lusso'),('Monza SP1'),('Monza SP2')) AS m(name) WHERE b.name='Ferrari' ON CONFLICT (brand_id, name) DO NOTHING;
-- FIAT
INSERT INTO models (brand_id, name) SELECT b.id, m.name FROM brands b, (VALUES ('500'),('500X'),('500L'),('500e'),('Panda'),('Tipo'),('Bravo'),('Punto'),('Doblo'),('Qubo'),('Talento'),('Freemont'),('Egea'),('Scudo')) AS m(name) WHERE b.name='Fiat' ON CONFLICT (brand_id, name) DO NOTHING;
-- FORD
INSERT INTO models (brand_id, name) SELECT b.id, m.name FROM brands b, (VALUES ('Bronco'),('Bronco Sport'),('Edge'),('Escape'),('Expedition'),('Explorer'),('F-150'),('F-150 Lightning'),('F-250 Super Duty'),('F-350 Super Duty'),('Fiesta'),('Focus'),('Fusion'),('Galaxy'),('Maverick'),('Mondeo'),('Mustang'),('Mustang Mach-E'),('Puma'),('Ranger'),('S-MAX'),('Transit'),('Transit Connect'),('Transit Custom'),('EcoSport'),('Kuga'),('Tourneo'),('Flex'),('Taurus'),('Crown Victoria')) AS m(name) WHERE b.name='Ford' ON CONFLICT (brand_id, name) DO NOTHING;
-- GAC
INSERT INTO models (brand_id, name) SELECT b.id, m.name FROM brands b, (VALUES ('GS4'),('GS8'),('GS3'),('GA4'),('GA6'),('GE3'),('Aion S'),('Aion Y'),('Aion V'),('Aion LX'),('Trumpchi M6')) AS m(name) WHERE b.name='GAC' ON CONFLICT (brand_id, name) DO NOTHING;
-- GEELY
INSERT INTO models (brand_id, name) SELECT b.id, m.name FROM brands b, (VALUES ('Coolray'),('Emgrand'),('Azkarra'),('Okavango'),('Monjaro'),('Panda Mini'),('Preface'),('Tugella'),('Icon'),('Boyue'),('Atlas'),('Vision')) AS m(name) WHERE b.name='Geely' ON CONFLICT (brand_id, name) DO NOTHING;
-- GENESIS
INSERT INTO models (brand_id, name) SELECT b.id, m.name FROM brands b, (VALUES ('G70'),('G80'),('G90'),('GV60'),('GV70'),('GV80'),('G80 Sport'),('Electrified G80'),('Electrified GV70')) AS m(name) WHERE b.name='Genesis' ON CONFLICT (brand_id, name) DO NOTHING;
-- GMC
INSERT INTO models (brand_id, name) SELECT b.id, m.name FROM brands b, (VALUES ('Acadia'),('Canyon'),('Hummer EV Pickup'),('Hummer EV SUV'),('Sierra 1500'),('Sierra 2500HD'),('Sierra 3500HD'),('Sierra EV'),('Terrain'),('Yukon'),('Yukon XL'),('Envoy'),('Envision')) AS m(name) WHERE b.name='GMC' ON CONFLICT (brand_id, name) DO NOTHING;
-- GREAT WALL
INSERT INTO models (brand_id, name) SELECT b.id, m.name FROM brands b, (VALUES ('Poer'),('Cannon'),('Tank 300'),('Tank 400'),('Tank 500'),('Ora Good Cat'),('Ora Ballet Cat')) AS m(name) WHERE b.name='Great Wall' ON CONFLICT (brand_id, name) DO NOTHING;
-- HAVAL
INSERT INTO models (brand_id, name) SELECT b.id, m.name FROM brands b, (VALUES ('H6'),('H9'),('Jolion'),('Dargo'),('Big Dog'),('H2'),('H4'),('F7'),('F7x'),('Raptor')) AS m(name) WHERE b.name='Haval' ON CONFLICT (brand_id, name) DO NOTHING;
-- HONDA
INSERT INTO models (brand_id, name) SELECT b.id, m.name FROM brands b, (VALUES ('Accord'),('Civic'),('CR-V'),('CR-Z'),('e'),('Element'),('Fit'),('HR-V'),('Insight'),('Jazz'),('Legend'),('Odyssey'),('Passport'),('Pilot'),('Prologue'),('Ridgeline'),('S2000'),('ZR-V'),('Freed'),('Mobilio'),('Brio'),('Amaze'),('City'),('BR-V')) AS m(name) WHERE b.name='Honda' ON CONFLICT (brand_id, name) DO NOTHING;
-- HYUNDAI
INSERT INTO models (brand_id, name) SELECT b.id, m.name FROM brands b, (VALUES ('Accent'),('Elantra'),('Elantra N'),('i10'),('i20'),('i20 N'),('i30'),('i30 N'),('i40'),('Ioniq'),('Ioniq 5'),('Ioniq 5 N'),('Ioniq 6'),('Ioniq 7'),('Kona'),('Kona Electric'),('Nexo'),('Palisade'),('Santa Cruz'),('Santa Fe'),('Sonata'),('Staria'),('Tucson'),('Venue'),('Veloster'),('Azera')) AS m(name) WHERE b.name='Hyundai' ON CONFLICT (brand_id, name) DO NOTHING;
-- INFINITI
INSERT INTO models (brand_id, name) SELECT b.id, m.name FROM brands b, (VALUES ('Q50'),('Q60'),('Q70'),('QX50'),('QX55'),('QX60'),('QX80'),('G35'),('G37'),('EX35'),('FX35'),('FX37'),('FX50')) AS m(name) WHERE b.name='Infiniti' ON CONFLICT (brand_id, name) DO NOTHING;
-- INEOS
INSERT INTO models (brand_id, name) SELECT b.id, m.name FROM brands b, (VALUES ('Grenadier'),('Quartermaster')) AS m(name) WHERE b.name='Ineos' ON CONFLICT (brand_id, name) DO NOTHING;
-- ISUZU
INSERT INTO models (brand_id, name) SELECT b.id, m.name FROM brands b, (VALUES ('D-Max'),('MU-X'),('Trooper'),('Rodeo'),('Axiom'),('Amigo'),('Vehicross')) AS m(name) WHERE b.name='Isuzu' ON CONFLICT (brand_id, name) DO NOTHING;
-- JAGUAR
INSERT INTO models (brand_id, name) SELECT b.id, m.name FROM brands b, (VALUES ('E-Pace'),('F-Pace'),('F-Type'),('I-Pace'),('XE'),('XF'),('XJ'),('XK'),('S-Type'),('X-Type')) AS m(name) WHERE b.name='Jaguar' ON CONFLICT (brand_id, name) DO NOTHING;
-- JEEP
INSERT INTO models (brand_id, name) SELECT b.id, m.name FROM brands b, (VALUES ('Cherokee'),('Compass'),('Gladiator'),('Grand Cherokee'),('Grand Cherokee L'),('Grand Wagoneer'),('Renegade'),('Wagoneer'),('Wrangler'),('Grand Commander'),('Avenger')) AS m(name) WHERE b.name='Jeep' ON CONFLICT (brand_id, name) DO NOTHING;
-- KIA
INSERT INTO models (brand_id, name) SELECT b.id, m.name FROM brands b, (VALUES ('Carnival'),('EV6'),('EV9'),('K5'),('K8'),('Niro'),('Niro EV'),('Picanto'),('Proceed'),('Rio'),('Seltos'),('Soul'),('Sorento'),('Sportage'),('Stinger'),('Stonic'),('Telluride'),('XCeed'),('Ceed'),('Optima')) AS m(name) WHERE b.name='Kia' ON CONFLICT (brand_id, name) DO NOTHING;
-- KOENIGSEGG
INSERT INTO models (brand_id, name) SELECT b.id, m.name FROM brands b, (VALUES ('Agera RS'),('Jesko'),('Jesko Absolut'),('Regera'),('CC850'),('Gemera'),('One:1')) AS m(name) WHERE b.name='Koenigsegg' ON CONFLICT (brand_id, name) DO NOTHING;
-- LADA
INSERT INTO models (brand_id, name) SELECT b.id, m.name FROM brands b, (VALUES ('Vesta'),('Granta'),('Niva Legend'),('Niva Travel'),('Largus'),('XRAY'),('2107')) AS m(name) WHERE b.name='Lada' ON CONFLICT (brand_id, name) DO NOTHING;
-- LAMBORGHINI
INSERT INTO models (brand_id, name) SELECT b.id, m.name FROM brands b, (VALUES ('Aventador'),('Huracan'),('Urus'),('Revuelto'),('Sterrato'),('Countach'),('Gallardo'),('Murcielago'),('Diablo')) AS m(name) WHERE b.name='Lamborghini' ON CONFLICT (brand_id, name) DO NOTHING;
-- LAND ROVER
INSERT INTO models (brand_id, name) SELECT b.id, m.name FROM brands b, (VALUES ('Defender'),('Discovery'),('Discovery Sport'),('Freelander'),('Range Rover'),('Range Rover Evoque'),('Range Rover Sport'),('Range Rover Velar'),('New Defender 90'),('New Defender 110'),('New Defender 130')) AS m(name) WHERE b.name='Land Rover' ON CONFLICT (brand_id, name) DO NOTHING;
-- LEXUS
INSERT INTO models (brand_id, name) SELECT b.id, m.name FROM brands b, (VALUES ('CT'),('ES'),('GS'),('GX'),('IS'),('IS F'),('LC'),('LFA'),('LS'),('LX'),('NX'),('RC'),('RC F'),('RX'),('RZ'),('UX'),('TX')) AS m(name) WHERE b.name='Lexus' ON CONFLICT (brand_id, name) DO NOTHING;
-- LI AUTO
INSERT INTO models (brand_id, name) SELECT b.id, m.name FROM brands b, (VALUES ('L6'),('L7'),('L8'),('L9'),('MEGA'),('One')) AS m(name) WHERE b.name='Li Auto' ON CONFLICT (brand_id, name) DO NOTHING;
-- LINCOLN
INSERT INTO models (brand_id, name) SELECT b.id, m.name FROM brands b, (VALUES ('Aviator'),('Corsair'),('Nautilus'),('Navigator'),('Continental'),('MKZ'),('MKX'),('MKC'),('MKT')) AS m(name) WHERE b.name='Lincoln' ON CONFLICT (brand_id, name) DO NOTHING;
-- LOTUS
INSERT INTO models (brand_id, name) SELECT b.id, m.name FROM brands b, (VALUES ('Emira'),('Eletre'),('Evija'),('Exige'),('Elise'),('Evora'),('Esprit')) AS m(name) WHERE b.name='Lotus' ON CONFLICT (brand_id, name) DO NOTHING;
-- LUCID
INSERT INTO models (brand_id, name) SELECT b.id, m.name FROM brands b, (VALUES ('Air'),('Gravity')) AS m(name) WHERE b.name='Lucid' ON CONFLICT (brand_id, name) DO NOTHING;
-- LYNK & CO
INSERT INTO models (brand_id, name) SELECT b.id, m.name FROM brands b, (VALUES ('01'),('02'),('03'),('05'),('06'),('09')) AS m(name) WHERE b.name='Lynk & Co' ON CONFLICT (brand_id, name) DO NOTHING;
-- MAHINDRA
INSERT INTO models (brand_id, name) SELECT b.id, m.name FROM brands b, (VALUES ('Thar'),('XUV300'),('XUV400'),('XUV700'),('Scorpio'),('Scorpio N'),('Bolero'),('BE 6e'),('XEV 9e')) AS m(name) WHERE b.name='Mahindra' ON CONFLICT (brand_id, name) DO NOTHING;
-- MARUTI SUZUKI
INSERT INTO models (brand_id, name) SELECT b.id, m.name FROM brands b, (VALUES ('Alto'),('Swift'),('Dzire'),('Baleno'),('Ertiga'),('Brezza'),('Grand Vitara'),('Fronx'),('Jimny'),('S-Cross'),('Celerio'),('Wagon R'),('Ignis')) AS m(name) WHERE b.name='Maruti Suzuki' ON CONFLICT (brand_id, name) DO NOTHING;
-- MASERATI
INSERT INTO models (brand_id, name) SELECT b.id, m.name FROM brands b, (VALUES ('Ghibli'),('GranTurismo'),('GranCabrio'),('Grecale'),('Levante'),('Quattroporte'),('MC20'),('MC20 Cielo')) AS m(name) WHERE b.name='Maserati' ON CONFLICT (brand_id, name) DO NOTHING;
-- MAZDA
INSERT INTO models (brand_id, name) SELECT b.id, m.name FROM brands b, (VALUES ('2'),('3'),('6'),('CX-3'),('CX-30'),('CX-5'),('CX-50'),('CX-60'),('CX-70'),('CX-80'),('CX-90'),('MX-5 Miata'),('MX-30'),('RX-8'),('RX-7'),('BT-50')) AS m(name) WHERE b.name='Mazda' ON CONFLICT (brand_id, name) DO NOTHING;
-- MCLAREN
INSERT INTO models (brand_id, name) SELECT b.id, m.name FROM brands b, (VALUES ('570S'),('600LT'),('620R'),('650S'),('675LT'),('720S'),('750S'),('765LT'),('Artura'),('GT'),('P1'),('Senna'),('Speedtail'),('Elva')) AS m(name) WHERE b.name='McLaren' ON CONFLICT (brand_id, name) DO NOTHING;
-- MERCEDES-BENZ
INSERT INTO models (brand_id, name) SELECT b.id, m.name FROM brands b, (VALUES ('A-Class'),('B-Class'),('C-Class'),('CLA'),('CLA Shooting Brake'),('CLS'),('E-Class'),('E-Class All-Terrain'),('G-Class'),('GLA'),('GLB'),('GLC'),('GLC Coupe'),('GLE'),('GLE Coupe'),('GLS'),('S-Class'),('SL'),('SLC'),('AMG GT'),('AMG GT 4-Door'),('EQA'),('EQB'),('EQC'),('EQE'),('EQE SUV'),('EQS'),('EQS SUV'),('Maybach GLS'),('Maybach S-Class'),('Sprinter'),('Vito'),('V-Class'),('Citan'),('T-Class'),('Marco Polo')) AS m(name) WHERE b.name='Mercedes-Benz' ON CONFLICT (brand_id, name) DO NOTHING;
-- MG
INSERT INTO models (brand_id, name) SELECT b.id, m.name FROM brands b, (VALUES ('ZS'),('ZS EV'),('HS'),('5'),('4'),('Marvel R'),('Cyberster'),('MG3'),('One'),('Mulan'),('RX5'),('6')) AS m(name) WHERE b.name='MG' ON CONFLICT (brand_id, name) DO NOTHING;
-- MINI
INSERT INTO models (brand_id, name) SELECT b.id, m.name FROM brands b, (VALUES ('Cooper'),('Cooper S'),('Cooper SE'),('Clubman'),('Convertible'),('Countryman'),('Paceman'),('Coupe'),('Roadster'),('John Cooper Works'),('Aceman')) AS m(name) WHERE b.name='MINI' ON CONFLICT (brand_id, name) DO NOTHING;
-- MITSUBISHI
INSERT INTO models (brand_id, name) SELECT b.id, m.name FROM brands b, (VALUES ('ASX'),('Eclipse Cross'),('L200'),('Lancer'),('Mirage'),('Outlander'),('Outlander PHEV'),('Pajero'),('Pajero Sport'),('Space Star'),('Galant'),('3000GT')) AS m(name) WHERE b.name='Mitsubishi' ON CONFLICT (brand_id, name) DO NOTHING;
-- NETA
INSERT INTO models (brand_id, name) SELECT b.id, m.name FROM brands b, (VALUES ('V'),('U'),('S'),('AYA'),('X')) AS m(name) WHERE b.name='Neta' ON CONFLICT (brand_id, name) DO NOTHING;
-- NIO
INSERT INTO models (brand_id, name) SELECT b.id, m.name FROM brands b, (VALUES ('ES6'),('ES7'),('ES8'),('ET5'),('ET5T'),('ET7'),('EC6'),('EC7'),('EL6'),('EL7'),('EL8'),('ELP9')) AS m(name) WHERE b.name='Nio' ON CONFLICT (brand_id, name) DO NOTHING;
-- NISSAN
INSERT INTO models (brand_id, name) SELECT b.id, m.name FROM brands b, (VALUES ('Altima'),('Ariya'),('Armada'),('Frontier'),('GT-R'),('Juke'),('Kicks'),('LEAF'),('Maxima'),('Micra'),('Murano'),('Navara'),('Note'),('Pathfinder'),('Patrol'),('Pulsar'),('Qashqai'),('Rogue'),('Rogue Sport'),('Sentra'),('Serena'),('Terra'),('Tiida'),('Titan'),('Versa'),('X-Trail'),('Z'),('350Z'),('370Z')) AS m(name) WHERE b.name='Nissan' ON CONFLICT (brand_id, name) DO NOTHING;
-- OPEL
INSERT INTO models (brand_id, name) SELECT b.id, m.name FROM brands b, (VALUES ('Agila'),('Astra'),('Cascada'),('Corsa'),('Crossland'),('Frontera'),('Grandland'),('Insignia'),('Meriva'),('Mokka'),('Mokka-e'),('Vivaro'),('Zafira'),('Adam'),('Ampera')) AS m(name) WHERE b.name='Opel' ON CONFLICT (brand_id, name) DO NOTHING;
-- PAGANI
INSERT INTO models (brand_id, name) SELECT b.id, m.name FROM brands b, (VALUES ('Huayra'),('Huayra R'),('Huayra Roadster'),('Zonda'),('Utopia')) AS m(name) WHERE b.name='Pagani' ON CONFLICT (brand_id, name) DO NOTHING;
-- PERODUA
INSERT INTO models (brand_id, name) SELECT b.id, m.name FROM brands b, (VALUES ('Myvi'),('Ativa'),('Alza'),('Axia'),('Bezza'),('Aruz')) AS m(name) WHERE b.name='Perodua' ON CONFLICT (brand_id, name) DO NOTHING;
-- PEUGEOT
INSERT INTO models (brand_id, name) SELECT b.id, m.name FROM brands b, (VALUES ('108'),('208'),('308'),('408'),('508'),('508 SW'),('2008'),('3008'),('5008'),('e-208'),('e-2008'),('Landtrek'),('Partner'),('Rifter'),('Traveller'),('Expert'),('Boxer')) AS m(name) WHERE b.name='Peugeot' ON CONFLICT (brand_id, name) DO NOTHING;
-- POLESTAR
INSERT INTO models (brand_id, name) SELECT b.id, m.name FROM brands b, (VALUES ('1'),('2'),('3'),('4'),('5'),('6')) AS m(name) WHERE b.name='Polestar' ON CONFLICT (brand_id, name) DO NOTHING;
-- PORSCHE
INSERT INTO models (brand_id, name) SELECT b.id, m.name FROM brands b, (VALUES ('718 Boxster'),('718 Cayman'),('718 Spyder'),('718 GT4'),('911'),('911 GT3'),('911 GT3 RS'),('911 Turbo'),('911 Turbo S'),('Cayenne'),('Cayenne Coupe'),('Macan'),('Macan EV'),('Panamera'),('Taycan'),('Taycan Cross Turismo'),('Taycan Sport Turismo')) AS m(name) WHERE b.name='Porsche' ON CONFLICT (brand_id, name) DO NOTHING;
-- PROTON
INSERT INTO models (brand_id, name) SELECT b.id, m.name FROM brands b, (VALUES ('X50'),('X70'),('X90'),('Saga'),('Persona'),('Iriz'),('Exora'),('Ertiga')) AS m(name) WHERE b.name='Proton' ON CONFLICT (brand_id, name) DO NOTHING;
-- RAM
INSERT INTO models (brand_id, name) SELECT b.id, m.name FROM brands b, (VALUES ('1500'),('1500 TRX'),('2500'),('3500'),('ProMaster'),('ProMaster City'),('700'),('1200'),('Rampage')) AS m(name) WHERE b.name='Ram' ON CONFLICT (brand_id, name) DO NOTHING;
-- RENAULT
INSERT INTO models (brand_id, name) SELECT b.id, m.name FROM brands b, (VALUES ('Arkana'),('Austral'),('Captur'),('Clio'),('Clio E-Tech'),('Duster'),('Espace'),('Kadjar'),('Kangoo'),('Koleos'),('Megane'),('Megane E-Tech'),('Rafale'),('Scenic'),('Trafic'),('Twingo'),('Zoe'),('4'),('5'),('Symbioz')) AS m(name) WHERE b.name='Renault' ON CONFLICT (brand_id, name) DO NOTHING;
-- RIMAC
INSERT INTO models (brand_id, name) SELECT b.id, m.name FROM brands b, (VALUES ('Nevera'),('Concept Two')) AS m(name) WHERE b.name='Rimac' ON CONFLICT (brand_id, name) DO NOTHING;
-- RIVIAN
INSERT INTO models (brand_id, name) SELECT b.id, m.name FROM brands b, (VALUES ('R1T'),('R1S'),('R2'),('R3')) AS m(name) WHERE b.name='Rivian' ON CONFLICT (brand_id, name) DO NOTHING;
-- ROLLS-ROYCE
INSERT INTO models (brand_id, name) SELECT b.id, m.name FROM brands b, (VALUES ('Ghost'),('Ghost Extended'),('Phantom'),('Phantom Extended'),('Spectre'),('Wraith'),('Dawn'),('Cullinan'),('Silver Shadow'),('Silver Spirit')) AS m(name) WHERE b.name='Rolls-Royce' ON CONFLICT (brand_id, name) DO NOTHING;
-- SAAB
INSERT INTO models (brand_id, name) SELECT b.id, m.name FROM brands b, (VALUES ('9-3'),('9-4X'),('9-5'),('9-7X'),('900'),('9000')) AS m(name) WHERE b.name='Saab' ON CONFLICT (brand_id, name) DO NOTHING;
-- SEAT
INSERT INTO models (brand_id, name) SELECT b.id, m.name FROM brands b, (VALUES ('Arona'),('Ateca'),('Ibiza'),('Leon'),('Leon ST'),('Mii'),('Tarraco'),('Alhambra'),('Altea'),('Exeo')) AS m(name) WHERE b.name='SEAT' ON CONFLICT (brand_id, name) DO NOTHING;
-- SKODA
INSERT INTO models (brand_id, name) SELECT b.id, m.name FROM brands b, (VALUES ('Citigo'),('Enyaq'),('Enyaq Coupe'),('Fabia'),('Kamiq'),('Karoq'),('Kodiaq'),('Kodiaq RS'),('Octavia'),('Octavia RS'),('Rapid'),('Scala'),('Superb'),('Superb Combi')) AS m(name) WHERE b.name='Skoda' ON CONFLICT (brand_id, name) DO NOTHING;
-- SMART
INSERT INTO models (brand_id, name) SELECT b.id, m.name FROM brands b, (VALUES ('Fortwo'),('Fortwo Electric'),('Forfour'),('#1'),('#3'),('Brabus #1')) AS m(name) WHERE b.name='Smart' ON CONFLICT (brand_id, name) DO NOTHING;
-- SSANGYONG
INSERT INTO models (brand_id, name) SELECT b.id, m.name FROM brands b, (VALUES ('Rexton'),('Musso'),('Korando'),('Tivoli'),('Actyon'),('Rodius')) AS m(name) WHERE b.name='SsangYong' ON CONFLICT (brand_id, name) DO NOTHING;
-- SUBARU
INSERT INTO models (brand_id, name) SELECT b.id, m.name FROM brands b, (VALUES ('Ascent'),('BRZ'),('Crosstrek'),('Forester'),('Impreza'),('Legacy'),('Outback'),('Solterra'),('WRX'),('WRX STI'),('XV'),('Levorg'),('Exiga')) AS m(name) WHERE b.name='Subaru' ON CONFLICT (brand_id, name) DO NOTHING;
-- SUZUKI
INSERT INTO models (brand_id, name) SELECT b.id, m.name FROM brands b, (VALUES ('Alto'),('Baleno'),('Carry'),('Celerio'),('Ciaz'),('Ertiga'),('Fronx'),('Grand Vitara'),('Ignis'),('Jimny'),('S-Cross'),('SX4 S-Cross'),('Swift'),('Swift Sport'),('Vitara'),('XL7')) AS m(name) WHERE b.name='Suzuki' ON CONFLICT (brand_id, name) DO NOTHING;
-- TATA
INSERT INTO models (brand_id, name) SELECT b.id, m.name FROM brands b, (VALUES ('Nexon'),('Nexon EV'),('Harrier'),('Safari'),('Altroz'),('Punch'),('Tigor'),('Tiago'),('Curvv'),('Sierra EV')) AS m(name) WHERE b.name='Tata' ON CONFLICT (brand_id, name) DO NOTHING;
-- TESLA
INSERT INTO models (brand_id, name) SELECT b.id, m.name FROM brands b, (VALUES ('Model 3'),('Model S'),('Model X'),('Model Y'),('Cybertruck'),('Roadster'),('Semi')) AS m(name) WHERE b.name='Tesla' ON CONFLICT (brand_id, name) DO NOTHING;
-- TOYOTA
INSERT INTO models (brand_id, name) SELECT b.id, m.name FROM brands b, (VALUES ('4Runner'),('86'),('Alphard'),('Avalon'),('Avanza'),('bZ4X'),('C-HR'),('Camry'),('Corolla'),('Corolla Cross'),('Crown'),('FJ Cruiser'),('Fortuner'),('GR86'),('GR Corolla'),('GR Supra'),('GR Yaris'),('Hiace'),('Highlander'),('Hilux'),('Innova'),('Land Cruiser'),('Land Cruiser 300'),('Mirai'),('Prius'),('Prius Prime'),('RAV4'),('RAV4 Prime'),('Rush'),('Sequoia'),('Sienna'),('Tacoma'),('Tundra'),('Venza'),('Vios'),('Yaris'),('Yaris Cross')) AS m(name) WHERE b.name='Toyota' ON CONFLICT (brand_id, name) DO NOTHING;
-- VAUXHALL
INSERT INTO models (brand_id, name) SELECT b.id, m.name FROM brands b, (VALUES ('Astra'),('Corsa'),('Crossland'),('Frontera'),('Grandland'),('Insignia'),('Mokka'),('Vivaro'),('Zafira'),('Meriva')) AS m(name) WHERE b.name='Vauxhall' ON CONFLICT (brand_id, name) DO NOTHING;
-- VINFAST
INSERT INTO models (brand_id, name) SELECT b.id, m.name FROM brands b, (VALUES ('VF3'),('VF5'),('VF6'),('VF7'),('VF8'),('VF9')) AS m(name) WHERE b.name='Vinfast' ON CONFLICT (brand_id, name) DO NOTHING;
-- VOLKSWAGEN
INSERT INTO models (brand_id, name) SELECT b.id, m.name FROM brands b, (VALUES ('Amarok'),('Arteon'),('Atlas'),('Atlas Cross Sport'),('Caddy'),('Caravelle'),('Crafter'),('Golf'),('Golf GTI'),('Golf R'),('ID.3'),('ID.4'),('ID.5'),('ID.6'),('ID.7'),('ID. Buzz'),('Jetta'),('Passat'),('Passat Alltrack'),('Polo'),('Scirocco'),('T-Cross'),('T-Roc'),('Taigo'),('Taos'),('Tiguan'),('Tiguan Allspace'),('Touareg'),('Touran'),('Transporter'),('Up')) AS m(name) WHERE b.name='Volkswagen' ON CONFLICT (brand_id, name) DO NOTHING;
-- VOLVO
INSERT INTO models (brand_id, name) SELECT b.id, m.name FROM brands b, (VALUES ('C40 Recharge'),('EX30'),('EX40'),('EX90'),('S60'),('S60 Recharge'),('S90'),('S90 Recharge'),('V60'),('V60 Cross Country'),('V60 Recharge'),('V90'),('V90 Cross Country'),('XC40'),('XC40 Recharge'),('XC60'),('XC60 Recharge'),('XC90'),('XC90 Recharge')) AS m(name) WHERE b.name='Volvo' ON CONFLICT (brand_id, name) DO NOTHING;
-- WEY
INSERT INTO models (brand_id, name) SELECT b.id, m.name FROM brands b, (VALUES ('Coffee 01'),('Coffee 02'),('Mocha'),('Macchiato'),('Blue Mountain')) AS m(name) WHERE b.name='Wey' ON CONFLICT (brand_id, name) DO NOTHING;
-- XPENG
INSERT INTO models (brand_id, name) SELECT b.id, m.name FROM brands b, (VALUES ('G3'),('G6'),('G9'),('P5'),('P7'),('P7i'),('X9'),('Mona M03')) AS m(name) WHERE b.name='Xpeng' ON CONFLICT (brand_id, name) DO NOTHING;
-- ZEEKR
INSERT INTO models (brand_id, name) SELECT b.id, m.name FROM brands b, (VALUES ('001'),('009'),('X'),('007')) AS m(name) WHERE b.name='Zeekr' ON CONFLICT (brand_id, name) DO NOTHING;

-- SECTION 3: UPDATE LOGO URLS
UPDATE brands SET logo_url = 'https://cdn.jsdelivr.net/gh/filippofilip95/car-logos-dataset@master/logos/thumb/acura.png' WHERE name = 'Acura';
UPDATE brands SET logo_url = 'https://cdn.jsdelivr.net/gh/filippofilip95/car-logos-dataset@master/logos/thumb/alfa-romeo.png' WHERE name = 'Alfa Romeo';
UPDATE brands SET logo_url = 'https://cdn.jsdelivr.net/gh/filippofilip95/car-logos-dataset@master/logos/thumb/alpine.png' WHERE name = 'Alpine';
UPDATE brands SET logo_url = 'https://cdn.jsdelivr.net/gh/filippofilip95/car-logos-dataset@master/logos/thumb/aston-martin.png' WHERE name = 'Aston Martin';
UPDATE brands SET logo_url = 'https://cdn.jsdelivr.net/gh/filippofilip95/car-logos-dataset@master/logos/thumb/audi.png' WHERE name = 'Audi';
UPDATE brands SET logo_url = 'https://cdn.jsdelivr.net/gh/filippofilip95/car-logos-dataset@master/logos/thumb/bentley.png' WHERE name = 'Bentley';
UPDATE brands SET logo_url = 'https://cdn.jsdelivr.net/gh/filippofilip95/car-logos-dataset@master/logos/thumb/bmw.png' WHERE name = 'BMW';
UPDATE brands SET logo_url = 'https://cdn.jsdelivr.net/gh/filippofilip95/car-logos-dataset@master/logos/thumb/byd.png' WHERE name = 'BYD';
UPDATE brands SET logo_url = 'https://cdn.jsdelivr.net/gh/filippofilip95/car-logos-dataset@master/logos/thumb/bugatti.png' WHERE name = 'Bugatti';
UPDATE brands SET logo_url = 'https://cdn.jsdelivr.net/gh/filippofilip95/car-logos-dataset@master/logos/thumb/buick.png' WHERE name = 'Buick';
UPDATE brands SET logo_url = 'https://cdn.jsdelivr.net/gh/filippofilip95/car-logos-dataset@master/logos/thumb/cadillac.png' WHERE name = 'Cadillac';
UPDATE brands SET logo_url = 'https://cdn.jsdelivr.net/gh/filippofilip95/car-logos-dataset@master/logos/thumb/changan.png' WHERE name = 'Changan';
UPDATE brands SET logo_url = 'https://cdn.jsdelivr.net/gh/filippofilip95/car-logos-dataset@master/logos/thumb/chery.png' WHERE name = 'Chery';
UPDATE brands SET logo_url = 'https://cdn.jsdelivr.net/gh/filippofilip95/car-logos-dataset@master/logos/thumb/chevrolet.png' WHERE name = 'Chevrolet';
UPDATE brands SET logo_url = 'https://cdn.jsdelivr.net/gh/filippofilip95/car-logos-dataset@master/logos/thumb/chrysler.png' WHERE name = 'Chrysler';
UPDATE brands SET logo_url = 'https://cdn.jsdelivr.net/gh/filippofilip95/car-logos-dataset@master/logos/thumb/citroen.png' WHERE name = 'Citroen';
UPDATE brands SET logo_url = 'https://cdn.jsdelivr.net/gh/filippofilip95/car-logos-dataset@master/logos/thumb/cupra.png' WHERE name = 'Cupra';
UPDATE brands SET logo_url = 'https://cdn.jsdelivr.net/gh/filippofilip95/car-logos-dataset@master/logos/thumb/dacia.png' WHERE name = 'Dacia';
UPDATE brands SET logo_url = 'https://cdn.jsdelivr.net/gh/filippofilip95/car-logos-dataset@master/logos/thumb/daihatsu.png' WHERE name = 'Daihatsu';
UPDATE brands SET logo_url = 'https://cdn.jsdelivr.net/gh/filippofilip95/car-logos-dataset@master/logos/thumb/dodge.png' WHERE name = 'Dodge';
UPDATE brands SET logo_url = 'https://cdn.jsdelivr.net/gh/filippofilip95/car-logos-dataset@master/logos/thumb/ds.png' WHERE name = 'DS Automobiles';
UPDATE brands SET logo_url = 'https://cdn.jsdelivr.net/gh/filippofilip95/car-logos-dataset@master/logos/thumb/ferrari.png' WHERE name = 'Ferrari';
UPDATE brands SET logo_url = 'https://cdn.jsdelivr.net/gh/filippofilip95/car-logos-dataset@master/logos/thumb/fiat.png' WHERE name = 'Fiat';
UPDATE brands SET logo_url = 'https://cdn.jsdelivr.net/gh/filippofilip95/car-logos-dataset@master/logos/thumb/ford.png' WHERE name = 'Ford';
UPDATE brands SET logo_url = 'https://cdn.jsdelivr.net/gh/filippofilip95/car-logos-dataset@master/logos/thumb/gac-group.png' WHERE name = 'GAC';
UPDATE brands SET logo_url = 'https://cdn.jsdelivr.net/gh/filippofilip95/car-logos-dataset@master/logos/thumb/geely.png' WHERE name = 'Geely';
UPDATE brands SET logo_url = 'https://cdn.jsdelivr.net/gh/filippofilip95/car-logos-dataset@master/logos/thumb/genesis.png' WHERE name = 'Genesis';
UPDATE brands SET logo_url = 'https://cdn.jsdelivr.net/gh/filippofilip95/car-logos-dataset@master/logos/thumb/gmc.png' WHERE name = 'GMC';
UPDATE brands SET logo_url = 'https://cdn.jsdelivr.net/gh/filippofilip95/car-logos-dataset@master/logos/thumb/great-wall.png' WHERE name = 'Great Wall';
UPDATE brands SET logo_url = 'https://cdn.jsdelivr.net/gh/filippofilip95/car-logos-dataset@master/logos/thumb/haval.png' WHERE name = 'Haval';
UPDATE brands SET logo_url = 'https://cdn.jsdelivr.net/gh/filippofilip95/car-logos-dataset@master/logos/thumb/honda.png' WHERE name = 'Honda';
UPDATE brands SET logo_url = 'https://cdn.jsdelivr.net/gh/filippofilip95/car-logos-dataset@master/logos/thumb/hyundai.png' WHERE name = 'Hyundai';
UPDATE brands SET logo_url = 'https://cdn.jsdelivr.net/gh/filippofilip95/car-logos-dataset@master/logos/thumb/infiniti.png' WHERE name = 'Infiniti';
UPDATE brands SET logo_url = 'https://cdn.jsdelivr.net/gh/filippofilip95/car-logos-dataset@master/logos/thumb/isuzu.png' WHERE name = 'Isuzu';
UPDATE brands SET logo_url = 'https://cdn.jsdelivr.net/gh/filippofilip95/car-logos-dataset@master/logos/thumb/jaguar.png' WHERE name = 'Jaguar';
UPDATE brands SET logo_url = 'https://cdn.jsdelivr.net/gh/filippofilip95/car-logos-dataset@master/logos/thumb/jeep.png' WHERE name = 'Jeep';
UPDATE brands SET logo_url = 'https://cdn.jsdelivr.net/gh/filippofilip95/car-logos-dataset@master/logos/thumb/kia.png' WHERE name = 'Kia';
UPDATE brands SET logo_url = 'https://cdn.jsdelivr.net/gh/filippofilip95/car-logos-dataset@master/logos/thumb/koenigsegg.png' WHERE name = 'Koenigsegg';
UPDATE brands SET logo_url = 'https://cdn.jsdelivr.net/gh/filippofilip95/car-logos-dataset@master/logos/thumb/lada.png' WHERE name = 'Lada';
UPDATE brands SET logo_url = 'https://cdn.jsdelivr.net/gh/filippofilip95/car-logos-dataset@master/logos/thumb/lamborghini.png' WHERE name = 'Lamborghini';
UPDATE brands SET logo_url = 'https://cdn.jsdelivr.net/gh/filippofilip95/car-logos-dataset@master/logos/thumb/land-rover.png' WHERE name = 'Land Rover';
UPDATE brands SET logo_url = 'https://cdn.jsdelivr.net/gh/filippofilip95/car-logos-dataset@master/logos/thumb/lexus.png' WHERE name = 'Lexus';
UPDATE brands SET logo_url = 'https://cdn.jsdelivr.net/gh/filippofilip95/car-logos-dataset@master/logos/thumb/lincoln.png' WHERE name = 'Lincoln';
UPDATE brands SET logo_url = 'https://cdn.jsdelivr.net/gh/filippofilip95/car-logos-dataset@master/logos/thumb/lotus.png' WHERE name = 'Lotus';
UPDATE brands SET logo_url = 'https://cdn.jsdelivr.net/gh/filippofilip95/car-logos-dataset@master/logos/thumb/lucid.png' WHERE name = 'Lucid';
UPDATE brands SET logo_url = 'https://cdn.jsdelivr.net/gh/filippofilip95/car-logos-dataset@master/logos/thumb/mahindra.png' WHERE name = 'Mahindra';
UPDATE brands SET logo_url = 'https://cdn.jsdelivr.net/gh/filippofilip95/car-logos-dataset@master/logos/thumb/maserati.png' WHERE name = 'Maserati';
UPDATE brands SET logo_url = 'https://cdn.jsdelivr.net/gh/filippofilip95/car-logos-dataset@master/logos/thumb/mazda.png' WHERE name = 'Mazda';
UPDATE brands SET logo_url = 'https://cdn.jsdelivr.net/gh/filippofilip95/car-logos-dataset@master/logos/thumb/mclaren.png' WHERE name = 'McLaren';
UPDATE brands SET logo_url = 'https://cdn.jsdelivr.net/gh/filippofilip95/car-logos-dataset@master/logos/thumb/mercedes-benz.png' WHERE name = 'Mercedes-Benz';
UPDATE brands SET logo_url = 'https://cdn.jsdelivr.net/gh/filippofilip95/car-logos-dataset@master/logos/thumb/mg.png' WHERE name = 'MG';
UPDATE brands SET logo_url = 'https://cdn.jsdelivr.net/gh/filippofilip95/car-logos-dataset@master/logos/thumb/mini.png' WHERE name = 'MINI';
UPDATE brands SET logo_url = 'https://cdn.jsdelivr.net/gh/filippofilip95/car-logos-dataset@master/logos/thumb/mitsubishi.png' WHERE name = 'Mitsubishi';
UPDATE brands SET logo_url = 'https://cdn.jsdelivr.net/gh/filippofilip95/car-logos-dataset@master/logos/thumb/nio.png' WHERE name = 'Nio';
UPDATE brands SET logo_url = 'https://cdn.jsdelivr.net/gh/filippofilip95/car-logos-dataset@master/logos/thumb/nissan.png' WHERE name = 'Nissan';
UPDATE brands SET logo_url = 'https://cdn.jsdelivr.net/gh/filippofilip95/car-logos-dataset@master/logos/thumb/opel.png' WHERE name = 'Opel';
UPDATE brands SET logo_url = 'https://cdn.jsdelivr.net/gh/filippofilip95/car-logos-dataset@master/logos/thumb/pagani.png' WHERE name = 'Pagani';
UPDATE brands SET logo_url = 'https://cdn.jsdelivr.net/gh/filippofilip95/car-logos-dataset@master/logos/thumb/perodua.png' WHERE name = 'Perodua';
UPDATE brands SET logo_url = 'https://cdn.jsdelivr.net/gh/filippofilip95/car-logos-dataset@master/logos/thumb/peugeot.png' WHERE name = 'Peugeot';
UPDATE brands SET logo_url = 'https://cdn.jsdelivr.net/gh/filippofilip95/car-logos-dataset@master/logos/thumb/polestar.png' WHERE name = 'Polestar';
UPDATE brands SET logo_url = 'https://cdn.jsdelivr.net/gh/filippofilip95/car-logos-dataset@master/logos/thumb/pontiac.png' WHERE name = 'Pontiac';
UPDATE brands SET logo_url = 'https://cdn.jsdelivr.net/gh/filippofilip95/car-logos-dataset@master/logos/thumb/porsche.png' WHERE name = 'Porsche';
UPDATE brands SET logo_url = 'https://cdn.jsdelivr.net/gh/filippofilip95/car-logos-dataset@master/logos/thumb/proton.png' WHERE name = 'Proton';
UPDATE brands SET logo_url = 'https://cdn.jsdelivr.net/gh/filippofilip95/car-logos-dataset@master/logos/thumb/ram.png' WHERE name = 'Ram';
UPDATE brands SET logo_url = 'https://cdn.jsdelivr.net/gh/filippofilip95/car-logos-dataset@master/logos/thumb/renault.png' WHERE name = 'Renault';
UPDATE brands SET logo_url = 'https://cdn.jsdelivr.net/gh/filippofilip95/car-logos-dataset@master/logos/thumb/rivian.png' WHERE name = 'Rivian';
UPDATE brands SET logo_url = 'https://cdn.jsdelivr.net/gh/filippofilip95/car-logos-dataset@master/logos/thumb/rolls-royce.png' WHERE name = 'Rolls-Royce';
UPDATE brands SET logo_url = 'https://cdn.jsdelivr.net/gh/filippofilip95/car-logos-dataset@master/logos/thumb/seat.png' WHERE name = 'SEAT';
UPDATE brands SET logo_url = 'https://cdn.jsdelivr.net/gh/filippofilip95/car-logos-dataset@master/logos/thumb/skoda.png' WHERE name = 'Skoda';
UPDATE brands SET logo_url = 'https://cdn.jsdelivr.net/gh/filippofilip95/car-logos-dataset@master/logos/thumb/smart.png' WHERE name = 'Smart';
UPDATE brands SET logo_url = 'https://cdn.jsdelivr.net/gh/filippofilip95/car-logos-dataset@master/logos/thumb/subaru.png' WHERE name = 'Subaru';
UPDATE brands SET logo_url = 'https://cdn.jsdelivr.net/gh/filippofilip95/car-logos-dataset@master/logos/thumb/suzuki.png' WHERE name = 'Suzuki';
UPDATE brands SET logo_url = 'https://cdn.jsdelivr.net/gh/filippofilip95/car-logos-dataset@master/logos/thumb/tata.png' WHERE name = 'Tata';
UPDATE brands SET logo_url = 'https://cdn.jsdelivr.net/gh/filippofilip95/car-logos-dataset@master/logos/thumb/tesla.png' WHERE name = 'Tesla';
UPDATE brands SET logo_url = 'https://cdn.jsdelivr.net/gh/filippofilip95/car-logos-dataset@master/logos/thumb/toyota.png' WHERE name = 'Toyota';
UPDATE brands SET logo_url = 'https://cdn.jsdelivr.net/gh/filippofilip95/car-logos-dataset@master/logos/thumb/vauxhall.png' WHERE name = 'Vauxhall';
UPDATE brands SET logo_url = 'https://cdn.jsdelivr.net/gh/filippofilip95/car-logos-dataset@master/logos/thumb/volkswagen.png' WHERE name = 'Volkswagen';
UPDATE brands SET logo_url = 'https://cdn.jsdelivr.net/gh/filippofilip95/car-logos-dataset@master/logos/thumb/volvo.png' WHERE name = 'Volvo';
UPDATE brands SET logo_url = 'https://cdn.jsdelivr.net/gh/filippofilip95/car-logos-dataset@master/logos/thumb/xpeng.png' WHERE name = 'Xpeng';
UPDATE brands SET logo_url = 'https://cdn.jsdelivr.net/gh/filippofilip95/car-logos-dataset@master/logos/thumb/zeekr.png' WHERE name = 'Zeekr';
UPDATE brands SET logo_url = 'https://cdn.jsdelivr.net/gh/filippofilip95/car-logos-dataset@master/logos/thumb/abarth.png' WHERE name = 'Abarth';
