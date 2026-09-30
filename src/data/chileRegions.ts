import { USED_REGIONS } from './usedListings';

export interface ChileRegion {
  slug: string;
  name: (typeof USED_REGIONS)[number];
  fullName: string;
  capital: string;
  provinces: number;
  communes: number;
  cities: string[];
}

export const CHILE_REGIONS: ChileRegion[] = [
  {
    slug: 'arica-y-parinacota',
    name: 'Arica y Parinacota',
    fullName: 'Región de Arica y Parinacota',
    capital: 'Arica',
    provinces: 2,
    communes: 4,
    cities: ['Arica', 'Putre'],
  },
  {
    slug: 'tarapaca',
    name: 'Tarapacá',
    fullName: 'Región de Tarapacá',
    capital: 'Iquique',
    provinces: 2,
    communes: 7,
    cities: ['Iquique', 'Alto Hospicio', 'Pozo Almonte'],
  },
  {
    slug: 'antofagasta',
    name: 'Antofagasta',
    fullName: 'Región de Antofagasta',
    capital: 'Antofagasta',
    provinces: 3,
    communes: 9,
    cities: ['Antofagasta', 'Calama', 'Tocopilla'],
  },
  {
    slug: 'atacama',
    name: 'Atacama',
    fullName: 'Región de Atacama',
    capital: 'Copiapó',
    provinces: 3,
    communes: 9,
    cities: ['Copiapó', 'Vallenar', 'Caldera'],
  },
  {
    slug: 'coquimbo',
    name: 'Coquimbo',
    fullName: 'Región de Coquimbo',
    capital: 'La Serena',
    provinces: 3,
    communes: 15,
    cities: ['La Serena', 'Coquimbo', 'Ovalle'],
  },
  {
    slug: 'valparaiso',
    name: 'Valparaíso',
    fullName: 'Región de Valparaíso',
    capital: 'Valparaíso',
    provinces: 8,
    communes: 38,
    cities: ['Valparaíso', 'Viña del Mar', 'Quilpué', 'San Antonio'],
  },
  {
    slug: 'metropolitana',
    name: 'Metropolitana',
    fullName: 'Región Metropolitana de Santiago',
    capital: 'Santiago',
    provinces: 6,
    communes: 52,
    cities: ['Santiago', 'Puente Alto', 'Maipú', 'Las Condes'],
  },
  {
    slug: 'ohiggins',
    name: "O'Higgins",
    fullName: 'Región del Libertador General Bernardo O’Higgins',
    capital: 'Rancagua',
    provinces: 3,
    communes: 33,
    cities: ['Rancagua', 'San Fernando', 'Santa Cruz'],
  },
  {
    slug: 'maule',
    name: 'Maule',
    fullName: 'Región del Maule',
    capital: 'Talca',
    provinces: 4,
    communes: 30,
    cities: ['Talca', 'Curicó', 'Linares', 'Constitución'],
  },
  {
    slug: 'nuble',
    name: 'Ñuble',
    fullName: 'Región de Ñuble',
    capital: 'Chillán',
    provinces: 3,
    communes: 21,
    cities: ['Chillán', 'San Carlos', 'Bulnes'],
  },
  {
    slug: 'biobio',
    name: 'Biobío',
    fullName: 'Región del Biobío',
    capital: 'Concepción',
    provinces: 3,
    communes: 33,
    cities: ['Concepción', 'Talcahuano', 'Los Ángeles', 'Coronel'],
  },
  {
    slug: 'araucania',
    name: 'Araucanía',
    fullName: 'Región de La Araucanía',
    capital: 'Temuco',
    provinces: 2,
    communes: 32,
    cities: ['Temuco', 'Villarrica', 'Pucón'],
  },
  {
    slug: 'los-rios',
    name: 'Los Ríos',
    fullName: 'Región de Los Ríos',
    capital: 'Valdivia',
    provinces: 2,
    communes: 12,
    cities: ['Valdivia', 'La Unión', 'Río Bueno'],
  },
  {
    slug: 'los-lagos',
    name: 'Los Lagos',
    fullName: 'Región de Los Lagos',
    capital: 'Puerto Montt',
    provinces: 4,
    communes: 30,
    cities: ['Puerto Montt', 'Osorno', 'Castro', 'Puerto Varas'],
  },
  {
    slug: 'aysen',
    name: 'Aysén',
    fullName: 'Región de Aysén del General Carlos Ibáñez del Campo',
    capital: 'Coyhaique',
    provinces: 4,
    communes: 10,
    cities: ['Coyhaique', 'Puerto Aysén', 'Chile Chico'],
  },
  {
    slug: 'magallanes',
    name: 'Magallanes',
    fullName: 'Región de Magallanes y de la Antártica Chilena',
    capital: 'Punta Arenas',
    provinces: 4,
    communes: 11,
    cities: ['Punta Arenas', 'Puerto Natales', 'Porvenir'],
  },
];

export function getRegionBySlug(slug?: string): ChileRegion | undefined {
  if (!slug) return undefined;
  return CHILE_REGIONS.find((region) => region.slug === slug);
}

export function getRegionByName(name?: string): ChileRegion | undefined {
  if (!name) return undefined;
  return CHILE_REGIONS.find((region) => region.name === name);
}

export function regionPath(region: ChileRegion): string {
  return `/autos-usados-en/${region.slug}`;
}

export function getRegionTitle(region: ChileRegion, total: number): string {
  return total > 0
    ? `Autos usados en ${region.name}: ${total} avisos`
    : `Autos usados en ${region.name}`;
}

export function getRegionDescription(region: ChileRegion, total: number): string {
  const base = `Autos usados en la ${region.fullName}: ${region.capital} y sus comunas (${region.communes} comunas, ${region.provinces} provincias).`;
  if (total > 0) return `${base} ${total} avisos publicados hoy, con fotos, precio y contacto directo del vendedor.`;
  return `${base} Publica tu auto gratis y sé el primero de la región en aparecer aquí.`;
}

export function getRegionIntro(region: ChileRegion, total: number): string {
  const cities = region.cities.join(', ');
  const count = total > 0
    ? `Hoy hay ${total} ${total === 1 ? 'auto publicado' : 'autos publicados'} en la región.`
    : 'Todavía no hay avisos activos en la región: puedes publicar el primero gratis.';
  return `Busca y compara autos usados en la ${region.fullName}, con epicentro en ${region.capital} y avisos también en ${cities}. ${count}`;
}
