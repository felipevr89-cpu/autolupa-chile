export interface DemoListing {
  id: string;
  demo: true;
  brand: string;
  model: string;
  year: number;
  price: number;
  mileage: number;
  region: string;
  fuel: 'bencina' | 'diesel' | 'hibrido' | 'electrico';
  transmission: 'manual' | 'automatica';
  color: string;
}

export const DEMO_LISTINGS: DemoListing[] = [
  { id: 'demo-1', demo: true, brand: 'Toyota', model: 'Corolla', year: 2021, price: 14990000, mileage: 48000, region: 'Región Metropolitana', fuel: 'bencina', transmission: 'automatica', color: 'Blanco' },
  { id: 'demo-2', demo: true, brand: 'Suzuki', model: 'Swift', year: 2022, price: 10490000, mileage: 32000, region: 'Valparaíso', fuel: 'bencina', transmission: 'automatica', color: 'Rojo' },
  { id: 'demo-3', demo: true, brand: 'Hyundai', model: 'Tucson', year: 2020, price: 16990000, mileage: 68000, region: 'Biobío', fuel: 'bencina', transmission: 'automatica', color: 'Gris' },
  { id: 'demo-4', demo: true, brand: 'Ford', model: 'Ranger', year: 2019, price: 21990000, mileage: 95000, region: 'Araucanía', fuel: 'diesel', transmission: 'manual', color: 'Azul' },
  { id: 'demo-5', demo: true, brand: 'Peugeot', model: '208', year: 2023, price: 12990000, mileage: 18000, region: 'Región Metropolitana', fuel: 'bencina', transmission: 'automatica', color: 'Blanco' },
  { id: 'demo-6', demo: true, brand: 'Mitsubishi', model: 'L200', year: 2018, price: 17990000, mileage: 120000, region: "O'Higgins", fuel: 'diesel', transmission: 'manual', color: 'Plata' },
  { id: 'demo-7', demo: true, brand: 'Nissan', model: 'Navara', year: 2020, price: 19990000, mileage: 85000, region: 'Maule', fuel: 'diesel', transmission: 'automatica', color: 'Negro' },
  { id: 'demo-8', demo: true, brand: 'MG', model: 'ZS', year: 2022, price: 11990000, mileage: 36000, region: 'Región Metropolitana', fuel: 'bencina', transmission: 'automatica', color: 'Rojo' },
  { id: 'demo-9', demo: true, brand: 'Chery', model: 'Tiggo 7', year: 2021, price: 13490000, mileage: 44000, region: 'Antofagasta', fuel: 'bencina', transmission: 'automatica', color: 'Gris' },
  { id: 'demo-10', demo: true, brand: 'Volkswagen', model: 'Polo', year: 2020, price: 10990000, mileage: 52000, region: 'Región Metropolitana', fuel: 'bencina', transmission: 'manual', color: 'Blanco' },
  { id: 'demo-11', demo: true, brand: 'Mazda', model: 'CX-5', year: 2019, price: 17490000, mileage: 72000, region: 'Región Metropolitana', fuel: 'bencina', transmission: 'automatica', color: 'Rojo' },
  { id: 'demo-12', demo: true, brand: 'Honda', model: 'CR-V', year: 2020, price: 19990000, mileage: 61000, region: 'Región Metropolitana', fuel: 'bencina', transmission: 'automatica', color: 'Negro' },
  { id: 'demo-13', demo: true, brand: 'Renault', model: 'Kwid', year: 2021, price: 7990000, mileage: 40000, region: 'Coquimbo', fuel: 'bencina', transmission: 'manual', color: 'Naranja' },
  { id: 'demo-14', demo: true, brand: 'RAM', model: '700', year: 2022, price: 10990000, mileage: 28000, region: 'Región Metropolitana', fuel: 'bencina', transmission: 'manual', color: 'Blanco' },
  { id: 'demo-15', demo: true, brand: 'Jeep', model: 'Renegade', year: 2019, price: 14990000, mileage: 66000, region: 'Valparaíso', fuel: 'bencina', transmission: 'automatica', color: 'Verde' },
  { id: 'demo-16', demo: true, brand: 'Kia', model: 'Sportage', year: 2021, price: 16990000, mileage: 49000, region: 'Región Metropolitana', fuel: 'bencina', transmission: 'automatica', color: 'Gris' },
  { id: 'demo-17', demo: true, brand: 'Kia', model: 'Soluto', year: 2020, price: 8990000, mileage: 55000, region: 'Región Metropolitana', fuel: 'bencina', transmission: 'automatica', color: 'Blanco' },
  { id: 'demo-18', demo: true, brand: 'Toyota', model: 'RAV4', year: 2019, price: 18990000, mileage: 78000, region: 'Región Metropolitana', fuel: 'bencina', transmission: 'automatica', color: 'Plata' },
  { id: 'demo-19', demo: true, brand: 'Suzuki', model: 'Baleno', year: 2021, price: 9490000, mileage: 38000, region: 'Región Metropolitana', fuel: 'bencina', transmission: 'manual', color: 'Azul' },
  { id: 'demo-20', demo: true, brand: 'Hyundai', model: 'Accent', year: 2019, price: 8490000, mileage: 70000, region: 'Región Metropolitana', fuel: 'bencina', transmission: 'manual', color: 'Rojo' },
  { id: 'demo-21', demo: true, brand: 'Ford', model: 'Territory', year: 2022, price: 20990000, mileage: 34000, region: 'Región Metropolitana', fuel: 'bencina', transmission: 'automatica', color: 'Blanco' },
  { id: 'demo-22', demo: true, brand: 'Peugeot', model: '2008', year: 2021, price: 14490000, mileage: 41000, region: 'Región Metropolitana', fuel: 'bencina', transmission: 'automatica', color: 'Gris' },
  { id: 'demo-23', demo: true, brand: 'Chevrolet', model: 'Sail', year: 2019, price: 6990000, mileage: 82000, region: 'Región Metropolitana', fuel: 'bencina', transmission: 'manual', color: 'Blanco' },
  { id: 'demo-24', demo: true, brand: 'Toyota', model: 'Hilux', year: 2018, price: 22990000, mileage: 110000, region: 'Antofagasta', fuel: 'diesel', transmission: 'manual', color: 'Plata' },
];
