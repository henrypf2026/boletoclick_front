import Link from 'next/link';

const channels = [
  {
    label: 'Soporte general',
    description: 'Problemas con tu cuenta, compras o entradas.',
    value: 'soporte@boletoclick.com',
    href: 'mailto:soporte@boletoclick.com',
  },
  {
    label: 'Productores y eventos',
    description: 'Consultas para publicar o gestionar eventos en la plataforma.',
    value: 'soporte@boletoclick.com',
    href: 'mailto:soporte@boletoclick.com',
  },
  {
    label: 'Reportar un problema',
    description: 'Errores técnicos, accesos no autorizados o fraude.',
    value: 'soporte@boletoclick.com',
    href: 'mailto:soporte@boletoclick.com',
  },
];

const faqs = [
  {
    question: '¿Cuánto tarda en llegar mi entrada?',
    answer:
      'Una vez confirmado el pago, tu entrada aparece de inmediato en la sección "Mis entradas". Si no la ves en los próximos minutos, revisá tu carpeta de spam o escribinos.',
  },
  {
    question: '¿Cómo pido un reembolso?',
    answer:
      'Los reembolsos aplican solo cuando el evento es cancelado por el organizador. En ese caso te notificamos por correo y el monto se acredita en el mismo medio de pago en hasta 10 días hábiles.',
  },
  {
    question: '¿Puedo transferir mi entrada a otra persona?',
    answer:
      'Por el momento las entradas son personales e intransferibles. Estamos trabajando en una funcionalidad de transferencia para próximas versiones.',
  },
  {
    question: '¿Cómo registro mi empresa como productora?',
    answer:
      'En el formulario de registro elegí la opción "Productor" e ingresá el nombre de tu empresa. Una vez creada la cuenta tenés acceso al panel de gestión de eventos.',
  },
];

export default function ContactoPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-12">
      <Link href="/" className="inline-flex items-center gap-1 text-sm font-bold text-text-soft hover:text-text transition-colors">
        ← Volver al inicio
      </Link>

      <div className="mt-8 border-l-4 border-primary pl-6">
        <h1 className="text-3xl font-black uppercase tracking-tight text-text">
          Contacto
        </h1>
        <p className="mt-2 text-sm font-bold text-text-soft uppercase tracking-wider">
          Estamos para ayudarte
        </p>
      </div>

      <p className="mt-6 text-base text-text-soft leading-relaxed border-l-2 border-accent pl-4">
        Si tenés alguna consulta sobre tu compra, tu cuenta o la plataforma, escribinos
        al correo que corresponda según tu caso. Respondemos en un plazo máximo de 48 horas hábiles.
      </p>

      <div className="mt-10 flex flex-col gap-4">
        {channels.map((channel) => (
          <a
            key={channel.label}
            href={channel.href}
            className="group flex items-start justify-between gap-4 border-2 border-border bg-surface p-5 shadow-[3px_3px_0px_0px_rgba(23,23,23,1)] dark:shadow-[3px_3px_0px_0px_rgba(255,255,255,1)] hover:-translate-y-px hover:shadow-[4px_4px_0px_0px_rgba(23,23,23,1)] dark:hover:shadow-[4px_4px_0px_0px_rgba(255,255,255,1)] transition-all duration-100"
          >
            <div>
              <p className="text-sm font-black uppercase tracking-wide text-text">
                {channel.label}
              </p>
              <p className="mt-1 text-sm text-text-soft">{channel.description}</p>
              <p className="mt-2 text-sm font-bold text-primary">{channel.value}</p>
            </div>
            <span className="shrink-0 text-text-soft group-hover:text-primary transition-colors text-lg mt-0.5">
              →
            </span>
          </a>
        ))}
      </div>

      <div className="mt-12">
        <h2 className="text-base font-black uppercase tracking-wide text-text">
          Preguntas frecuentes
        </h2>
        <div className="mt-1 h-0.5 w-12 bg-accent" />

        <div className="mt-6 flex flex-col divide-y divide-border">
          {faqs.map((faq) => (
            <div key={faq.question} className="py-5">
              <p className="text-sm font-black text-text">{faq.question}</p>
              <p className="mt-2 text-base leading-relaxed text-text-soft">{faq.answer}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-10 border-t-2 border-border pt-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <Link
          href="/terminos"
          className="text-xs font-bold text-text-soft uppercase tracking-wider hover:text-primary transition-colors whitespace-nowrap"
        >
          Términos y condiciones →
        </Link>
        <Link
          href="/privacidad"
          className="text-xs font-bold text-text-soft uppercase tracking-wider hover:text-primary transition-colors whitespace-nowrap"
        >
          Política de privacidad →
        </Link>
      </div>
    </div>
  );
}
