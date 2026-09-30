export type GlossaryCategory =
  | 'propulsion'
  | 'transmission'
  | 'battery'
  | 'specs'
  | 'buying';

export interface GlossaryEntry {
  id: string;
  term: string;
  aliases: string[];
  short: string;
  definition: string;
  category: GlossaryCategory;
}

export const GLOSSARY_CATEGORIES: Array<{ id: GlossaryCategory; label: string; description: string }> = [
  { id: 'propulsion', label: 'Propulsión y combustibles', description: 'Qué significa cada tipo de motor y combustible.' },
  { id: 'transmission', label: 'Transmisión', description: 'Tipos de caja y cómo se comportan en el uso diario.' },
  { id: 'battery', label: 'Batería y carga', description: 'Autonomía, capacidad y velocidades de carga de los eléctricos.' },
  { id: 'specs', label: 'Fichas técnicas', description: 'Las cifras que ves en cada ficha y cómo leerlas.' },
  { id: 'buying', label: 'Compra y trámites', description: 'Costos, impuestos y documentos del proceso de compra en Chile.' },
];

export const GLOSSARY: GlossaryEntry[] = [
  {
    id: 'gasolina',
    term: 'Gasolina',
    aliases: ['bencina', 'nafta'],
    short: 'Motor de combustión tradicional que quema bencina.',
    definition:
      'El motor más común en Chile. Usa bencina (nafta) y no requiere enchufe ni batería de tracción. Su consumo se mide en km por litro: a mayor cifra, menor gasto por kilómetro.',
    category: 'propulsion',
  },
  {
    id: 'diesel',
    term: 'Diésel',
    aliases: ['diesel'],
    short: 'Motor de alta durabilidad y mejor rendimiento en carretera.',
    definition:
      'Ofrece más torque a bajas revoluciones y mejor autonomía en ruta. En ciudad, con tráfico y viajes cortos, su rendimiento se pierde y puede sufrir el filtro de partículas.',
    category: 'propulsion',
  },
  {
    id: 'electrico',
    term: 'Eléctrico (EV)',
    aliases: ['ev', 'vehículo eléctrico', 'full electric'],
    short: '100% eléctrico: sin motor a combustión ni emisiones de escape.',
    definition:
      'Se mueve solo con batería y motor eléctrico. No usa bencina ni diésel. Su consumo se expresa en kWh/100 km y su autonomía en kilómetros por carga.',
    category: 'propulsion',
  },
  {
    id: 'hibrido',
    term: 'Híbrido (HEV)',
    aliases: ['hev', 'híbrido', 'híbrido tradicional'],
    short: 'Combustión y electricidad combinadas, sin enchufar.',
    definition:
      'Lleva motor a combustión y un motor eléctrico pequeño que asiste en aceleraciones y recupera energía al frenar. No se enchufa: la batería se carga sola. Ideal en ciudad y reduce el consumo sin cambiar tus hábitos.',
    category: 'propulsion',
  },
  {
    id: 'mhev',
    term: 'Híbrido ligero (MHEV)',
    aliases: ['mhev', '48v', 'híbrido suave'],
    short: 'Ayuda eléctrica mínima sobre un motor tradicional.',
    definition:
      'Usa una batería de 48 voltios para asistir al motor a combustión y alimentar accesorios. No puede moverse solo en eléctrico, pero baja el consumo entre un 5% y un 15%.',
    category: 'propulsion',
  },
  {
    id: 'hibrido_enchufable',
    term: 'Híbrido Enchufable (PHEV)',
    aliases: ['phev', 'híbrido enchufable', 'enchufable'],
    short: 'Se enchufa: circula en eléctrico y también con bencina.',
    definition:
      'Batería más grande que un híbrido común, con autonomía eléctrica de decenas de kilómetros. Puede recorrer distancias cortas sin quemar bencina y, si no hay carga, sigue funcionando como híbrido normal. Requiere enchufe o cargador.',
    category: 'propulsion',
  },
  {
    id: 'automatica',
    term: 'Transmisión automática',
    aliases: ['automática', 'automatica', 'caja automática'],
    short: 'Caja que cambia las marchas sola, sin pedal de embrague.',
    definition:
      'El vehículo selecciona la marcha según vueltas del motor y velocidad. Reduce la fatiga en ciudad y es la opción predominante en el mercado chileno actual.',
    category: 'transmission',
  },
  {
    id: 'manual',
    term: 'Transmisión manual',
    aliases: ['manual', 'caja manual'],
    short: 'Caja con palanca de cambios y pedal de embrague.',
    definition:
      'El conductor selecciona la marcha. Suele ser más económica de mantener y entrega control total, pero exige más trabajo en el tráfico.',
    category: 'transmission',
  },
  {
    id: 'cvt',
    term: 'CVT (variador continuo)',
    aliases: ['cvt', 'variador continuo'],
    short: 'Caja sin marchas fijas: mantiene el motor en su punto más eficiente.',
    definition:
      'El Continuous Variable Transmission no tiene relaciones fijas, sino una banda de relación variable. Entrega un consumo bajo y aceleración suave. En pedal a fondo puede sentirse "elástico", porque el motor sube de vueltas y ahí se queda un instante.',
    category: 'transmission',
  },
  {
    id: 'dct',
    term: 'DCT (doble embrague)',
    aliases: ['dct', 'doble embrague', 'dsg', 'powershift'],
    short: 'Doble embrague: cambios rápidos sin interrupción de potencia.',
    definition:
      'Tiene dos embragues trabajando en paralelo: mientras una marcha está engranada, la siguiente ya está preparada. Cambios casi instantáneos y buen rendimiento. En tráfico muy lento puede dar tirones.',
    category: 'transmission',
  },
  {
    id: 'torque',
    term: 'Torque',
    aliases: ['torque', 'nm', 'par motor'],
    short: 'La fuerza de giro del motor: lo que "empuja" el auto.',
    definition:
      'Se mide en Newton-metro (Nm). Es la sensación de arranque y de paso de adelantamiento, no la velocidad máxima. Un alto torque a bajas vueltas se siente en ciudad y en cuestas.',
    category: 'specs',
  },
  {
    id: 'hp',
    term: 'Potencia (HP / CV / kW)',
    aliases: ['hp', 'cv', 'kw', 'potencia', 'caballos'],
    short: 'Qué tan rápido puede entregar energía el motor.',
    definition:
      'HP (caballos de fuerza), CV (caballos fiscales) y kW (kilovatios) son unidades del mismo fenómeno. Más potencia = más velocidad final y mejor comportamiento en autopista. 1 HP ≈ 0,746 kW.',
    category: 'specs',
  },
  {
    id: 'kwh',
    term: 'kWh (kilovatios-hora)',
    aliases: ['kwh', 'kilovatio hora'],
    short: 'La "capacidad del tanque" de un auto eléctrico.',
    definition:
      'Mide cuánta energía guarda la batería. A mayor kWh, mayor autonomía y mayor peso. Es análogo a los litros de un tanque de bencina.',
    category: 'battery',
  },
  {
    id: 'autonomia',
    term: 'Autonomía',
    aliases: ['autonomía', 'alcance', 'range'],
    short: 'Kilómetros que recorre con una carga completa.',
    definition:
      'En eléctricos se expresa en km por carga. La cifra de fábrica es de laboratorio: en carretera fría o a alta velocidad la autonomía real baja; en ciudad, donde se recupera energía al frenar, sube.',
    category: 'battery',
  },
  {
    id: 'carga_rapida',
    term: 'Carga rápida (DC)',
    aliases: ['carga rápida', 'carga dc', 'corriente continua', 'fast charge'],
    short: 'Corriente continua: recarga gran parte de la batería en minutos.',
    definition:
      'Usa corriente continua y estaciones de alta potencia. Suele llevar de 10% a 80% en 20–40 minutos. La carga en corriente alterna (hogar) es más lenta pero mejor para la vida de la batería.',
    category: 'battery',
  },
  {
    id: 'consumo_mixto',
    term: 'Consumo mixto',
    aliases: ['consumo mixto', 'km/l', 'l/100km'],
    short: 'Rendimiento combinando ciudad y carretera.',
    definition:
      'Es la cifra más realista comparativa entre autos. En Chile se da en km por litro: a mayor número, menor costo por kilómetro. El consumo real depende de tráfico, llantas, carga y estilo de manejo.',
    category: 'specs',
  },
  {
    id: 'traccion',
    term: 'Tracción',
    aliases: ['tracción', 'traccion', 'fwd', 'rwd', 'awd', '4x4'],
    short: 'Qué ruedas reciben la potencia del motor.',
    definition:
      'Delantera (FWD): económica y estable. Trasera (RWD): mejor reparto en deportivos. Integral (AWD/4x4): más adherencia en agua, ripio o nieve. En ciudad y asfalto seco la diferencia es mínima.',
    category: 'specs',
  },
  {
    id: 'euro_ncap',
    term: 'Euro NCAP',
    aliases: ['euro ncap', 'estrellas', 'calificación de seguridad'],
    short: 'Prueba de choque europea que califica con estrellas de seguridad.',
    definition:
      'Cinco estrellas es la máxima. Evalúa protección de adultos, de niños, de peatones y sistemas de asistencia. Un auto con 5 estrellas y buen puntaje en asistencia es más seguro en la vida real.',
    category: 'specs',
  },
  {
    id: 'airbags',
    term: 'Airbags',
    aliases: ['airbag', 'airbags', 'bolsas de aire'],
    short: 'Bolsas de aire que se despliegan en un impacto.',
    definition:
      'La cifra indica cuántos hay: frontales, laterales, de cortina, de rodillas y para los pasajeros traseros. Más airbags y cinturones pretensores reducen lesiones en choques laterales y vuelco.',
    category: 'specs',
  },
  {
    id: 'entre_ejes',
    term: 'Entre ejes',
    aliases: ['entre ejes', 'wheelbase', 'distancia entre ejes'],
    short: 'Distancia entre las ruedas delanteras y traseras.',
    definition:
      'A mayor entre ejes, más espacio para las piernas de los pasajeros traseros y mayor estabilidad en carretera, a costa de un radio de giro más amplio.',
    category: 'specs',
  },
  {
    id: 'kilometraje',
    term: 'Kilometraje',
    aliases: ['kilometraje', 'kilometraje declarado', 'kms'],
    short: 'Kilómetros recorridos desde que el auto salió de planta.',
    definition:
      'No es lo mismo un auto de 100.000 km de autopista que uno de 100.000 km en tráfico de ciudad. Verifica el kilometraje con el historial de mantención y la revisión técnica.',
    category: 'buying',
  },
  {
    id: 'depreciacion',
    term: 'Depreciación',
    aliases: ['depreciación', 'depreciacion', 'pérdida de valor'],
    short: 'Cuánto pierde el auto de valor cada año.',
    definition:
      'Es el costo oculto más grande de tener un auto: un vehículo puede perder entre un 10% y un 20% de su valor por año según marca, demanda y estado. Los autos populares y los SUV conservan mejor su precio.',
    category: 'buying',
  },
  {
    id: 'tco',
    term: 'TCO (costo total de propiedad)',
    aliases: ['tco', 'costo total', 'costo total de propiedad'],
    short: 'Todo lo que cuesta el auto en un año, más allá del precio.',
    definition:
      'Suma seguro, permiso de circulación, mantención, combustible o carga y la depreciación. Comparar por TCO es más honesto que comparar solo el precio de compra.',
    category: 'buying',
  },
  {
    id: 'cae',
    term: 'CAE',
    aliases: ['cae', 'costo anual equivalente'],
    short: 'El costo real anual de un crédito, con todo incluido.',
    definition:
      'El Costo Anual Equivalente expresa en porcentaje lo que pagas de verdad por un crédito, incluyendo seguros, gastos y comisiones. Permite comparar ofertas de bancos y financieras en igualdad de condiciones.',
    category: 'buying',
  },
  {
    id: 'soap',
    term: 'SOAP',
    aliases: ['soap', 'seguro obligatorio'],
    short: 'Seguro Obligatorio de Accidentes Personales: anual y obligatorio.',
    definition:
      'Cubre a los ocupantes del vehículo y se paga una vez al año al registrar la revisión técnica. Su valor depende del peso del auto y del tramo de precio.',
    category: 'buying',
  },
  {
    id: 'permiso_circulacion',
    term: 'Permiso de circulación',
    aliases: ['permiso de circulación', 'permiso de circulacion'],
    short: 'Impuesto municipal anual para circular por el país.',
    definition:
      'Se paga en enero o febrero por la comuna donde está radicado el auto. Se calcula sobre la tasación SII del vehículo con una tasa progresiva y un mínimo en UTM.',
    category: 'buying',
  },
  {
    id: 'transferencia',
    term: 'Transferencia',
    aliases: ['transferencia', 'traspaso', 'endoso'],
    short: 'Cambio de titularidad del vehículo ante el Registro Civil.',
    definition:
      'Requiere formulario de transferencia, revisión técnica al día, permiso de circulación y comprobante de venta. Se hace en el Registro de Vehículos Motorizados o en notarías.',
    category: 'buying',
  },
];

const normalizedIndex = new Map<string, GlossaryEntry>();
for (const entry of GLOSSARY) {
  normalizedIndex.set(entry.id, entry);
  normalizedIndex.set(entry.term.toLowerCase(), entry);
  for (const alias of entry.aliases) normalizedIndex.set(alias.toLowerCase(), entry);
}

export function getGlossaryTerm(key: string): GlossaryEntry | undefined {
  return normalizedIndex.get(key.toLowerCase());
}

export function searchGlossary(query: string): GlossaryEntry[] {
  const needle = query.trim().toLowerCase();
  if (!needle) return GLOSSARY;
  return GLOSSARY.filter(
    (entry) =>
      entry.term.toLowerCase().includes(needle) ||
      entry.short.toLowerCase().includes(needle) ||
      entry.definition.toLowerCase().includes(needle) ||
      entry.aliases.some((alias) => alias.toLowerCase().includes(needle)),
  );
}
