import { FormEvent, useState } from 'react';
import { Link } from 'react-router-dom';
import { SEO } from '../components/SEO';
import { Breadcrumbs } from '../components/Breadcrumbs';
import { track } from '../lib/analytics';
import { SUPPORT_EMAIL, SUPPORT_WHATSAPP, SUPPORT_WHATSAPP_LABEL } from '../config/support';

const card = 'rounded-2xl bg-white dark:bg-gray-800 p-6 card-shadow';
const h2 = 'text-xl font-bold text-gray-900 dark:text-white mb-3';
const p = 'text-sm leading-relaxed text-gray-600 dark:text-gray-300';

export function AboutPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <SEO
        title="Quiénes somos | AutoLupa"
        description="AutoLupa es un marketplace y comparador de autos para Chile. Conoce cómo funcionamos, cómo nos financiamos y qué hacemos para reducir el riesgo de fraude."
      />
      <Breadcrumbs items={[{ label: 'Quiénes somos' }]} />
      <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white mb-4">Quiénes somos</h1>
      <p className="text-lg text-gray-600 dark:text-gray-300 mb-8">
        AutoLupa nació para que comprar o vender un auto usado en Chile sea más claro: menos letra chica, más datos y
        herramientas gratuitas para decidir con calma.
      </p>

      <div className="space-y-5">
        <section className={card}>
          <h2 className={h2}>Qué hacemos</h2>
          <p className={p}>
            Publicamos avisos de autos usados y comparamos modelos nuevos del mercado chileno. También ofrecemos
            simulador de crédito, cálculo de costo total de propiedad (TCO), tasador referencial y guías de compra
            segura.
          </p>
        </section>

        <section className={card}>
          <h2 className={h2}>Cómo nos financiamos</h2>
          <p className={p}>
            El uso base de AutoLupa es gratis. Nuestro modelo es freemium: los vendedores pueden destacar avisos y los
            concesionarios pueden contratar espacios de publicidad. No cobramos comisión por la venta ni intermediamos
            en el pago entre comprador y vendedor.
          </p>
          <p className={`${p} mt-3`}>
            Los avisos destacados se identifican como publicidad o contenido patrocinado. La publicidad de terceros no
            cambia el precio ni la posición de los resultados orgánicos.
          </p>
        </section>

        <section className={card}>
          <h2 className={h2}>Nuestro compromiso</h2>
          <ul className="list-disc pl-5 space-y-2 text-sm text-gray-600 dark:text-gray-300">
            <li>No pedimos transferencias ni pagos por la compra de un auto.</li>
            <li>Mostramos el correo verificado del vendedor cuando está disponible.</li>
            <li>Los avisos nuevos pasan por revisión antes de publicarse.</li>
            <li>Si algo no cuadra, puedes reportar el aviso y revisar nuestra guía de compra segura.</li>
          </ul>
        </section>

        <section className={card}>
          <h2 className={h2}>Datos legales</h2>
          <p className={p}>
            Razón social: <strong>[PENDIENTE-LEGAL]</strong> · RUT: <strong>[PENDIENTE-LEGAL]</strong> · Domicilio:
            <strong> [PENDIENTE-LEGAL]</strong>. AutoLupa cumple la Ley 19.496 de protección al consumidor y la Ley
            21.719 de protección de datos personales.
          </p>
          <p className={`${p} mt-3`}>
            ¿Necesitas ejercer tus derechos sobre tus datos? Usa <Link to="/tus-datos" className="text-blue-600 dark:text-blue-400 font-semibold">Tus datos</Link> o escríbenos a{' '}
            <a href={`mailto:${SUPPORT_EMAIL}`} className="text-blue-600 dark:text-blue-400 font-semibold">{SUPPORT_EMAIL}</a>.
          </p>
        </section>
      </div>
    </div>
  );
}

export function ContactPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [sent, setSent] = useState(false);

  const submit = (event: FormEvent) => {
    event.preventDefault();
    track('ContactSupport', { canal: 'formulario' });
    setSent(true);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <SEO
        title="Contacto y soporte | AutoLupa"
        description="Contacta al equipo de AutoLupa por correo, WhatsApp o formulario. Ayuda para compradores, vendedores y reportes de avisos."
      />
      <Breadcrumbs items={[{ label: 'Contacto' }]} />
      <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white mb-4">Contacto y soporte</h1>
      <p className="text-lg text-gray-600 dark:text-gray-300 mb-8">
        Respondemos dudas sobre avisos, publicación, privacidad y seguridad. No intermediamos en pagos ni
        transferencias.
      </p>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <section className={card}>
          <h2 className={h2}>Canales directos</h2>
          <ul className="space-y-4 text-sm">
            <li>
              <p className="font-semibold text-gray-900 dark:text-white">Correo de soporte</p>
              <a href={`mailto:${SUPPORT_EMAIL}`} className="text-blue-600 dark:text-blue-400">{SUPPORT_EMAIL}</a>
            </li>
            <li>
              <p className="font-semibold text-gray-900 dark:text-white">WhatsApp Business</p>
              <a href={SUPPORT_WHATSAPP} target="_blank" rel="noopener noreferrer" className="text-blue-600 dark:text-blue-400">{SUPPORT_WHATSAPP_LABEL}</a>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Atención de lunes a viernes, 10:00–18:00 (hora de Chile).</p>
            </li>
            <li>
              <p className="font-semibold text-gray-900 dark:text-white">Reportar un aviso</p>
              <p className={p}>Desde la ficha del aviso, abre “Reportar este aviso”. Revisamos los reportes en la cola de moderación.</p>
            </li>
            <li>
              <p className="font-semibold text-gray-900 dark:text-white">Privacidad y datos</p>
              <Link to="/tus-datos" className="text-blue-600 dark:text-blue-400">Ejercer derechos Ley 21.719</Link>
            </li>
          </ul>
        </section>

        <section className={card}>
          <h2 className={h2}>Formulario</h2>
          {sent ? (
            <div role="status" className="rounded-xl bg-green-50 dark:bg-green-950/40 p-4 text-sm text-green-800 dark:text-green-200">
              Recibimos tu mensaje. Te responderemos a <strong>{email}</strong> dentro de 2 días hábiles.
            </div>
          ) : (
            <form onSubmit={submit} className="space-y-3">
              <label className="block text-sm">
                <span className="block text-xs font-semibold text-gray-600 dark:text-gray-300 mb-1">Nombre</span>
                <input required value={name} onChange={e => setName(e.target.value)} className="w-full px-3 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm" />
              </label>
              <label className="block text-sm">
                <span className="block text-xs font-semibold text-gray-600 dark:text-gray-300 mb-1">Correo</span>
                <input required type="email" value={email} onChange={e => setEmail(e.target.value)} className="w-full px-3 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm" />
              </label>
              <label className="block text-sm">
                <span className="block text-xs font-semibold text-gray-600 dark:text-gray-300 mb-1">Mensaje</span>
                <textarea required rows={5} value={message} onChange={e => setMessage(e.target.value)} className="w-full px-3 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm" placeholder="Cuéntanos qué necesitas. No incluyas datos de tarjetas ni claves." />
              </label>
              <button type="submit" className="w-full px-5 py-3 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 transition-colors">Enviar mensaje</button>
              <p className="text-xs text-gray-500 dark:text-gray-400">Al enviar aceptas nuestra <Link to="/privacidad" className="underline">política de privacidad</Link>.</p>
            </form>
          )}
        </section>
      </div>
    </div>
  );
}

export function HowItWorksPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <SEO
        title="Cómo funciona AutoLupa | Compra y venta segura"
        description="Cómo publicar un auto, cómo contactar al vendedor y cómo comprar usado con más seguridad en Chile."
      />
      <Breadcrumbs items={[{ label: 'Cómo funciona' }]} />
      <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white mb-4">Cómo funciona</h1>
      <p className="text-lg text-gray-600 dark:text-gray-300 mb-8">
        AutoLupa conecta compradores y vendedores, pero no intermedia en el pago ni en la transferencia del vehículo.
        Estos son los pasos y las reglas de seguridad.
      </p>

      <div className="space-y-5">
        <section className={card}>
          <h2 className={h2}>Si quieres comprar</h2>
          <ol className="list-decimal pl-5 space-y-2 text-sm text-gray-600 dark:text-gray-300">
            <li>Filtra por marca, año, precio, kilometraje y región.</li>
            <li>Revisa la ficha: fotos, descripción, correo verificado y avisos de seguridad.</li>
            <li>Contacta al vendedor desde la ficha. No compartas claves ni códigos de verificación.</li>
            <li>Revisa el auto en persona, idealmente en un lugar público y con un mecánico.</li>
            <li>Verifica la documentación antes de pagar: padrón, revisión técnica, SOAP, multas y prendas.</li>
          </ol>
        </section>

        <section className={card}>
          <h2 className={h2}>Si quieres vender</h2>
          <ol className="list-decimal pl-5 space-y-2 text-sm text-gray-600 dark:text-gray-300">
            <li>Publica gratis con fotos reales y una descripción honesta.</li>
            <li>Verifica tu correo para aumentar la confianza del aviso.</li>
            <li>El aviso pasa por revisión antes de publicarse.</li>
            <li>Responde las consultas y acuerda una revisión presencial.</li>
            <li>Firma la transferencia y entrega los documentos en el Registro Civil.</li>
          </ol>
        </section>

        <section className={card}>
          <h2 className={h2}>Monetización transparente</h2>
          <p className={p}>
            Publicar es gratis. Los destacados y los espacios de concesionarios son opcionales y se identifican como
            publicidad. AutoLupa no cobra comisión por venta ni exige pagos para “reservar” un auto.
          </p>
        </section>

        <section className={card}>
          <h2 className={h2}>Qué no hacemos</h2>
          <ul className="list-disc pl-5 space-y-2 text-sm text-gray-600 dark:text-gray-300">
            <li>No recibimos pagos por la compra de un vehículo.</li>
            <li>No garantizamos el estado mecánico ni la documentación de un aviso.</li>
            <li>No solicitamos transferencias, gift cards ni criptomonedas.</li>
            <li>No pedimos claves, códigos SMS ni acceso remoto a tu teléfono.</li>
          </ul>
          <p className={`${p} mt-3`}>
            Lee la <Link to="/compra-segura" className="text-blue-600 dark:text-blue-400 font-semibold">guía de compra segura</Link> antes de pagar.
          </p>
        </section>
      </div>
    </div>
  );
}

export function SafePurchasePage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <SEO
        title="Compra segura de autos usados | AutoLupa"
        description="Checklist anti-fraude para comprar un auto usado en Chile: documentación, revisión mecánica, señales de alerta y qué hacer si te intentan estafar."
      />
      <Breadcrumbs items={[{ label: 'Compra segura' }]} />
      <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white mb-4">Compra segura</h1>
      <p className="text-lg text-gray-600 dark:text-gray-300 mb-8">
        Una compra tranquila empieza por verificar. Esta guía es informativa y no reemplaza una revisión mecánica ni
        asesoría legal.
      </p>

      <div className="space-y-5">
        <section className={card}>
          <h2 className={h2}>Checklist antes de pagar</h2>
          <ul className="space-y-3 text-sm text-gray-600 dark:text-gray-300">
            {[
              'Revisa el auto en persona y en un lugar público.',
              'Pide el padrón del vehículo y compara el RUT del vendedor con el titular.',
              'Verifica la revisión técnica vigente y el certificado de emisiones.',
              'Revisa multas, prendas, prohibiciones y transferencias pendientes.',
              'Comprueba el kilometraje contra mantenciones y desgaste real.',
              'Haz una revisión mecánica independiente antes de pagar.',
              'Firma el contrato de compraventa y la transferencia en el Registro Civil.',
              'Nunca pagues por adelantado sin ver el auto y los documentos.',
            ].map(item => (
              <li key={item} className="flex gap-2">
                <span className="text-green-600 dark:text-green-400 font-bold">✓</span>
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </section>

        <section className={`${card} border-l-4 border-red-500`}>
          <h2 className={h2}>Señales de alerta</h2>
          <ul className="list-disc pl-5 space-y-2 text-sm text-gray-600 dark:text-gray-300">
            <li>El vendedor pide transferencia, Western Union, gift cards o criptomonedas antes de ver el auto.</li>
            <li>El precio está muy por debajo del mercado y hay urgencia por cerrar.</li>
            <li>Se niega a mostrar el padrón o pide datos de tarjetas por chat.</li>
            <li>Envía links externos para “pagar la reserva” o “verificar la compra”.</li>
            <li>El auto está en otra ciudad y solo se puede ver después del pago.</li>
            <li>Pide códigos SMS, claves o instalar aplicaciones de acceso remoto.</li>
          </ul>
        </section>

        <section className={card}>
          <h2 className={h2}>Documentos clave</h2>
          <p className={p}>
            Padrón del vehículo, cédula de identidad del vendedor, revisión técnica, SOAP, contrato de compraventa y
            formulario de transferencia. Si hay financiamiento, pide el certificado de alzamiento de prenda.
          </p>
          <p className={`${p} mt-3`}>
            Revisa también los <Link to="/faq" className="text-blue-600 dark:text-blue-400 font-semibold">documentos y enlaces útiles</Link> de AutoLupa.
          </p>
        </section>

        <section className={card}>
          <h2 className={h2}>Si te intentan estafar</h2>
          <p className={p}>
            Corta la conversación, guarda capturas y reporta el aviso desde su ficha. Si ya pagaste, contacta a tu banco
            y denuncia en la PDI o Carabineros. También puedes escribirnos a{' '}
            <a href={`mailto:${SUPPORT_EMAIL}`} className="text-blue-600 dark:text-blue-400 font-semibold">{SUPPORT_EMAIL}</a>.
          </p>
        </section>
      </div>
    </div>
  );
}
