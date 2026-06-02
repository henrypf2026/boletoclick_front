import Link from 'next/link';

const sections = [
  {
    title: '1. Aceptación de los términos',
    content:
      'Al registrarte o utilizar BoletoClick, aceptas estos Términos y Condiciones en su totalidad. Si no estás de acuerdo con alguna de las disposiciones aquí establecidas, te pedimos que no utilices la plataforma.',
  },
  {
    title: '2. Descripción del servicio',
    content:
      'BoletoClick es una plataforma de venta de entradas para eventos en vivo (conciertos, partidos, espectáculos y similares). Actuamos como intermediario entre los productores de eventos y los compradores, facilitando la emisión y entrega de entradas digitales con código QR.',
  },
  {
    title: '3. Registro de cuenta',
    content:
      'Para comprar entradas debes crear una cuenta con datos verídicos. Eres responsable de mantener la confidencialidad de tu contraseña y de todas las actividades realizadas desde tu cuenta. Notifica de inmediato a BoletoClick ante cualquier uso no autorizado.',
  },
  {
    title: '4. Compra de entradas',
    content:
      'Todas las compras son definitivas salvo cancelación del evento por parte del organizador. El precio final incluye el valor de la entrada más los cargos por servicio aplicables. Una vez confirmado el pago, recibirás tu entrada digital en la sección "Mis entradas" de tu cuenta.',
  },
  {
    title: '5. Política de reembolsos',
    content:
      'Los reembolsos proceden únicamente cuando el evento es cancelado o reprogramado por el organizador. En caso de cancelación, el reembolso se acreditará en el mismo medio de pago utilizado dentro de los 10 días hábiles posteriores a la comunicación oficial. BoletoClick no es responsable de las decisiones del organizador sobre reprogramaciones.',
  },
  {
    title: '6. Prohibiciones',
    content:
      'Está prohibido revender entradas por encima del precio original, falsificar o alterar códigos QR, crear cuentas falsas o utilizar la plataforma con fines fraudulentos. BoletoClick se reserva el derecho de suspender o eliminar cuentas que incumplan estas restricciones.',
  },
  {
    title: '7. Responsabilidad del organizador',
    content:
      'El contenido, la calidad y el desarrollo del evento son responsabilidad exclusiva del productor o promotor registrado. BoletoClick no garantiza la satisfacción con el evento ni responde por cambios en artistas, horarios o locaciones dispuestos por el organizador.',
  },
  {
    title: '8. Propiedad intelectual',
    content:
      'Todos los contenidos de BoletoClick (marca, diseño, código, textos e imágenes) son propiedad de BoletoClick o de sus licenciantes. Queda prohibida su reproducción, distribución o modificación sin autorización expresa por escrito.',
  },
  {
    title: '9. Privacidad',
    content:
      'El tratamiento de tus datos personales se rige por nuestra Política de Privacidad, disponible en boletoclick.com/privacidad, y por la Ley Federal de Protección de Datos Personales en Posesión de los Particulares (LFPDPPP). Al usar la plataforma aceptas dicha política.',
  },
  {
    title: '10. Modificaciones',
    content:
      'BoletoClick puede modificar estos Términos en cualquier momento. Los cambios serán notificados por correo electrónico o mediante un aviso visible en la plataforma. El uso continuado del servicio luego de la notificación implica la aceptación de las nuevas condiciones.',
  },
  {
    title: '11. Ley aplicable',
    content:
      'Estos Términos se rigen por las leyes vigentes en los Estados Unidos Mexicanos. Ante cualquier controversia, las partes se someten a la jurisdicción de los tribunales competentes de la Ciudad de México.',
  },
];

export default function TerminosPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-12">
      <Link href="/" className="inline-flex items-center gap-1 text-sm font-bold text-text-soft hover:text-text transition-colors">
        ← Volver al inicio
      </Link>

      <div className="mt-8 border-l-4 border-primary pl-6">
        <h1 className="text-3xl font-black uppercase tracking-tight text-text">
          Términos y condiciones
        </h1>
        <p className="mt-2 text-sm font-bold text-text-soft uppercase tracking-wider">
          Última actualización: junio 2026
        </p>
      </div>

      <p className="mt-6 text-base text-text-soft leading-relaxed border-l-2 border-accent pl-4">
        Estos Términos y Condiciones regulan el uso de la plataforma BoletoClick.
        Léelos con atención antes de registrarte o realizar una compra.
      </p>

      <div className="mt-10 flex flex-col divide-y divide-border">
        {sections.map((section, index) => (
          <section key={section.title} className="py-7 flex gap-5">
            <span className="shrink-0 mt-0.5 flex items-start">
              <span className="flex items-center justify-center size-7 bg-primary text-background text-xs font-black border-2 border-border shadow-[2px_2px_0px_0px_rgba(23,23,23,1)] dark:shadow-[2px_2px_0px_0px_rgba(255,255,255,1)]">
                {index + 1}
              </span>
            </span>
            <div>
              <h2 className="text-sm font-black uppercase tracking-wide text-text">
                {section.title.replace(/^\d+\.\s/, '')}
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
          ¿Tienes dudas? Escríbenos a{' '}
          <a href="mailto:soporte@boletoclick.com" className="text-primary hover:underline">
            soporte@boletoclick.com
          </a>
        </p>
        <Link
          href="/privacidad"
          className="text-xs font-bold text-text-soft uppercase tracking-wider hover:text-primary transition-colors whitespace-nowrap"
        >
          Ver política de privacidad →
        </Link>
      </div>
    </div>
  );
}
