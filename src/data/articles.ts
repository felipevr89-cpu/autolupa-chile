export interface ArticleSection {
  heading: string;
  paragraphs: string[];
  bullets?: string[];
}

export interface Article {
  slug: string;
  title: string;
  excerpt: string;
  category: string;
  date: string;
  isoDate: string;
  readTime: string;
  icon: string;
  sections: ArticleSection[];
}

export const articles: Article[] = [
  {
    slug: 'transferencia-vehiculo-chile',
    title: 'Transferencia de Vehículo en Chile: Documentos, Pasos y Después del Trámite',
    excerpt: 'Qué papeles pide el Registro Civil, cómo obtener el Certificado de Anotaciones Vigentes y qué hacer después con el permiso de circulación y el seguro.',
    category: 'Guía de compra',
    date: '30 Sep 2026',
    isoDate: '2026-09-30',
    readTime: '7 min',
    icon: '📝',
    sections: [
      {
        heading: 'Empieza por el Certificado de Anotaciones Vigentes',
        paragraphs: [
          'El Certificado de Anotaciones Vigentes (CAV) es el documento que muestra el estado legal real de un vehículo: dueños actuales y anteriores, limitaciones al dominio (prendas, embargos, restrictivas) y anotaciones marginales. Si no lo revisas antes de comprar, puedes llevarte un auto que no se puede traspasar.',
          'Se obtiene en el sitio del Registro Civil, en la opción "Vehículos → Certificado de anotaciones vigentes", ingresando la patente y pagando con ClaveÚnica. También se puede pedir en la app Civil Digital o en cualquier oficina del Registro Civil. Según ChileAtiende, el valor vigente es de $1.560 (valor referencial: confirma el monto antes de pagar).',
        ],
        bullets: [
          'Pídelo con pocos días de antigüedad: el certificado no vence, pero después de emitirse puede inscribirse una anotación nueva.',
          'Revisa que no aparezcan prendas, embargos ni denuncias de sustracción y que el titular sea la misma persona que te vende.',
          'Si aparece una limitación al dominio, no avances con la compra hasta que el vendedor la levante.',
        ],
      },
      {
        heading: 'Documentos necesarios',
        paragraphs: [
          'Chile Atiende resume los requisitos de la transferencia de dominio de vehículos motorizados: cédula de identidad vigente y permiso de circulación al día, además de los antecedentes del vehículo. En la práctica necesitas reunir lo siguiente:',
        ],
        bullets: [
          'Cédula de identidad vigente de comprador y vendedor (o poder notarial si alguno no puede asistir).',
          'Certificado de Anotaciones Vigentes del vehículo.',
          'Permiso de circulación vigente.',
          'Documento que respalde la compra: boleta de venta o factura del vehículo.',
          'Si el vehículo está en sucesión o a nombre de una empresa, los documentos que acrediten la representación o el certificado de posesión efectiva que corresponda.',
        ],
      },
      {
        heading: 'El trámite en el Registro Civil',
        paragraphs: [
          'La transferencia se realiza en cualquier oficina del Servicio de Registro Civil e Identificación, con hora reservada en línea (necesitas ClaveÚnica). Acuden comprador y vendedor con sus cédulas; si alguno envía a otra persona, se necesita la autorización correspondiente.',
          'Antes de ir, revisa en el sitio del Registro Civil la tarifa vigente y considera la tasación fiscal del vehículo, que usa el Servicio de Impuestos Internos como referencia del valor del auto.',
        ],
        bullets: [
          'Agenda la hora con anticipación: sin reserva no te atienden.',
          'Verifica que la patente, el motor y los datos de la cédula coincidan con los papeles.',
          'Guarda el comprobante de pago y el acuse de la transferencia.',
        ],
      },
      {
        heading: 'Después de firmar: los tres trámites que siguen',
        paragraphs: [
          'Terminada la transferencia en el Registro Civil, el auto ya es del comprador, pero quedan tres pendientes que evitan multas y problemas de cobertura.',
        ],
        bullets: [
          'Permiso de circulación: se renueva y actualiza a nombre del nuevo titular en la municipalidad del domicilio del vehículo.',
          'Seguro obligatorio (SOA): contratarlo o actualizar el titular para que la cobertura siga vigente.',
          'Revisión técnica y documentación: guarda la boleta o factura, el comprobante de transferencia y los antecedentes de mantención en un solo lugar.',
        ],
      },
      {
        heading: 'Cómo evitar fraudes en la compraventa',
        paragraphs: [
          'La mayoría de las estafas al comprar usados se resuelven con dos hábitos: revisar documentos antes de mirar el auto y pagar recién cuando todo está firmado.',
        ],
        bullets: [
          'Nunca transfieras dinero antes de ver el auto y el Certificado de Anotaciones Vigentes en persona.',
          'Desconfía de quien pida urgencia, un pago por adelantado o un "arriendo de carpeta": AutoLupa no cobra comisión ni gestiones.',
          'Comprueba que el VIN y el número de motor del vehículo coincidan con el permiso de circulación.',
          'Usa la boleta o factura con el precio real de la compra: es la prueba que respalda la operación.',
        ],
      },
    ],
  },
  {
    slug: 'revision-auto-usado-checklist',
    title: 'Revisión de Auto Usado Antes de Comprar: Checklist Completo',
    excerpt: 'Papeles, carrocería, interior, motor y prueba de conducción: lo que hay que revisar antes de pagar por un usado, en el orden que ahorra tiempo.',
    category: 'Guía de compra',
    date: '30 Sep 2026',
    isoDate: '2026-09-30',
    readTime: '6 min',
    icon: '🔍',
    sections: [
      {
        heading: '1. Papeles antes que auto',
        paragraphs: [
          'La revisión empieza mirando documentos, no la carrocería. Un vehículo con restricciones al dominio no se puede traspasar, y eso se descubre en cinco minutos con el Certificado de Anotaciones Vigentes.',
        ],
        bullets: [
          'Certificado de Anotaciones Vigentes reciente y sin prendas ni embargos.',
          'Permiso de circulación al día y coincidente con la patente.',
          'Historial de mantención: boletas de service, cambios de aceite y frenos.',
          'SOA vigente y, si corresponde, revisión técnica.',
        ],
      },
      {
        heading: '2. Carrocería y pintura',
        paragraphs: [
          'Busca diferencias de color entre paneles, bordes de pintura rugosos y espacios desiguales entre puertas y capó: suelen indicar reparaciones por golpe.',
        ],
        bullets: [
          'Recorre el auto con la luz de frente y de costado: se ven mejor los repintes.',
          'Revisa el cierre de puertas y maletero: si cuesta cerrar, la carrocería se movió.',
          'Mira el estado de ruedas y frenos: cubiertas gastadas de forma irregular hablan de alineación o suspensión mal.',
          'Ópticas opacas y juntas resecas suman costos de mantención inmediatos.',
        ],
      },
      {
        heading: '3. Interior y electrónica',
        paragraphs: [
          'El interior muestra cómo se usó el auto: un tablero con desgaste en el volante y pedaleras muy gastados no calzan con un kilometraje bajo.',
        ],
        bullets: [
          'Enciende todo: aire acondicionado, ventanas, espejos, luces, cámara y sensores.',
          'Revisa que las bolsas de aire no estén abiertas ni el tablero reparado de forma evidente.',
          'Verifica que los testigos del tablero se apaguen al arrancar.',
          'Olor a humo o a humedad: son reparaciones caras de eliminar.',
        ],
      },
      {
        heading: '4. Motor y mecánica',
        paragraphs: [
          'Con el motor frío revisa niveles y ruidos; con él caliente, vigila humo y pérdida de potencia.',
        ],
        bullets: [
          'Nivel y color del aceite y del anticongelante, sin restos sucios en la tapa.',
          'Humo azul (aceite), blanco persistente (juntas) o negro (combustible) son motivos para bajar el precio o no comprar.',
          'Escucha el motor: golpes metálicos o rechinidos no son normales.',
          'En frenos, no debe haber vibración en el volante; en suspensión, no debe haber traqueteo en los badenes.',
        ],
      },
      {
        heading: '5. Prueba de conducción',
        paragraphs: [
          'Una ruta corta y variada revela más que una hora mirando el auto estacionado. Pide conducir tú (con el dueño acompañando) y recorre avenidas, un badén y una pendiente.',
        ],
        bullets: [
          'El auto debe seguir recto sin que sostengas el volante.',
          'Frena de forma progresiva: sin chirridos ni desvíos.',
          'La caja de cambios (manual o CVT) debe entrar suave, sin tirones ni ruidos.',
          'Prueba marcha atrás, climatización y las cinco marchas a velocidad de calle.',
        ],
      },
      {
        heading: '6. Kilometraje y precio',
        paragraphs: [
          'Compara el kilometraje con el desgaste real y con el historial de service. Y revisa el precio de la misma versión en el comparador: si está muy por debajo del mercado, hay un motivo.',
        ],
        bullets: [
          'Service de por medio: service anual o por kilómetro es señal de uso responsable.',
          'Kilometraje promedio razonable para un auto usado es de alrededor de 15.000 km al año; más que eso exige explicación.',
          'Compara precios por marca, modelo, año y versión antes de negociar.',
        ],
      },
      {
        heading: 'Resumen: la revisión en un minuto',
        paragraphs: [
          'Si el CAV está limpio, los papeles calzan con el vehículo, la pintura es pareja, el motor no humea y la prueba de conducción es limpia, tienes una base sólida para negociar.',
        ],
        bullets: [
          'Documentos OK → carrocería OK → interior OK → motor OK → prueba OK → precio comparado.',
          'Antes de pagar, deja por escrito el estado del auto y el precio acordado.',
          'Con dudas, no pagues: siempre aparece otro aviso.',
        ],
      },
    ],
  },
  {
    slug: 'guia-comparar-autos-chile',
    title: 'Guía para Comparar Autos en Chile: Todo lo que Necesitas Saber',
    excerpt: 'Cómo elegir el auto perfecto según tu presupuesto, necesidades y estilo de vida. Comparación de marcas chinas vs europeas vs japonesas.',
    category: 'Guía de compra',
    date: '21 Sep 2026',
    isoDate: '2026-09-21',
    readTime: '8 min',
    icon: '📖',
    sections: [
      {
        heading: 'Empieza por el costo total, no por el precio',
        paragraphs: [
          'El precio de la etiqueta es solo la puerta de entrada. El costo real de un auto incluye la cuota del crédito, el seguro obligatorio (SOA) y el complementario, el permiso de circulación, la mantención, la energía (bencina o carga) y cuánto pierde de valor cada año.',
          'Por eso en AutoLupa calculamos el TCU (Costo Total de Propiedad) de cada ficha: con un crédito francés a 48 meses y 11% anual, SOAP por tramos, seguro estimado en 1,5% del valor del vehículo, permiso de circulación con la fórmula del SII y depreciación según antigüedad.',
        ],
        bullets: [
          'Compara siempre autos de rango de precio parecido: la cuota es lo que más pesa en el mes a mes.',
          'Un auto un 15% más caro puede salir más barato al año si consume mucho menos y deprecia menos.',
          'Revisa el TCU en la ficha de cualquier modelo antes de negociar.',
        ],
      },
      {
        heading: 'Define tu uso en tres datos',
        paragraphs: [
          'Antes de mirar modelos, responde con números. Con esos tres datos filtras la mitad del catálogo en un minuto.',
        ],
        bullets: [
          'Kilómetros al mes: usamos 1.000 km/mes como base, pero si recorres 600 o 2.000 cambia la decisión sobre consumo y batería.',
          'Tipo de camino: ciudad con tapones, ruta larga o mixto. La ciudad favorece a los híbridos y eléctricos; la ruta larga a diésel y gasolina de buen consumo.',
          'Quiénes viajan: número de asientos, silla infantil (ISOFIX) y espacio de baúl para carroñola o cochecito.',
        ],
      },
      {
        heading: 'Método de comparación en 5 pasos',
        paragraphs: [
          'El comparador de AutoLupa permite filtrar por marca, tipo, combustible, precio, año, tracción y asientos, y luego ver hasta tres autos lado a lado con fichas técnicas completas.',
        ],
        bullets: [
          'Filtra con lo indispensable: presupuesto, tipo de carrocería y combustible.',
          'Reduce a tres candidatos y añádelos a la comparación.',
          'Compara ficha por ficha: potencia, consumo mixto, airbags, ISOFIX, baúl y garantía.',
          'Revisa las versiones de cada modelo: el nivel de equipamiento cambia el precio y la seguridad.',
          'Abre el TCU y ajusta los kilómetros al mes a tu caso real.',
        ],
      },
      {
        heading: 'Qué mirar en cada ficha',
        paragraphs: [
          'Estos son los campos que más cambian la decisión y que en AutoLupa están visibles para todos los autos del catálogo.',
        ],
        bullets: [
          'Seguridad: cantidad de airbags, ISOFIX y asistentes disponibles en la versión.',
          'Consumo mixto en km/L (o autonomía eléctrica en km y batería en kWh para EV y PHEV).',
          'Espacio: largo, distancia entre ejes y litros de baúl.',
          'Garantía en años y kilometraje, que es el respaldo real del fabricante.',
          'Origen del vehículo y red de postventa disponible en tu ciudad.',
        ],
      },
      {
        heading: 'Errores comunes al comparar',
        paragraphs: [
          'La mayoría de las compras arrepentidas vienen de estos descuidos, todos evitables con diez minutos de revisión.',
        ],
        bullets: [
          'Comparar versiones distintas de dos modelos: siempre compara versiones equivalentes en equipamiento.',
          'Mirar solo la cuota y olvidar mantención, seguro y permiso.',
          'Decidir por el equipamiento de pantalla y sonido sin revisar airbags y asistentes.',
          'Comprar un usado sin Certificado de Anotaciones Vigentes reciente.',
          'No probar el auto en el tipo de camino que usa todos los días.',
        ],
      },
    ],
  },
  {
    slug: 'mejores-autos-familia-2026',
    title: 'Los 10 Mejores Autos Familiares en Chile 2026',
    excerpt: 'Selección por presupuesto y uso real: seguridad con airbags e ISOFIX, espacio de baúl y consumo, con precios de referencia de nuestro catálogo.',
    category: 'Rankings',
    date: '20 Sep 2026',
    isoDate: '2026-09-20',
    readTime: '6 min',
    icon: '👨‍👩‍👧‍👦',
    sections: [
      {
        heading: 'Cómo elegimos los autos familiares',
        paragraphs: [
          'Para una familia el orden de importancia es: seguridad pasiva (airbags e ISOFIX para la silla), espacio real de baúl, consumo y, recién al final, el equipamiento de confort. Todos los datos de esta guía salen de nuestro catálogo de 626 modelos y los precios son de referencia: confirma el vigente en cada ficha.',
        ],
        bullets: [
          'Airbags: consideramos 6 o más como buen equipamiento estándar.',
          'ISOFIX: obligatorio si viajan niños; está indicado en la ficha de cada modelo.',
          'Consumo mixto en km/L: lo que se traduce en la cuenta mensual.',
          'Baúl en litros: para carroñola, bolso de deporte y compra del fin de semana.',
        ],
      },
      {
        heading: 'Ciudad con presupuesto ajustado',
        paragraphs: [
          'Los tres más económicos en seguridad: el Nissan Versa llega con 10 airbags e ISOFIX por $13.990.000 (referencia 2025), el Toyota Yaris hatchback con 7 airbags y 18,5 km/L mixtos por $13.490.000, y el Suzuki Swift con 6 airbags e ISOFIX por $13.990.000.',
        ],
        bullets: [
          'Nissan Versa 2025: 10 airbags, baúl cómodo para sedán de su segmento.',
          'Toyota Yaris 2025: 7 airbags, 18,5 km/L mixtos, fácil de estacionar.',
          'Suzuki Swift 2025: 6 airbags, consumo de 21 km/L mixtos.',
        ],
      },
      {
        heading: 'Siete plazas sin gastar de más',
        paragraphs: [
          'Si la familia crece o se viaja en grupo, las opciones de siete plazas más accesibles del catálogo se concentran en minivan y SUV grandes.',
        ],
        bullets: [
          'Chevrolet Spin 2026: 7 plazas, 6 airbags, ISOFIX y 530 litros de baúl por $13.990.000.',
          'Citroën Berlingo 2025: 6 airbags, ISOFIX y 775 litros de baúl por $19.990.000.',
          'Chevrolet N400 Max y Fiat Fiorino: la ruta más barata a las 7 plazas, con menos airbags.',
        ],
      },
      {
        heading: 'SUV familiar con buena seguridad',
        paragraphs: [
          'El SUV familiar moderno combina altura de conducción, baúl usable y equipamiento de seguridad completo.',
        ],
        bullets: [
          'Toyota Corolla Cross 2025: 8 airbags, ISOFIX y 440 litros de baúl por $20.990.000.',
          'Mitsubishi ASX y Toyota Yaris Cross 2025: 7 airbags e ISOFIX desde $17.990.000.',
          'Subaru XV 2025: 7 airbags, ISOFIX y tracción integral desde $19.990.000.',
          'Changan UNI-K 2025: 7 airbags e ISOFIX con 580 litros de baúl por $21.990.000.',
        ],
      },
      {
        heading: 'Si necesitas cargar y salir de la ciudad',
        paragraphs: [
          'Para faenas, mudanzas o fin de semana en el campo, la pickup doble cabina sigue siendo la referencia.',
        ],
        bullets: [
          'Toyota Hilux 2025: 7 airbags e ISOFIX por $26.990.000.',
          'Chevrolet Montana 2025: 6 airbags e ISOFIX desde $17.920.100.',
          'Changan Hunter 2026 y Fiat Toro 2026: 6 airbags e ISOFIX desde $21.990.000.',
        ],
      },
      {
        heading: 'Antes de decidir',
        paragraphs: [
          'Cierra la decisión con una prueba real: lleva la carroñola, monta la silla y revisa los anclajes con el vendedor presente.',
        ],
        bullets: [
          'Confirma la versión exacta: el equipamiento cambia entre versiones del mismo modelo.',
          'Pide la cotización por escrito con precio, garantía y entrega.',
          'Compara hasta tres modelos en el comparador antes de ir a la sala.',
        ],
      },
    ],
  },
  {
    slug: 'autos-electricos-chile-2026',
    title: 'Guía de Autos Eléctricos en Chile: Precios, Carga y Autonomía',
    excerpt: 'Costo real de cargar en casa y en red, mantención, permiso de circulación con descuento y qué revisar antes de comprar un auto eléctrico.',
    category: 'Eléctricos',
    date: '19 Sep 2026',
    isoDate: '2026-09-19',
    readTime: '10 min',
    icon: '⚡',
    sections: [
      {
        heading: 'Dónde está hoy el eléctrico en Chile',
        paragraphs: [
          'De los 626 modelos de nuestro catálogo, 94 son 100% eléctricos y 25 son híbridos enchufables, repartidos desde autos urbanos hasta SUV y camionetas. Ya no es una categoría de nicho: hay opciones en casi todos los rangos de precio.',
          'El punto que decide la compra no es el auto, sino tu acceso a un enchufe en casa o en el trabajo.',
        ],
        bullets: [
          'Si puedes cargar donde estacionas de noche, el eléctrico rinde toda su ventaja.',
          'Si solo dependes de red pública, revisa la cobertura de carga en tus rutas habituales antes de decidir.',
        ],
      },
      {
        heading: 'Cuánto cuesta cargar',
        paragraphs: [
          'Usamos dos referencias de precio de energía: $150 por kWh cargando en casa y $350 por kWh en carga rápida. Con una batería de 60 kWh, una carga completa equivale a $9.000 en casa o $21.000 en red rápida.',
          'Como la mayoría carga mayoritariamente en casa, en nuestras cuentas usamos una mezcla 80% hogar y 20% rápida, que queda en torno a $190 por kWh.',
        ],
        bullets: [
          'Cargar de noche en casa es hasta la mitad del costo de la red rápida.',
          'La carga rápida sirve para viajes largos, no para el uso diario.',
          'Revisa la potencia de carga que soporta el auto: no todos cargan igual de rápido.',
        ],
      },
      {
        heading: 'Costo por 100 kilómetros',
        paragraphs: [
          'La ficha de cada eléctrico muestra la batería en kWh y la autonomía eléctrica declarada. Con esos dos datos calculamos el costo de carga cada 100 km en casa y en red, y lo comparamos con la bencina equivalente.',
          'Para una referencia general, un eléctrico urbano suele gastar entre 12 y 18 kWh cada 100 km; a $150 por kWh en casa, eso equivale a entre $1.800 y $2.700 cada 100 km.',
        ],
        bullets: [
          'Compara consumo real de tu ruta, no solo la autonomía de catálogo.',
          'En invierno y en autopista la autonomía baja: deja margen para tu viaje más largo.',
        ],
      },
      {
        heading: 'Mantención y permiso de circulación',
        paragraphs: [
          'Un eléctrico no tiene distribución, embrague, escape ni filtros de combustible, así que su mantención estimada es de $200.000 al año frente a $500.000 de un auto a gasolina en nuestras cuentas.',
          'Además, los eléctricos y híbridos enchufables desde 2021 pagan el 25% del permiso de circulación por la Ley 21.505 (beneficio para permisos 2026).',
        ],
        bullets: [
          'Ahorro anual estimado de mantención: $300.000 frente a un gasolina.',
          'El beneficio del permiso se aplica a eléctricos y PHEV de año 2021 en adelante.',
          'El SOA para eléctricos tiene un valor distinto al de combustión: pídelo al contratar.',
        ],
      },
      {
        heading: 'Qué revisar antes de comprar',
        paragraphs: [
          'La batería es el componente más caro y el que más condiciona la compra, sobre todo en usados.',
        ],
        bullets: [
          'Autonomía declarada vs tu ruta habitual: sumando cargas en el camino.',
          'Garantía de batería en años y kilometraje (varía según fabricante y versión).',
          'Estado de salud de la batería y ciclos de carga si es un usado.',
          'Si viajas mucho por ruta: planifica paradas de carga en tu recorrido típico.',
          'Compara precios de carga pública cerca de tu casa y de tu trabajo.',
        ],
      },
      {
        heading: 'Cómo compararlos en AutoLupa',
        paragraphs: [
          'El hub de eléctricos agrupa los modelos con marca EV, y el comparador permite filtrar por combustible eléctrico o enchufable, rango de precio y año. Cada ficha muestra batería, autonomía, costo de carga y el TCO completo.',
        ],
        bullets: [
          'Filtra por "Eléctrico" o "Híbrido enchufable" y ordena por precio.',
          'Añade hasta tres autos a la comparación y mira batería, autonomía y consumo lado a lado.',
          'Abre el TCU para ver cuánto cuesta cada mes con tus kilómetros reales.',
        ],
      },
    ],
  },
  {
    slug: 'tcu-costo-vehiculo-propiedad',
    title: 'TCU: ¿Cuánto Realmente Cuesta tu Auto al Año?',
    excerpt: 'El Costo Total de Propiedad desglosado: crédito, SOAP, seguro, permiso de circulación, mantención, energía y depreciación, con la metodología que usamos.',
    category: 'Finanzas',
    date: '18 Sep 2026',
    isoDate: '2026-09-18',
    readTime: '7 min',
    icon: '💰',
    sections: [
      {
        heading: 'Qué es el TCU',
        paragraphs: [
          'El TCU (Total Cost of Ownership, o Costo Total de Propiedad) mantiene lo que cuesta tener un auto durante un año, no solo cuánto se paga por él. Incluye todo lo que sale del bolsillo y también lo que el auto pierde de valor.',
          'La depreciación es el rubro más invisible: un auto puede costar $20.000.000 hoy y $17.000.000 al año siguiente, y ese "gasto" no aparece en ningún extracto, pero es real cuando decides revenderlo.',
        ],
        bullets: [
          'Costo fijo mensual: crédito, seguro y permiso de circulación.',
          'Costo variable: energía y mantención, que dependen de cuánto manejas.',
          'Pérdida de valor: la depreciación anual estimada según antigüedad.',
        ],
      },
      {
        heading: 'Cómo lo calcula AutoLupa',
        paragraphs: [
          'Nuestra calculadora de TCU es transparente y usa parámetros claros que puedes revisar en cada ficha.',
        ],
        bullets: [
          'Crédito francés con 11% anual y 48 meses por defecto (ajustable).',
          'SOAP 2026 por tramos: $32.000 hasta $8 millones, $48.000 hasta $15 millones, $65.000 hasta $25 millones y $85.000 sobre esa cifra.',
          'Seguro estimado en 1,5% del valor del vehículo al año.',
          'Permiso de circulación con la fórmula oficial del SII (ver guía aparte).',
          'Mantención anual según combustible: $200.000 eléctrico, $400.000 híbridos, $500.000 gasolina y $550.000 diésel.',
          'Energía: bencina a $1.300 por litro, diésel a $1.150, carga a $150/$350 por kWh.',
          'Depreciación anual: 18% si el auto tiene hasta 1 año, 12% hasta 3 años, 9% hasta 6 años y 7% después.',
        ],
      },
      {
        heading: 'Por qué el auto más barato no siempre es el más barato',
        paragraphs: [
          'Dos autos del mismo precio pueden costar muy distinto al año. Uno puede consumir 21 km/L y el otro 9 km/L: manejando 1.000 km al mes, la diferencia de combustible sola supera los $100.000 mensuales.',
          'Al mismo tiempo, un eléctrico con mantención de $200.000 anuales y permiso con 25% de descuento puede compensar una cuota inicial mayor.',
        ],
        bullets: [
          'Ordena los candidatos por TCU, no por precio de lista.',
          'Ajusta los kilómetros al mes a tu caso: el resultado cambia bastante.',
          'Si no financias, desactiva la cuota y compara costos puros de uso.',
        ],
      },
      {
        heading: 'Dónde verlo',
        paragraphs: [
          'En cualquier ficha de detalle aparece la calculadora de TCU con el desglose mes a mes: cuota, SOAP, seguro, permiso, mantención, energía y depreciación, más el costo total anual. En usados, el mismo análisis se ajusta al kilometraje del aviso.',
        ],
        bullets: [
          'Ficha del auto → sección TCU → cambia plazo y kilómetros al mes.',
          'Compara tres autos abriendo sus fichas en pestañas distintas.',
        ],
      },
      {
        heading: 'Límites de la estimación',
        paragraphs: [
          'El TCU es una herramienta de decisión, no una cotización. Los valores de SOAP, permiso de circulación y seguro se actualizan cada año y pueden variar según tu perfil y comuna.',
        ],
        bullets: [
          'Confirma el permiso de circulación en tu municipalidad y el SOAP vigente.',
          'Pide la cotización de seguro por escrito para tu auto y tu conductor.',
          'La mantención real depende del plan de servicio del fabricante.',
        ],
      },
    ],
  },
  {
    slug: 'seguros-auto-chile-comparar',
    title: 'Cómo Elegir el Mejor Seguro de Auto en Chile',
    excerpt: 'Tipos de cobertura, qué mueve el precio, cómo cotizar comparablemente y los errores más comunes al contratar el seguro del auto.',
    category: 'Finanzas',
    date: '17 Sep 2026',
    isoDate: '2026-09-17',
    readTime: '6 min',
    icon: '🛡️',
    sections: [
      {
        heading: 'El SOA no es un seguro completo',
        paragraphs: [
          'El Seguro Obligatorio de Automotores es obligatorio y cubre daños a terceros con topes de cobertura. Es lo mínimo legal: no cubre los daños a tu propio auto ni el robo. Si el auto se lo lleva un tercero sin SOA vigente, la recuperación se complica.',
          'Por eso casi todos los dueños suman una póliza complementaria.',
        ],
        bullets: [
          'Verifica que el SOA esté vigente y a nombre del titular correcto.',
          'Tras una transferencia, actualiza el titular del SOA de inmediato.',
        ],
      },
      {
        heading: 'Tipos de cobertura',
        paragraphs: [
          'Las pólizas se agrupan por cuánto cubren. La diferencia de precio entre una y otra depende del valor del auto y del deducible que elijas.',
        ],
        bullets: [
          'Daños a terceros: lo básico, con topes de responsabilidad.',
          'Todo riesgo: daños propios, robo y daños a terceros, con deducible.',
          'Adicionales: robo y/o hurto (ROB), equipo extra (EXT), cristales, grúa y asistencia en ruta.',
          'Cobertura para terceros no asegurados: relevante si muchos conductores circulan solo con SOA.',
        ],
      },
      {
        heading: 'Qué mueve el precio de la prima',
        paragraphs: [
          'Dos autos del mismo valor pueden tener primas distintas según quién conduce y dónde se usa.',
        ],
        bullets: [
          'Valor del auto y modelo (repuestos y costo de reparación).',
          'Deducible y gastos comunes: suben el descuento, bajan la prima.',
          'Región y barrio de estacionamiento nocturno.',
          'Uso diario, kilometraje anual y perfil del conductor.',
          'Historial de siniestros: la antigüedad sin accidentes suele bonificar.',
        ],
      },
      {
        heading: 'Cómo cotizar bien',
        paragraphs: [
          'La comparación solo es válida si las coberturas son idénticas. Pide siempre la cotización por escrito y compara columna por columna.',
        ],
        bullets: [
          'Cotiza al menos tres aseguradoras con la misma cobertura y el mismo deducible.',
          'Pide el desglose: prima, gastos comunes, aditamentos y descuentos.',
          'Revisa topes de responsabilidad civil y exclusiones, no solo el precio final.',
          'Renueva cada año: las primas y los descuentos cambian.',
        ],
      },
      {
        heading: 'Errores comunes',
        paragraphs: [
          'Estos deslices terminan costando plata justo cuando más se necesita la cobertura.',
        ],
        bullets: [
          'Contratar solo por el precio más barato sin revisar topes.',
          'No avisar cambios de domicilio, uso o conductor a la aseguradora.',
          'Olvidar actualizar el titular tras comprar un usado.',
          'Dejar vencer el SOA por un par de meses: multa y riesgo sin cobertura.',
        ],
      },
    ],
  },
  {
    slug: 'autos-chinos-chile-opinion',
    title: 'Autos Chinos en Chile: ¿Son Buenos? Opinión y Análisis',
    excerpt: 'Qué marcas chinas operan en Chile, qué mejoraron, los tres riesgos reales (postventa, repuestos y depreciación) y checklist para comprar con confianza.',
    category: 'Análisis',
    date: '16 Sep 2026',
    isoDate: '2026-09-16',
    readTime: '9 min',
    icon: '🇨🇳',
    sections: [
      {
        heading: 'Qué marcas chinas hay en Chile',
        paragraphs: [
          'Nuestro catálogo incluye 18 marcas chinas: BYD, Changan, Chery, Deepal, Dongfeng, GAC, Geely, GWM, Hongqi, JAC, Jaecoo, Jetour, KGM, Leapmotor, Maxus, MG, Omoda y Zeekr.',
          'Conviven en prácticamente todos los segmentos: autos urbanos, hatchbacks, SUV, pickups y vehículos 100% eléctricos. De hecho, varias de las novedades 2026 del mercado chileno son de estas marcas.',
        ],
        bullets: [
          'BYD, Zeekr y Leapmotor apuestan fuerte por lo eléctrico.',
          'Changan, Chery, GWM y MG compiten en SUV familiar y pickups.',
          'La oferta cubre desde autos urbanos hasta SUV de siete plazas.',
        ],
      },
      {
        heading: 'Qué cambiaron en los últimos años',
        paragraphs: [
          'Hace una década la objeción habitual era la calidad percibida. Hoy la conversación cambió: el equipamiento de seguridad, la conectividad y el diseño mejoraron notablemente, y varias de estas marcas lideran en venta de eléctricos en Chile.',
        ],
        bullets: [
          'Equipamiento de serie más generoso que las marcas tradicionales en el mismo rango de precio.',
          'Presencia fuerte en electrificación, con baterías y autonomías competitivas.',
          'Distribuidores con showrooms propios en las principales ciudades.',
        ],
      },
      {
        heading: 'Los tres riesgos reales',
        paragraphs: [
          'Ninguno de estos riesgos es motivo para descartar la marca, pero sí para verificarlos antes de firmar.',
        ],
        bullets: [
          'Postventa: confirma que haya taller autorizado en tu ciudad y cómo son los plazos de agenda.',
          'Repuestos: pregunta por repuestos de desgaste (embrague, amortiguadores, filtros) y plazos de importación.',
          'Depreciación: al revender, la marca con menos años en el mercado suele depreciar más rápido; compara precios de usados del mismo año.',
        ],
      },
      {
        heading: 'Checklist antes de comprar',
        paragraphs: [
          'Con estos seis puntos cubres el 90% del riesgo de una compra de marca nueva en el mercado local.',
        ],
        bullets: [
          'Taller autorizado a menos de 30 minutos de tu casa o trabajo.',
          'Plan de mantención con costos publicados por servicio.',
          'Garantía en años y kilometraje (está en la ficha de cada modelo).',
          'Disponibilidad de repuestos de desgaste y su plazo de entrega.',
          'Cotización de seguro para ese modelo específico.',
          'Prueba de conducción real, no solo vuelta a la cuadra.',
        ],
      },
      {
        heading: 'Cuándo conviene una marca china hoy',
        paragraphs: [
          'Tiene sentido cuando el presupuesto es ajustado, buscas equipamiento y seguridad de serie, y en tu ciudad hay red de postventa para esa marca.',
        ],
        bullets: [
          'Si priorizas eléctrico urbano a buen precio: hay varias opciones desde rangos accesibles.',
          'Si necesitas pickup de trabajo: compara garantía, repuestos y red de talleres antes de decidir.',
          'Si vas a revender en tres años: mira cómo se comportan los usados de esa marca en el mercado.',
        ],
      },
    ],
  },
  {
    slug: 'hibridos-vs-electricos',
    title: 'Híbridos vs Eléctricos: ¿Cuál Conviene Más en Chile?',
    excerpt: 'HEV, PHEV y eléctrico puro explicados con números: costo de energía, mantención, permiso de circulación y una matriz de decisión según tu uso.',
    category: 'Eléctricos',
    date: '15 Sep 2026',
    isoDate: '2026-09-15',
    readTime: '7 min',
    icon: '🔋',
    sections: [
      {
        heading: 'Tres tecnologías distintas',
        paragraphs: [
          'La confusión empieza por el nombre. En nuestro catálogo hay 33 híbridos no enchufables, 25 híbridos enchufables y 94 eléctricos puros.',
        ],
        bullets: [
          'Híbrido (HEV): carga con frenado y el motor de combustión; no se enchufa y no cambia tu rutina.',
          'Híbrido enchufable (PHEV): tiene batería enchufable con autonomía eléctrica corta para ciudad y sigue con motor de combustión para la ruta.',
          'Eléctrico (BEV): solo batería; depende completamente del acceso a carga.',
        ],
      },
      {
        heading: 'Costo de energía comparado',
        paragraphs: [
          'Usamos bencina a $1.300 por litro, diésel a $1.150, carga en casa a $150 por kWh y red rápida a $350 por kWh. Con esos precios, cargar en casa es consistentemente más barato que cualquier equivalente a bencina.',
          'En las cuentas del TCU consideramos un uso 100% eléctrico para BEV y PHEV, y un esquema 50% eléctrico / 50% combustión para los híbridos, porque en la práctica rara vez el PHEV se mantiene solo eléctrico.',
        ],
        bullets: [
          'Carga en casa 80% + red 20% ≈ $190 por kWh.',
          'El híbrido ahorra combustible en ciudad, no tanto en autopista.',
          'En ruta larga sin enchufe, el consumo del PHEV se parece al de un gasolina.',
        ],
      },
      {
        heading: 'Mantención y permiso de circulación',
        paragraphs: [
          'La mantención estimada anual es de $200.000 para eléctricos, $400.000 para híbridos y enchufables, y $500.000 para gasolina. Un eléctrico no cambia aceite ni filtros de combustible y tiene menos piezas móviles.',
          'A eso se suma el permiso de circulación: los eléctricos y PHEV de año 2021 o posterior pagan el 25% por la Ley 21.505.',
        ],
        bullets: [
          'Diferencia de mantención: $300.000 anuales entre eléctrico y gasolina.',
          'El beneficio del permiso aplica a EV y PHEV desde 2021.',
          'Los frenos de un eléctrico duran más por la regeneración.',
        ],
      },
      {
        heading: 'Matriz de decisión',
        paragraphs: [
          'La tecnología correcta depende de dónde cargas y cuánto recorres, no del entusiasmo por la novedad.',
        ],
        bullets: [
          'Sin enchufe en casa ni trabajo → híbrido HEV o gasolina de buen consumo.',
          'Enchufe diario y ciudad → eléctrico puro.',
          'Ciudad diaria más viajes largos de vez en cuando → PHEV.',
          'Ruta larga constante o zonas sin red de carga → gasolina o diésel.',
          'Pocos kilómetros al mes → la tecnología deja de pesar; decide por precio y equipamiento.',
        ],
      },
      {
        heading: 'Qué mirar en la ficha',
        paragraphs: [
          'Antes de comparar, revisa estos datos en los modelos que te interesan.',
        ],
        bullets: [
          'Batería en kWh y autonomía eléctrica en km (EV y PHEV).',
          'Consumo mixto en km/L para los de combustión.',
          'Costo de carga cada 100 km en casa y en red, calculado en la ficha.',
          'Garantía de batería, que es distinta a la garantía general del vehículo.',
        ],
      },
    ],
  },
  {
    slug: 'permiso-circulacion-2026',
    title: 'Permiso de Circulación 2026: Cuánto Pagarás por tu Auto',
    excerpt: 'Cómo se calcula el permiso con la fórmula del SII, la escala progresiva en UTM, el mínimo legal y el descuento del 25% para eléctricos y enchufables.',
    category: 'Finanzas',
    date: '14 Sep 2026',
    isoDate: '2026-09-14',
    readTime: '5 min',
    icon: '📋',
    sections: [
      {
        heading: 'Qué es y cuándo se paga',
        paragraphs: [
          'El permiso de circulación es un pago anual obligatorio que habilita a un vehículo a transitar por calles y caminos. Se tramita en la municipalidad del domicilio del vehículo y se paga una vez al año.',
          'Vigente el permiso, queda el comprobante en el auto; sin él, la infracción se paga aparte del propio permiso.',
        ],
        bullets: [
          'Se calcula sobre la tasación del vehículo, no sobre el precio de compra nuevo.',
          'El año del auto importa: a mayor antigüedad, menor tasación y menor permiso.',
          'Si cambias de domicilio, revisa a qué municipalidad corresponde pagar.',
        ],
      },
      {
        heading: 'Cómo se calcula (fórmula del SII)',
        paragraphs: [
          'La base es la tasación del vehículo, que se estima depreciando el valor comercial aproximadamente un 10% por año de antigüedad. Sobre esa cifra se aplica una escala progresiva.',
        ],
        bullets: [
          'Hasta 60 UTM: 1%.',
          'De 60 a 120 UTM: 2%.',
          'De 120 a 250 UTM: 3%.',
          'De 250 a 400 UTM: 4%.',
          'Sobre 400 UTM: 4,5%.',
          'Mínimo legal: media UTM. Con la UTM de enero de 2026 en $69.751, eso equivale a $34.876.',
        ],
      },
      {
        heading: 'Descuento para eléctricos y enchufables',
        paragraphs: [
          'Los vehículos 100% eléctricos y híbridos enchufables de año 2021 o posterior pagan el 25% del permiso por el beneficio de la Ley 21.505, vigente para los permisos 2026.',
          'Es una de las ventajas anuales más concretas de tener un auto electrificado, y se suma a la menor mantención.',
        ],
        bullets: [
          'Aplica a eléctricos y PHEV con año 2021 o superior.',
          'No aplica a híbridos no enchufables (HEV), que siguen con el cálculo completo.',
          'El descuento se aplica sobre el cálculo ya hecho, no sobre el precio.',
        ],
      },
      {
        heading: 'Cómo estimarlo en AutoLupa',
        paragraphs: [
          'Cada ficha de detalle incluye el cálculo del permiso dentro del TCU, con la fórmula anterior aplicada al precio y año del modelo, y el ahorro desglosado si el auto aplica al beneficio eléctrico.',
        ],
        bullets: [
          'Abre cualquier ficha y revisa la línea "Permiso circulación" del TCU.',
          'Compara cuánto cambia el pago anual entre un gasolina y un eléctrico equivalente.',
          'Para el monto exacto, confirma en tu municipalidad o en el sitio del SII: la UTM y las tasas se actualizan cada año.',
        ],
      },
      {
        heading: 'Consejos prácticos',
        paragraphs: [
          'Pequeños hábitos evitan dolores de cabeza con este trámite.',
        ],
        bullets: [
          'Paga temprano: casi siempre hay plazos con descuento según comuna.',
          'Guarda el comprobante digital junto a la revisión técnica y el SOA.',
          'Al comprar un usado, verifica que el permiso esté vigente y a nombre del titular.',
        ],
      },
    ],
  },
  {
    slug: 'autos-seguros-chile-latin-ncap',
    title: 'Los Autos Más Seguros de Chile: Cómo Elegirlos',
    excerpt: 'Qué miden Euro NCAP y Latin NCAP, cómo leer airbags e ISOFIX, y el top 10 de autos con más airbags hasta $30 millones en nuestro catálogo.',
    category: 'Rankings',
    date: '13 Sep 2026',
    isoDate: '2026-09-13',
    readTime: '6 min',
    icon: '🛡️',
    sections: [
      {
        heading: 'Qué miden los programas de seguridad',
        paragraphs: [
          'Euro NCAP y Latin NCAP realizan pruebas de choque reales y evalúan protección para adultos, para niños, para peatones y los sistemas de asistencia a la conducción. El resultado se publica por versión y año de fabricación, no por marca entera.',
          'Por eso conviene mirar la calificación vigente de la versión exacta que vas a comprar, y no la de un modelo de otro año.',
        ],
        bullets: [
          'Protección de adultos: estructura y airbags frente a choque frontal y lateral.',
          'Protección de niños: anclajes ISOFIX y ajuste del cinturón.',
          'Asistentes: control de estabilidad, frenado de emergencia y faros.',
          'Las calificaciones se actualizan cada año: revisa siempre la más reciente.',
        ],
      },
      {
        heading: 'Lo que sí puedes verificar hoy',
        paragraphs: [
          'Antes de comprar puedes comprobar por tu cuenta dos datos objetivos que están en la ficha de cualquier modelo de nuestro catálogo: cantidad de airbags y presencia de ISOFIX.',
          'El airbag cuenta: frontales, laterales, de cortina y de rodilla protegen zonas distintas. Un auto con 10 airbags cubre mucho más que uno con 2 o 4, sin importar cuántas pantallas tenga.',
        ],
        bullets: [
          'Seis airbags o más: equipamiento considerado completo hoy en día.',
          'ISOFIX: indispensable si viajan sillas infantiles.',
          'Control de estabilidad (ESC): verificar que esté en la versión que cotizas.',
          'Frenos y neumáticos en buen estado pesan tanto como el equipamiento de fábrica.',
        ],
      },
      {
        heading: 'Top 10 con más airbags hasta $30 millones',
        paragraphs: [
          'Con datos de nuestro catálogo, estos son los modelos con más airbags en rangos de precio accesibles (precios de referencia, versiones 2025-2026).',
        ],
        bullets: [
          'Nissan Versa: 10 airbags, desde $13.990.000.',
          'Nissan Sentra: 10 airbags, desde $18.990.000.',
          'Honda Civic: 10 airbags, desde $20.990.000.',
          'Nissan Qashqai: 10 airbags, desde $22.990.000.',
          'Honda ZR-V: 10 airbags, desde $24.990.000.',
          'Nissan X-Trail: 10 airbags, desde $25.990.000.',
          'Honda Accord y Honda CR-V: 10 airbags, desde $27.990.000.',
          'Toyota Camry: 10 airbags, desde $28.990.000.',
          'Toyota Corolla: 8 airbags e ISOFIX, desde $17.990.000.',
        ],
      },
      {
        heading: 'Cómo filtrar autos seguros en AutoLupa',
        paragraphs: [
          'El comparador permite filtrar por número mínimo de airbags y por asientos, y luego ver hasta tres modelos lado a lado con su ficha de seguridad completa.',
        ],
        bullets: [
          'Filtra por presupuesto y tipo, y sube el mínimo de airbags hasta 6 o más.',
          'Añade tres candidatos y compara airbags, ISOFIX, tracción y consumo.',
          'Revisa la ficha de cada modelo: la versión cambia el equipamiento.',
          'Cruza con el glosario si te encuentras un término que no conoces.',
        ],
      },
      {
        heading: 'Un airbag no lo es todo',
        paragraphs: [
          'La seguridad combina tres cosas: lo que trae el auto, el estado del vehículo y la conducción.',
        ],
        bullets: [
          'Cinturón siempre puesto en las cuatro plazas, también en trayectos cortos.',
          'Revisión técnica al día y frenos en buen estado.',
          'Neumáticos con dibujo suficiente: son el único contacto con el camino.',
          'En usados, verifica que no haya tenido choques estructurales (revisa el Certificado de Anotaciones Vigentes y el historial).',
        ],
      },
    ],
  },
];

export function getArticleBySlug(slug?: string): Article | undefined {
  if (!slug) return undefined;
  return articles.find((article) => article.slug === slug);
}
