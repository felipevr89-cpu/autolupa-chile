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
];

export function getArticleBySlug(slug?: string): Article | undefined {
  if (!slug) return undefined;
  return articles.find((article) => article.slug === slug);
}
