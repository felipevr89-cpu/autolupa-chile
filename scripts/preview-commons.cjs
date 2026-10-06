// Descarga miniaturas de archivos de Commons y arma hojas de contacto en
// /tmp/preview para curaduría visual de las fotos del catálogo.
// Uso: node scripts/preview-commons.cjs [--sheet=1]
const fs = require('fs');
const path = require('path');
const https = require('https');

const UA = 'AutoLupa/1.0 (https://autolupa.pages.dev; catalog images) node-fetch';

const PICKS = [
  ['95', 'Chery Tiggo 3x MY2024 IMG01.jpg'],
  ['95b', 'Chery Tiggo 3x MY2024 IMG02.jpg'],
  ['98', 'Chery Tiggo 4 Pro 1.5T Elite (2022) (52722210544).jpg'],
  ['107', 'Chevrolet Captiva PHEV Premier 2026.jpg'],
  ['296a', '2022 JMC Touring.jpg'],
  ['296b', 'JMC Touring Transporter 2.8 LWB White 01.jpg'],
  ['397a', 'Mercedes-AMG GT 63 (C192) APXGP Edition DSC 0692.jpg'],
  ['397b', 'Mercedes-AMG GT 63 Pro (C192) IAA 2025 DSC 2092.jpg'],
  ['510a', 'Renault Logan 004.jpg'],
  ['510b', 'Renault Logan.JPG'],
  ['619', '2025 Chevrolet Onix Plus 1.0T LT (1).jpg'],
  ['626a', 'Ford Territory 004.jpg'],
  ['626b', 'Ford Territory CN Sanming 01 2022-07-26.jpg'],
  ['626c', 'Ford Territory China 003.jpg'],
  ['627', '2022 Ford Maverick XLT AWD, Rear Right, 10-10-2021.jpg'],
  ['645a', 'Citroën Jumper (6824636031).jpg'],
  ['645b', 'Citroën Jumper II - GPM (busplus) 01.jpg'],
  ['149', 'Dongfeng Aeolus Yixuan Shishi 02 2022-06-07.jpg'],
  ['63', 'BYD Tang L EV 001.jpg'],
  ['555', 'SWM Tiger front quarter.jpg'],
  ['610', 'Wey Coffee 01 PHEV IAA 2021 1X7A0219.jpg'],
  ['527', '2018 Jinbei T30 single cab, front 8.7.18.jpg'],
  ['528', '2014 Brilliance Jinbei Haixing X30.jpg'],
  ['614', 'Dongfeng ZNA Rich TDi-CR 2013 (12894410934).jpg'],
  ['616', 'ZX Auto Admiral.jpg'],
  ['300', 'Moscow, Kaiyi E5, April 2025 02.jpg'],
  ['145', 'Dongfeng Fengon ix5 01 China 2019-03-20.jpg'],
  ['147', 'DFSK Glory 500 1.5 front 2024.jpg'],
  ['205', 'Moscow - 2026 - Geely Coolray compact crossover.jpg'],
  ['271', '2025 Jaecoo 5 1.6 Luxury (United Kingdom) front view.jpg'],
  ['439', 'MINI F66 Cooper S Favoured 3 Door Midnight Black II (13).jpg'],
  ['119', 'Chevrolet Sail II hatch 01 China 2019-03-17.jpg'],
  ['617', '2012 ZX Auto Grand Tiger Double Cab Pickup (14959057960).jpg'],
  ['618', 'ZX Auto Grandtiger 4WD 2009 (9790340136).jpg'],
];

const OUT_DIR = '/tmp/preview';

function fetchJson(url) {
  return new Promise((resolve, reject) => {
    https
      .get(url, { headers: { 'User-Agent': UA } }, (res) => {
        let data = '';
        res.on('data', (c) => (data += c));
        res.on('end', () => {
          try {
            resolve(JSON.parse(data));
          } catch (e) {
            reject(e);
          }
        });
      })
      .on('error', reject);
  });
}

function download(url, dest) {
  return new Promise((resolve, reject) => {
    const req = https.get(url, { headers: { 'User-Agent': UA } }, (res) => {
      if (res.statusCode !== 200) {
        reject(new Error('HTTP ' + res.statusCode));
        res.resume();
        return;
      }
      const out = fs.createWriteStream(dest);
      res.pipe(out);
      out.on('finish', () => out.close(resolve));
      out.on('error', reject);
    });
    req.on('error', reject);
  });
}

async function main() {
  fs.mkdirSync(OUT_DIR, { recursive: true });
  const manifest = [];
  for (const [label, file] of PICKS) {
    const dest = path.join(OUT_DIR, `${label}.jpg`);
    if (fs.existsSync(dest)) {
      manifest.push([label, file]);
      continue;
    }
    try {
      const url =
        'https://commons.wikimedia.org/w/api.php?format=json&action=query&titles=' +
        encodeURIComponent('File:' + file) +
        '&prop=imageinfo&iiprop=url|extmetadata&iiurlwidth=640';
      const data = await fetchJson(url);
      const page = Object.values(data.query.pages)[0];
      const ii = page.imageinfo && page.imageinfo[0];
      if (!ii) {
        console.log(`${label} SIN INFO: ${file}`);
        continue;
      }
      await download(ii.thumburl || ii.url, dest);
      manifest.push([label, file]);
      console.log(`${label} ok -> ${file}`);
    } catch (e) {
      console.log(`${label} ERROR ${file}: ${e.message}`);
    }
    await new Promise((r) => setTimeout(r, 200));
  }
  fs.writeFileSync(path.join(OUT_DIR, 'manifest.json'), JSON.stringify(manifest, null, 2));
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
