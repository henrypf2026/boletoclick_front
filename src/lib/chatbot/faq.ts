export interface FaqEntry {
  id: string;
  keywords: string[];
  question: string;
  answer: string;
}

export const FAQ_ENTRIES: FaqEntry[] = [
  {
    id: "comprar",
    keywords: [
      "comprar",
      "entrada",
      "entradas",
      "boleto",
      "boletos",
      "ticket",
      "tickets",
      "evento",
    ],
    question: "¿Cómo compro entradas?",
    answer:
      "Entra a Eventos, elige el show que te interesa, selecciona tipo y cantidad de boletos, y continúa con el checkout. Al pagar recibirás tu QR por correo y en Mis boletos.",
  },
  {
    id: "pago",
    keywords: [
      "pago",
      "pagar",
      "tarjeta",
      "stripe",
      "medio",
      "medios",
      "debito",
      "credito",
      "crédito",
      "débito",
      "amex",
      "american express",
      "visa",
      "carnet",
    ],
    question: "¿Qué medios de pago aceptan?",
    answer:
      "Los pagos se procesan con Stripe. Puedes pagar con American Express (AMEX), VISA y Carnet. El cargo aparece como BoletoClick en tu estado de cuenta.",
  },
  {
    id: "qr",
    keywords: ["qr", "codigo", "código", "escanear", "acceso", "puerta"],
    question: "¿Cómo uso mi entrada QR?",
    answer:
      "Abre Mis boletos, muestra el QR en la entrada del evento o descárgalo antes por si no hay internet. Cada código es único y válido para un solo acceso.",
  },
  {
    id: "reembolso",
    keywords: [
      "reembolso",
      "devolucion",
      "devolución",
      "cancelar",
      "cancelacion",
      "cancelación",
      "devolver",
    ],
    question: "¿Puedo pedir reembolso?",
    answer:
      "Las políticas dependen del productor del evento. Si el evento se cancela, el equipo te contactará. Para otros casos escríbenos a soporte@boletoclick.com con tu número de orden.",
  },
  {
    id: "productor",
    keywords: [
      "productor",
      "organizador",
      "crear evento",
      "publicar",
      "vender",
      "panel",
    ],
    question: "Soy productor, ¿cómo publico un evento?",
    answer:
      "Regístrate como productor, completa tu perfil y datos bancarios en el panel, y desde Crear evento carga fecha, recinto, boletos y precios. Cuando aprueben el evento, quedará visible en el catálogo.",
  },
  {
    id: "cuenta",
    keywords: [
      "cuenta",
      "login",
      "registro",
      "contraseña",
      "password",
      "olvidé",
      "olvide",
      "sesion",
      "sesión",
    ],
    question: "Problemas con mi cuenta",
    answer:
      "Si olvidaste tu contraseña, usa Recuperar contraseña en el login. Si no puedes entrar, verifica el correo con el que te registraste. Soporte puede ayudarte si el problema continúa.",
  },
  {
    id: "gratis",
    keywords: [
      "gratis",
      "gartis",
      "gratuito",
      "gratuita",
      "gratuitos",
      "sin costo",
      "sin pagar",
      "free",
      "cuesta cero",
      "de regalo",
      "boletos gratis",
      "boleto gratis",
      "entradas gratis",
      "entrada gratis",
      "eventos gratis",
      "evento gratis",
    ],
    question: "¿Hay eventos o boletos gratis?",
    answer:
      "No hay eventos gratis en BoletoClick. Tampoco hay boletos ni entradas gratis: todos los eventos publicados tienen un precio definido por el productor. Puedes ver el costo antes de pagar en el checkout.",
  },
  {
    id: "contacto",
    keywords: [
      "contacto",
      "soporte",
      "ayuda",
      "humano",
      "agente",
      "email",
      "correo",
      "whatsapp",
    ],
    question: "¿Cómo contacto a soporte?",
    answer:
      "Escríbenos a soporte@boletoclick.com o usa el formulario de contacto en la web. Tiempo estimado de respuesta: 24 a 48 horas hábiles.",
  },
];

export const QUICK_REPLIES = [
  "¿Cómo compro entradas?",
  "Medios de pago",
  "Mi QR de acceso",
  "Soy productor",
  "Hablar con soporte",
] as const;

export const GREETING =
  "¡Hola! Soy el asistente de BoletoClick. Solo respondo sobre eventos, venta de boletos, pagos, entradas QR, tu cuenta y el panel de productor. ¿En qué te ayudo?";

export const OFF_TOPIC = "No es posible atender tu petición.";

export const GREETING_REPLY =
  "¡Hola! Estoy aquí para ayudarte con eventos y boletos en BoletoClick. Cuéntame si quieres comprar boletos, ver medios de pago, usar tu QR o publicar un evento como productor.";

export const ALLOWED_TOPIC_KEYWORDS = [
  "boletoclick",
  "boleto",
  "boletos",
  "entrada",
  "entradas",
  "ticket",
  "tickets",
  "evento",
  "eventos",
  "concierto",
  "show",
  "festival",
  "espectaculo",
  "espectáculo",
  "recinto",
  "venue",
  "escenario",
  "comprar",
  "compra",
  "vender",
  "venta",
  "checkout",
  "pago",
  "pagar",
  "pagos",
  "orden",
  "pedido",
  "stripe",
  "tarjeta",
  "amex",
  "visa",
  "carnet",
  "debito",
  "débito",
  "credito",
  "crédito",
  "qr",
  "codigo",
  "código",
  "acceso",
  "puerta",
  "escanear",
  "reembolso",
  "devolucion",
  "devolución",
  "cancelar",
  "cancelacion",
  "cancelación",
  "productor",
  "organizador",
  "publicar",
  "panel",
  "cuenta",
  "login",
  "registro",
  "sesion",
  "sesión",
  "contraseña",
  "password",
  "soporte",
  "ayuda",
  "contacto",
  "mis tickets",
  "mis compras",
  "favorito",
  "categoria",
  "categoría",
  "precio",
  "precios",
  "gratis",
  "gartis",
  "gratuito",
  "disponible",
  "disponibilidad",
  "aforo",
  "localidad",
  "asiento",
] as const;

export const GREETING_PATTERNS = [
  "hola",
  "buenas",
  "buenos dias",
  "buenos días",
  "buenas tardes",
  "buenas noches",
  "hey",
  "saludos",
  "que tal",
  "qué tal",
] as const;
