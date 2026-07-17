const fs = require('fs');
const path = require('path');

// 1. Read thumbs list
let content;
try {
    content = fs.readFileSync('thumbs.json', 'utf16le');
    if (!content.trim().startsWith('[')) {
        content = fs.readFileSync('thumbs.json', 'utf8');
    }
} catch (e) {
    content = fs.readFileSync('thumbs.json', 'utf8');
}
const thumbsData = JSON.parse(content.trim().replace(/^\uFEFF/, ''));
const slugs = thumbsData.map(item => {
    // e.g. "zotye.png" -> "zotye"
    return item.name.replace('.png', '').toLowerCase();
});

// 2. Define all brands seeded in V8
const brands = [
  'Acura','Alfa Romeo','Alpine','Aston Martin','Audi',
  'Bentley','BMW','BYD','Bugatti','Buick',
  'Cadillac','Changan','Chery','Chevrolet','Chrysler',
  'Citroen','Cupra','Dacia','Daihatsu','Dodge',
  'DS Automobiles','Ferrari','Fiat','Ford','GAC',
  'Geely','Genesis','GMC','Great Wall','Haval',
  'Honda','Hyundai','Infiniti','Isuzu','Jaguar',
  'Jeep','Kia','Koenigsegg','Lada','Lamborghini',
  'Land Rover','Lexus','Lincoln','Lotus','Lucid',
  'Mahindra','Maserati','Mazda','McLaren','Mercedes-Benz',
  'MG','MINI','Mitsubishi','Moskvich','Nio',
  'Nissan','Opel','Pagani','Perodua','Peugeot',
  'Polestar','Pontiac','Porsche','Proton','Ram',
  'Renault','Rivian','Rolls-Royce','SEAT','Skoda',
  'Smart','Subaru','Suzuki','Tata','Tesla',
  'Toyota','Vauxhall','Volkswagen','Volvo','Xpeng',
  'Zeekr','Abarth','AC','Ariel','Ares',
  'Arrinera','Artega','Atalanta','BAC','Bajaj',
  'Bolloré','Bristol','Bufori','Callaway','Caparo',
  'Caterham','Czinger','Dallara','De Tomaso','Devel',
  'Donkervoort','Electric Brands','Elemental','Envision','Exeed',
  'Faraday Future','Fisker','Force Motors','GWM','Hennessey',
  'Heroic','Hongqi','Hyper','Icon','Ineos',
  'JAC','JMC','Karma','KTM','Lancia',
  'Leapmotor','Li Auto','Lifan','Lixiang','Lynk & Co',
  'Maruti Suzuki','Morgan','Morris','Neta','Noble',
  'Oldsmobile','Ora','Pagani','Pantera','Panther',
  'Qoros','Radical','RBW','Rezvani','Rimac',
  'Roewe','Royal Enfield','Saab','Saleen','Saturn',
  'Seres','Singer','Spyker','SSC','SsangYong',
  'Stellantis','Sterling','Studebaker','Sunra','Talbot',
  'Triumph','TVR','Ultima','Vector','Venturi',
  'Vinfast','Vuhl','Wey','Wiesmann','Xev',
  'Zotye'
];

function normalize(str) {
    return str.toLowerCase()
        .replace(/[^a-z0-9]/g, ''); // remove all non-alphanumeric
}

const sqlLines = [];
let matchedCount = 0;
let unmatchedCount = 0;

const normalizedSlugs = slugs.map(slug => ({
    original: slug,
    norm: normalize(slug)
}));

brands.forEach(brand => {
    const normBrand = normalize(brand);
    // Find matching slug
    let match = normalizedSlugs.find(s => s.norm === normBrand);
    
    // Manual fallbacks or adjustments if needed
    if (!match) {
        if (normBrand === 'mercedesbenz') {
            match = normalizedSlugs.find(s => s.norm === 'mercedes');
        } else if (normBrand === 'dsautomobiles') {
            match = normalizedSlugs.find(s => s.norm === 'ds');
        } else if (normBrand === 'electricbrands') {
            match = normalizedSlugs.find(s => s.norm === 'eb');
        } else if (normBrand === 'rollsroyce') {
            match = normalizedSlugs.find(s => s.norm === 'rollsroyce' || s.norm === 'rolls');
        } else if (normBrand === 'lynkco') {
            match = normalizedSlugs.find(s => s.norm === 'lynkco' || s.norm === 'lynk_co' || s.norm === 'lynk-co' || s.norm === 'lynkandco');
        } else if (normBrand === 'greatwall') {
            match = normalizedSlugs.find(s => s.norm === 'greatwall' || s.norm === 'greatwallmotors' || s.norm === 'greatwallmotor' || s.norm === 'greatwall');
        } else if (normBrand === 'gwm') {
            match = normalizedSlugs.find(s => s.norm === 'greatwall');
        } else if (normBrand === 'marutisuzuki') {
            match = normalizedSlugs.find(s => s.norm === 'maruti');
        } else if (normBrand === 'royalenfield') {
            match = normalizedSlugs.find(s => s.norm === 'royal_enfield' || s.norm === 'royalenfield');
        } else if (normBrand === 'gac') {
            match = normalizedSlugs.find(s => s.norm === 'gacgroup');
        }
    }
    
    // Additional direct slug overrides
    if (!match) {
        if (normBrand === 'gac') {
            match = normalizedSlugs.find(s => s.original === 'gac-group');
        } else if (normBrand === 'greatwall' || normBrand === 'gwm') {
            match = normalizedSlugs.find(s => s.original === 'great-wall');
        } else if (normBrand === 'lynkco') {
            match = normalizedSlugs.find(s => s.original === 'lynk-and-co');
        }
    }
    
    if (match) {
        matchedCount++;
        const logoUrl = `https://cdn.jsdelivr.net/gh/filippofilip95/car-logos-dataset@master/logos/thumb/${match.original}.png`;
        sqlLines.push(`UPDATE brands SET logo_url = '${logoUrl}' WHERE name = '${brand.replace(/'/g, "''")}';`);
    } else {
        unmatchedCount++;
        console.log(`Unmatched: ${brand}`);
    }
});

console.log(`Matched: ${matchedCount}, Unmatched: ${unmatchedCount}`);

// Write SQL output
fs.writeFileSync('V9__seed_brand_logos.sql', sqlLines.join('\n'), 'utf8');
console.log('Generated V9__seed_brand_logos.sql');
