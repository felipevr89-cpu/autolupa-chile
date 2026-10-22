import { SafetyRating } from '../types';

export interface Enrichment {
  electric_range_km?: number;
  battery_kwh?: number;
  safety_ratings?: SafetyRating[];
}

const LATIN = 'https://www.latinncap.com/en/results';
const EURO = 'https://www.euroncap.com/en/ratings-rewards/latest-safety-ratings/';
const ANCAP = 'https://www.ancap.com.au/safety-ratings';
const GLOBAL = 'https://www.globalncap.org/safer-cars-for-india';

export const enrichment: Record<string, Enrichment> = {
  'Tesla|Model 3': {
    electric_range_km: 513,
    battery_kwh: 60,
    safety_ratings: [
      { program: 'Euro NCAP', stars: 5, year: 2019, source: EURO },
      { program: 'ANCAP', stars: 5, year: 2019, source: ANCAP },
    ],
  },
  'Tesla|Model Y': {
    electric_range_km: 500,
    battery_kwh: 60,
    safety_ratings: [
      { program: 'Euro NCAP', stars: 5, year: 2022, source: EURO },
      { program: 'ANCAP', stars: 5, year: 2022, source: ANCAP },
    ],
  },
  'Tesla|Model S': { electric_range_km: 634, battery_kwh: 95 },
  'Tesla|Model X': { electric_range_km: 576, battery_kwh: 95 },
  'Tesla|Cybertruck': { electric_range_km: 515, battery_kwh: 123 },

  'BYD|Dolphin': {
    electric_range_km: 427,
    battery_kwh: 60,
    safety_ratings: [
      { program: 'Latin NCAP', stars: 5, year: 2024, source: 'https://www.latinncap.com/en/result/193/byd-dolphin-plus-7-airbags', note: 'Dolphin Plus, 7 airbags' },
      { program: 'Euro NCAP', stars: 5, year: 2023, source: 'https://www.euroncap.com/assessments/byd/dolphin/1040' },
      { program: 'ANCAP', stars: 5, year: 2023, source: 'https://www.ancap.com.au/safety-ratings/byd/dolphin/6d3f38' },
    ],
  },
  'BYD|Dolphin Mini': { electric_range_km: 340, battery_kwh: 38 },
  'BYD|Seal': {
    electric_range_km: 570,
    battery_kwh: 82,
    safety_ratings: [
      { program: 'Euro NCAP', stars: 5, year: 2023, source: EURO },
      { program: 'ANCAP', stars: 5, year: 2023, source: ANCAP },
    ],
  },
  'BYD|Sealion 7': { electric_range_km: 482, battery_kwh: 82 },
  'BYD|Han': { electric_range_km: 521, battery_kwh: 85 },
  'BYD|Han EV': { electric_range_km: 521, battery_kwh: 85 },
  'BYD|Tang': { electric_range_km: 400, battery_kwh: 86 },
  'BYD|Yuan Plus': {
    electric_range_km: 420,
    battery_kwh: 60,
    safety_ratings: [
      { program: 'Euro NCAP', stars: 5, year: 2022, source: EURO, note: 'Atto 3' },
      { program: 'ANCAP', stars: 5, year: 2022, source: ANCAP, note: 'Atto 3' },
    ],
  },
  'BYD|Yuan Pro': { electric_range_km: 401, battery_kwh: 45 },

  'Hyundai|Ioniq 5': {
    electric_range_km: 481,
    battery_kwh: 77,
    safety_ratings: [
      { program: 'Euro NCAP', stars: 5, year: 2021, source: EURO },
      { program: 'ANCAP', stars: 5, year: 2021, source: ANCAP },
    ],
  },
  'Hyundai|Ioniq 6': {
    electric_range_km: 614,
    battery_kwh: 77,
    safety_ratings: [{ program: 'Euro NCAP', stars: 5, year: 2022, source: EURO }],
  },
  'Hyundai|Inster': { electric_range_km: 360, battery_kwh: 49 },
  'Hyundai|Kona Eléctrico': { electric_range_km: 370, battery_kwh: 48.6 },

  'Kia|EV6': {
    electric_range_km: 528,
    battery_kwh: 77,
    safety_ratings: [
      { program: 'Euro NCAP', stars: 5, year: 2021, source: EURO },
      { program: 'ANCAP', stars: 5, year: 2022, source: ANCAP },
    ],
  },
  'Kia|EV9': {
    electric_range_km: 563,
    battery_kwh: 100,
    safety_ratings: [{ program: 'Euro NCAP', stars: 5, year: 2023, source: EURO }],
  },
  'Kia|EV5': { electric_range_km: 500, battery_kwh: 88 },
  'Kia|Niro EV': { electric_range_km: 460, battery_kwh: 65 },

  'Volkswagen|ID.4': {
    electric_range_km: 550,
    battery_kwh: 77,
    safety_ratings: [
      { program: 'Euro NCAP', stars: 5, year: 2021, source: EURO },
      { program: 'ANCAP', stars: 5, year: 2021, source: ANCAP },
    ],
  },
  'Volkswagen|ID.Buzz': {
    electric_range_km: 423,
    battery_kwh: 79,
    safety_ratings: [{ program: 'Euro NCAP', stars: 5, year: 2022, source: EURO }],
  },

  'MG|MG 4 EV': {
    electric_range_km: 450,
    battery_kwh: 64,
    safety_ratings: [
      { program: 'Euro NCAP', stars: 5, year: 2022, source: EURO },
      { program: 'ANCAP', stars: 5, year: 2022, source: ANCAP },
    ],
  },
  'MG|MG 4 XPOWER': { electric_range_km: 385, battery_kwh: 64 },
  'MG|MG ZS EV': { electric_range_km: 440, battery_kwh: 72 },
  'MG|Marvel R': { electric_range_km: 402, battery_kwh: 70 },
  'MG|Cyberster': { electric_range_km: 519, battery_kwh: 77 },
  'MG|MG Cyberster': { electric_range_km: 519, battery_kwh: 77 },
  'MG|S5 EV': { electric_range_km: 480, battery_kwh: 64 },

  'Nissan|Leaf': {
    electric_range_km: 270,
    battery_kwh: 40,
    safety_ratings: [{ program: 'Euro NCAP', stars: 5, year: 2018, source: EURO }],
  },

  'BMW|i4': { electric_range_km: 590, battery_kwh: 84 },
  'BMW|i5': { electric_range_km: 582, battery_kwh: 84 },
  'BMW|i7': { electric_range_km: 625, battery_kwh: 106 },
  'BMW|iX': {
    electric_range_km: 630,
    battery_kwh: 112,
    safety_ratings: [{ program: 'Euro NCAP', stars: 5, year: 2021, source: EURO }],
  },
  'BMW|iX1': { electric_range_km: 440, battery_kwh: 66 },
  'BMW|iX3': { electric_range_km: 460, battery_kwh: 80 },

  'Mercedes-Benz|EQA': { electric_range_km: 496, battery_kwh: 70 },
  'Mercedes-Benz|EQB': {
    electric_range_km: 423,
    battery_kwh: 70,
    safety_ratings: [{ program: 'Euro NCAP', stars: 5, year: 2019, source: EURO, note: 'plataforma GLB' }],
  },
  'Mercedes-Benz|EQE': { electric_range_km: 639, battery_kwh: 90 },
  'Mercedes-Benz|EQS': { electric_range_km: 780, battery_kwh: 108 },
  'Mercedes-Benz|EQV': { electric_range_km: 356, battery_kwh: 90 },

  'Audi|Q4 e-tron': {
    electric_range_km: 520,
    battery_kwh: 77,
    safety_ratings: [{ program: 'Euro NCAP', stars: 5, year: 2021, source: EURO }],
  },
  'Audi|Q6 e-tron': { electric_range_km: 625, battery_kwh: 95 },
  'Audi|e-tron GT': { electric_range_km: 500, battery_kwh: 93 },

  'Porsche|Taycan': { electric_range_km: 503, battery_kwh: 93 },

  'Renault|Megane E-Tech': {
    electric_range_km: 470,
    battery_kwh: 60,
    safety_ratings: [{ program: 'Euro NCAP', stars: 5, year: 2022, source: EURO }],
  },

  'Cupra|Born': { electric_range_km: 549, battery_kwh: 77 },
  'Cupra|Tavascan': { electric_range_km: 568, battery_kwh: 77 },
  'Škoda|Enyaq': {
    electric_range_km: 545,
    battery_kwh: 77,
    safety_ratings: [{ program: 'Euro NCAP', stars: 5, year: 2021, source: EURO }],
  },

  'smart|#1': { electric_range_km: 440, battery_kwh: 66 },
  'smart|#3': { electric_range_km: 455, battery_kwh: 66 },

  'MINI|Electric': { electric_range_km: 203, battery_kwh: 33 },
  'MINI|Aceman': { electric_range_km: 406, battery_kwh: 54 },

  'Jaguar|I-Pace': {
    electric_range_km: 470,
    battery_kwh: 90,
    safety_ratings: [{ program: 'Euro NCAP', stars: 5, year: 2018, source: EURO }],
  },

  'Toyota|bZ4X': {
    electric_range_km: 516,
    battery_kwh: 71,
    safety_ratings: [{ program: 'Euro NCAP', stars: 5, year: 2022, source: EURO }],
  },
  'Subaru|Solterra': { electric_range_km: 466, battery_kwh: 71 },
  'Lexus|RZ': { electric_range_km: 440, battery_kwh: 71 },

  'Chevrolet|Equinox EV': { electric_range_km: 513, battery_kwh: 85 },
  'Chevrolet|Blazer EV': { electric_range_km: 534, battery_kwh: 85 },

  'Volvo|EX30': {
    electric_range_km: 476,
    battery_kwh: 69,
    safety_ratings: [{ program: 'Euro NCAP', stars: 5, year: 2024, source: EURO }],
  },
  'Volvo|EX40': {
    electric_range_km: 500,
    battery_kwh: 79,
    safety_ratings: [{ program: 'Euro NCAP', stars: 5, year: 2018, source: EURO, note: 'XC40' }],
  },
  'Volvo|EX90': { electric_range_km: 614, battery_kwh: 111 },

  'MG|MG4 EV': { electric_range_km: 450, battery_kwh: 64 },
  'Omoda|E5': { electric_range_km: 430, battery_kwh: 61 },
  'GWM|ORA 03': { electric_range_km: 420, battery_kwh: 63 },
  'Leapmotor|C10': { electric_range_km: 420, battery_kwh: 70 },
  'Peugeot|e-2008': { electric_range_km: 406, battery_kwh: 51 },

  // --- EV/PHEV completados con fichas oficiales Chile (2026) ---
  'BYD|Atto 8': { electric_range_km: 132, battery_kwh: 35.6 },
  'Changan|Hunter REEV': { electric_range_km: 131, battery_kwh: 31.18 },
  'Changan|Lumin': { electric_range_km: 301, battery_kwh: 28.08 },
  'Chery|Tiggo 7 Pro Max PHEV': { electric_range_km: 90, battery_kwh: 18.3 },
  'Chery|Tiggo 9 PHEV': { electric_range_km: 90, battery_kwh: 19.25 },
  'Chevrolet|Captiva EV': { electric_range_km: 415, battery_kwh: 60 },
  'Chevrolet|Captiva PHEV': { electric_range_km: 90, battery_kwh: 20.5 },
  'Deepal|G318': { electric_range_km: 143, battery_kwh: 35.1 },
  'Deepal|S07': { electric_range_km: 170, battery_kwh: 31.74 },
  'GAC|Aion UT': { electric_range_km: 400, battery_kwh: 44.12 },
  'Geely|EX2': { electric_range_km: 325, battery_kwh: 39.4 },
  'Geely|EX5 EM-i': { electric_range_km: 170, battery_kwh: 29.8 },
  'Geely|Geometry C': { electric_range_km: 460, battery_kwh: 70 },
  'Jetour|T1 PHEV': { electric_range_km: 117, battery_kwh: 26.7 },
  'Jetour|T2 PHEV': { electric_range_km: 100, battery_kwh: 26.7 },
  'JMC|Vigus EV': { electric_range_km: 332, battery_kwh: 60 },
  'Neta|S': { electric_range_km: 715, battery_kwh: 84.5 },
  'Neta|U': { electric_range_km: 500, battery_kwh: 68.2 },
  'Neta|V': { electric_range_km: 384, battery_kwh: 40.7 },
  'Neta|X': { electric_range_km: 410, battery_kwh: 62 },
  'Soueast|S06 PHEV': { electric_range_km: 114, battery_kwh: 19.43 },
  'Soueast|S08 PHEV': { electric_range_km: 85, battery_kwh: 18.4 },

  // Combustion / hybrid popular models — safety ratings only
  'Toyota|Corolla': {
    safety_ratings: [
      { program: 'Latin NCAP', stars: 5, year: 2019, source: LATIN },
      { program: 'Euro NCAP', stars: 5, year: 2019, source: EURO },
    ],
  },
  'Toyota|Corolla Cross': {
    safety_ratings: [{ program: 'Latin NCAP', stars: 5, year: 2021, source: LATIN }],
  },
  'Toyota|RAV4': {
    safety_ratings: [
      { program: 'Latin NCAP', stars: 5, year: 2019, source: LATIN },
      { program: 'Euro NCAP', stars: 5, year: 2019, source: EURO },
    ],
  },
  'Toyota|Hilux': {
    safety_ratings: [
      { program: 'Latin NCAP', stars: 5, year: 2022, source: LATIN },
      { program: 'ANCAP', stars: 5, year: 2019, source: ANCAP },
    ],
  },
  'Toyota|Yaris': {
    safety_ratings: [
      { program: 'Latin NCAP', stars: 5, year: 2019, source: LATIN },
      { program: 'Euro NCAP', stars: 5, year: 2020, source: EURO },
    ],
  },
  'Volkswagen|T-Cross': {
    safety_ratings: [{ program: 'Latin NCAP', stars: 5, year: 2019, source: LATIN }],
  },
  'Volkswagen|Nivus': {
    safety_ratings: [{ program: 'Latin NCAP', stars: 5, year: 2021, source: LATIN }],
  },
  'Volkswagen|Taos': {
    safety_ratings: [{ program: 'Latin NCAP', stars: 5, year: 2021, source: LATIN }],
  },
  'Volkswagen|Polo': {
    safety_ratings: [{ program: 'Euro NCAP', stars: 5, year: 2022, source: EURO }],
  },
  'Chevrolet|Onix': {
    safety_ratings: [{ program: 'Latin NCAP', stars: 3, year: 2021, source: LATIN, note: 'protección adultos parcial' }],
  },
  'Suzuki|Swift': {
    safety_ratings: [{ program: 'Global NCAP', stars: 4, year: 2023, source: GLOBAL }],
  },
  'Chery|Tiggo 7 Pro': {
    safety_ratings: [{ program: 'Latin NCAP', stars: 5, year: 2022, source: LATIN }],
  },
  'Chery|Tiggo 8 Pro': {
    safety_ratings: [{ program: 'Latin NCAP', stars: 5, year: 2022, source: LATIN }],
  },
  'Honda|Civic': {
    safety_ratings: [{ program: 'Euro NCAP', stars: 5, year: 2022, source: EURO }],
  },
  'Honda|CR-V': {
    safety_ratings: [{ program: 'Euro NCAP', stars: 5, year: 2019, source: EURO }],
  },
  'Nissan|Kicks': {
    safety_ratings: [{ program: 'Latin NCAP', stars: 4, year: 2021, source: LATIN }],
  },
  'Ford|Territory': {
    safety_ratings: [{ program: 'Latin NCAP', stars: 5, year: 2023, source: LATIN }],
  },
  'Ford|Ranger': {
    safety_ratings: [
      { program: 'Euro NCAP', stars: 5, year: 2022, source: EURO },
      { program: 'ANCAP', stars: 5, year: 2022, source: ANCAP },
    ],
  },

  // --- EVs restantes ---
  'Lotus|Eletre': { electric_range_km: 600, battery_kwh: 112 },
  'Rolls-Royce|Spectre': { electric_range_km: 530, battery_kwh: 102 },
  'Mercedes-Benz|EQG': { electric_range_km: 473, battery_kwh: 116 },
  'Citroën|Ami': { electric_range_km: 75, battery_kwh: 6 },
  'KGM|Torres EVX': { electric_range_km: 462, battery_kwh: 73 },
  'Maxus|T90 EV': { electric_range_km: 330, battery_kwh: 89 },
  'Nissan|Townstar': { electric_range_km: 285, battery_kwh: 45 },
  'Riddara|RD6': { electric_range_km: 450, battery_kwh: 63 },

  // --- PHEV: batería y autonomía eléctrica ---
  'Alfa Romeo|Tonale': { electric_range_km: 69, battery_kwh: 15 },
  'BMW|XM': { electric_range_km: 82, battery_kwh: 26 },
  'BYD|Shark': { electric_range_km: 100, battery_kwh: 30 },
  'BYD|Song Plus DM-i': { electric_range_km: 110, battery_kwh: 18 },
  'Jeep|Compass 4xe': { electric_range_km: 50, battery_kwh: 11 },
  'Jeep|Wrangler 4xe': { electric_range_km: 40, battery_kwh: 17 },
  'Ferrari|296 GTB': { electric_range_km: 25, battery_kwh: 7 },
  'Ferrari|SF90 Stradale': { electric_range_km: 25, battery_kwh: 8 },
  'Lamborghini|Revuelto': { electric_range_km: 10, battery_kwh: 4 },
  'McLaren|Artura': { electric_range_km: 30, battery_kwh: 7 },
  'GWM|H6 PHEV': { electric_range_km: 100, battery_kwh: 20 },
  'Jaecoo|J7 SHS': { electric_range_km: 90, battery_kwh: 18 },
  'Chery|Tiggo 8 Pro Max PHEV': { electric_range_km: 90, battery_kwh: 19 },

  // --- NCAP: SUVs populares ---
  'Nissan|Qashqai': { safety_ratings: [{ program: 'Euro NCAP', stars: 5, year: 2021, source: EURO }] },
  'Nissan|X-Trail': { safety_ratings: [{ program: 'Euro NCAP', stars: 5, year: 2022, source: EURO }] },
  'Hyundai|Tucson': { safety_ratings: [{ program: 'Euro NCAP', stars: 5, year: 2021, source: EURO }] },
  'Hyundai|Tucson Híbrido': { safety_ratings: [{ program: 'Euro NCAP', stars: 5, year: 2021, source: EURO }] },
  'Hyundai|Santa Fe': { safety_ratings: [{ program: 'Euro NCAP', stars: 5, year: 2024, source: EURO }] },
  'Kia|Sportage': { safety_ratings: [{ program: 'Euro NCAP', stars: 5, year: 2022, source: EURO }] },
  'Kia|Sportage Híbrido': { safety_ratings: [{ program: 'Euro NCAP', stars: 5, year: 2022, source: EURO }] },
  'Kia|Sorento': { safety_ratings: [{ program: 'Euro NCAP', stars: 5, year: 2020, source: EURO }] },
  'Kia|Sorento Híbrido': { safety_ratings: [{ program: 'Euro NCAP', stars: 5, year: 2020, source: EURO }] },
  'Volkswagen|Tiguan': { safety_ratings: [{ program: 'Euro NCAP', stars: 5, year: 2024, source: EURO }] },
  'Mazda|CX-5': { safety_ratings: [{ program: 'Euro NCAP', stars: 5, year: 2017, source: EURO }] },
  'Mazda|CX-30': { safety_ratings: [{ program: 'Euro NCAP', stars: 5, year: 2019, source: EURO }] },
  'Mazda|CX-60': { safety_ratings: [{ program: 'Euro NCAP', stars: 5, year: 2022, source: EURO }] },
  'Honda|HR-V': { safety_ratings: [{ program: 'Euro NCAP', stars: 4, year: 2022, source: EURO }] },
  'Peugeot|3008': { safety_ratings: [{ program: 'Euro NCAP', stars: 5, year: 2016, source: EURO }] },
  'Peugeot|2008': { safety_ratings: [{ program: 'Euro NCAP', stars: 4, year: 2019, source: EURO }] },
  'Subaru|Forester': { safety_ratings: [{ program: 'Euro NCAP', stars: 5, year: 2019, source: EURO }] },
  'Subaru|Outback': { safety_ratings: [{ program: 'ANCAP', stars: 5, year: 2021, source: ANCAP }] },
  'Subaru|Crosstrek': { safety_ratings: [{ program: 'ANCAP', stars: 5, year: 2023, source: ANCAP }] },
  'Volvo|XC40': { safety_ratings: [{ program: 'Euro NCAP', stars: 5, year: 2018, source: EURO }] },
  'Volvo|XC60': { safety_ratings: [{ program: 'Euro NCAP', stars: 5, year: 2017, source: EURO }] },
  'Volvo|XC90': { safety_ratings: [{ program: 'Euro NCAP', stars: 5, year: 2019, source: EURO }] },
  'Mitsubishi|Outlander': { safety_ratings: [{ program: 'ANCAP', stars: 5, year: 2021, source: ANCAP }] },
  'GWM|Haval H6 HEV': { safety_ratings: [{ program: 'ANCAP', stars: 5, year: 2022, source: ANCAP }] },

  // --- NCAP: sedán / hatch / pickup ---
  'Mazda|Mazda 3': { safety_ratings: [{ program: 'Euro NCAP', stars: 5, year: 2019, source: EURO }] },
  'Toyota|Camry': { safety_ratings: [{ program: 'Euro NCAP', stars: 5, year: 2019, source: EURO }] },
  'Peugeot|208': { safety_ratings: [{ program: 'Euro NCAP', stars: 4, year: 2019, source: EURO }] },
  'Volkswagen|Virtus': { safety_ratings: [{ program: 'Latin NCAP', stars: 5, year: 2023, source: LATIN }] },
  'Chevrolet|Montana': { safety_ratings: [{ program: 'Latin NCAP', stars: 5, year: 2023, source: LATIN }] },
  'Volkswagen|Amarok': {
    safety_ratings: [
      { program: 'Euro NCAP', stars: 5, year: 2022, source: EURO },
      { program: 'ANCAP', stars: 5, year: 2022, source: ANCAP },
    ],
  },
  'Mitsubishi|L200': { safety_ratings: [{ program: 'ANCAP', stars: 5, year: 2024, source: ANCAP, note: 'gen. Triton' }] },
  'GWM|Poer': { safety_ratings: [{ program: 'ANCAP', stars: 5, year: 2021, source: ANCAP }] },
};
