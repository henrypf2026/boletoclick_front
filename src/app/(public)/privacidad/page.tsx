import Link from 'next/link';

const sections = [
  {
    title: 'Responsable del tratamiento',
    content:
      'BoletoClick es responsable del tratamiento de los datos personales recopilados a través de esta plataforma. Para cualquier consulta relacionada con tus datos podés contactarnos en soporte@boletoclick.com.',
  },
  {
    title: 'Datos que recopilamos',
    content:
      'Recopilamos los datos que nos proporcionás al registrarte (nombre, correo electrónico, fecha de nacimiento, número de documento) y los que se generan al usar la plataforma (historial de compras, entradas adquiridas, preferencias de eventos). También podemos recopilar datos técnicos como dirección IP, tipo de dispositivo y navegador.',
  },
  {
    title: 'Finalidad del tratamiento',
    content:
      'Usamos tus datos para gestionar tu cuenta, procesar compras y emitir entradas digitales, enviarte confirmaciones y notificaciones de eventos, mejorar la experiencia de la plataforma, y —si lo autorizaste— enviarte comunicaciones comerciales y novedades de BoletoClick.',
  },
  {
    title: 'Base legal',
    content:
      'El tratamiento de tus datos se basa en la ejecución del contrato de uso de la plataforma, tu consentimiento explícito para comunicaciones opcionales (newsletter), y el cumplimiento de obligaciones legales aplicables.',
  },
  {
    title: 'Compartición de datos',
    content:
      'No vendemos tus datos personales a terceros. Podemos compartirlos con proveedores de servicios necesarios para operar la plataforma (procesadores de pago, servicios de correo, infraestructura en la nube) bajo contratos que garantizan el mismo nivel de protección. También podemos divulgarlos si lo exige la ley o una autoridad competente.',
  },
  {
    title: 'Retención de datos',
    content:
      'Conservamos tus datos mientras tu cuenta esté activa y por el tiempo necesario para cumplir con obligaciones legales o resolver disputas. Si eliminás tu cuenta, tus datos personales serán eliminados en un plazo máximo de 30 días, salvo los que debamos conservar por ley.',
  },
  {
    title: 'Tus derechos',
    content:
      'Tenés derecho a acceder a tus datos, rectificarlos si son inexactos, solicitar su eliminación, oponerte al tratamiento para fines de marketing, y solicitar la portabilidad de tus datos. Para ejercer cualquiera de estos derechos escribinos a soporte@boletoclick.com.',
  },
  {
    title: 'Seguridad',
    content:
      'Aplicamos medidas técnicas y organizativas para proteger tus datos contra acceso no autorizado, pérdida o alteración. Las contraseñas se almacenan de forma encriptada y las comunicaciones entre tu dispositivo y nuestra plataforma se realizan mediante HTTPS.',
  },
  {
    title: 'Cookies',
    content:
      'Utilizamos cookies esenciales para el funcionamiento de la plataforma (sesión, autenticación) y cookies de preferencias para recordar tu configuración. No utilizamos cookies de seguimiento publicitario de terceros.',
  },
  {
    title: 'Cambios en esta política',
    content:
      'Podemos actualizar esta Política de Privacidad en cualquier momento. Te notificaremos por correo electrónico o mediante un aviso en la plataforma ante cambios relevantes. La fecha de última actualización siempre estará visible al inicio de este documento.',
  },
];

export default function PrivacidadPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-12">
      <Link href="/" className="inline-flex items-center gap-1 text-sm font-bold text-text-soft hover:text-text transition-colors">
        ← Volver al inicio
      </Link>

      <div className="mt-8 border-l-4 border-primary pl-6">
        <h1 className="text-3xl font-black uppercase tracking-tight text-text">
          Política de privacidad
        </h1>
        <p className="mt-2 text-sm font-bold text-text-soft uppercase tracking-wider">
          Última actualización: junio 2026
        </p>
      </div>

      <p className="mt-6 text-base text-text-soft leading-relaxed border-l-2 border-accent pl-4">
        En BoletoClick nos tomamos en serio la privacidad de tus datos. Esta política
        explica qué información recopilamos, cómo la usamos y qué derechos tenés sobre ella.
      </p>

      <div className="mt-10 flex flex-col divide-y divide-border">
        {sections.map((section, index) => (
          <section key={section.title} className="py-7 flex gap-5">
            <span className="shrink-0 mt-0.5">
              <span className="flex items-center justify-center size-7 bg-primary text-background text-xs font-black border-2 border-border shadow-[2px_2px_0px_0px_rgba(23,23,23,1)] dark:shadow-[2px_2px_0px_0px_rgba(255,255,255,1)]">
                {index + 1}
              </span>
            </span>
            <div>
              <h2 className="text-sm font-black uppercase tracking-wide text-text">
                {section.title}
              </h2>
              <p className="mt-2 text-base leading-relaxed text-text-soft">
                {section.content}
              </p>
            </div>
          </section>
        ))}
      </div>

      <div className="mt-10 border-t-2 border-border pt-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-xs text-text-soft font-bold uppercase tracking-wider">
          ¿Tenés dudas? Escribinos a{' '}
          <a href="mailto:soporte@boletoclick.com" className="text-primary hover:underline">
            soporte@boletoclick.com
          </a>
        </p>
        <Link
          href="/terminos"
          className="text-xs font-bold text-text-soft uppercase tracking-wider hover:text-primary transition-colors whitespace-nowrap"
        >
          Ver términos y condiciones →
        </Link>
      </div>
    </div>
  );
}
