# BoletoClick Frontend 🎫✨

BoletoClick es el cliente web interactivo y responsivo para la plataforma de gestión, reserva y compra de boletos para eventos. Diseñado para ofrecer una experiencia fluida e intuitiva tanto para compradores como para organizadores de eventos.

---

## 🔗 Demostraciones y Producción

La aplicación frontend se encuentra desplegada y lista para su uso en producción:

* **Sitio Web Activo (Deploy):** [https://boletoclick-front.vercel.app/](https://boletoclick-front.vercel.app/)

---

## 🎨 Características Principales (UX/UI)

* **Exploración de Eventos Interactiva:** Buscador avanzado y filtros geográficos dinámicos por provincias y municipios dominicanos con soporte visual de mapas (**Mapbox**).
* **Flujo de Checkout Seguro (Stripe):** Compra de boletos fluida e integrada con Stripe, con visualización de resúmenes de órdenes, cupones de descuento y control de temporizadores de reserva.
* **Panel del Organizador (Dashboard):** Vista administrativa con estadísticas de ventas utilizando gráficos interactivos (**Recharts**), creación de eventos y gestión de tipos de boletos.
* **Asistente Virtual con IA:** Ventana de chatbot flotante asistido por IA para resolver dudas recurrentes de los usuarios.
* **Lector de Códigos QR integrado:** Capacidad para escanear y validar códigos QR directamente desde la cámara del dispositivo para el acceso a eventos.
* **Generación de Entradas en PDF:** Descarga de boletos electrónicos en formato PDF listos para imprimir o guardar.

---

## 🛠️ Stack Tecnológico

* **Framework Principal:** [Next.js](https://nextjs.org/) (v16 / React 19) con soporte para App Router, optimización de imágenes y renderizado híbrido.
* **Estilos y Componentes:** [Tailwind CSS v4](https://tailwindcss.com/) para estilos utilitarios modernos y [Flowbite React](https://flowbite-react.com/) como biblioteca de componentes interactivos y accesibles.
* **Animaciones:** [Framer Motion](https://www.framer.com/motion/) para transiciones suaves y micro-interacciones.
* **Autenticación e Integración SSR:** [@supabase/ssr](https://supabase.com/docs/guides/auth/server-side-rendering) y `@supabase/supabase-js` para control de sesiones tanto del lado del cliente como del servidor.
* **Formularios y Validaciones:** **Formik** en combinación con **Yup** para validaciones robustas de entrada de datos en formularios complejos.
* **Mapas:** [Mapbox GL](https://docs.mapbox.com/mapbox-gl-js/api/) para la renderización de recintos y venues.
* **Gráficos:** **Recharts** para reportes visuales en los paneles de control.
* **Notificaciones:** **Sonner** (toasts rápidos) y **SweetAlert2** para alertas de confirmación interactivas.

---

## 📁 Estructura del Proyecto

El proyecto sigue la convención estándar del App Router de Next.js dentro de la carpeta `/src`:

```text
src/
├── app/                  # Rutas de la aplicación (páginas, layouts, middleware)
├── components/           # Componentes visuales reutilizables (Botones, Modales, Cards)
│   ├── common/           # Componentes globales de interfaz
│   ├── dashboard/        # Componentes del panel del organizador/administrador
│   └── events/           # Componentes del flujo de eventos y compra
├── context/              # Contextos globales de React (Estado del carrito, etc.)
├── hooks/                # Custom hooks útiles (geolocalización, fetching)
├── services/             # Clientes de API y peticiones al backend
└── utils/                # Funciones auxiliares y formateadores de datos
```

---

## 🚀 Instalación y Ejecución Local

### Requisitos Previos
* Node.js (v18 o superior)
* Servidor backend de **BoletoClick API** en ejecución (o la URL de producción configurada)

### Pasos para Configurar

1. **Navegar a la carpeta del frontend:**
   ```bash
   cd client
   ```

2. **Instalar dependencias:**
   ```bash
   npm install
   ```

3. **Configurar variables de entorno:**
   Crea un archivo local `.env.local` basado en la plantilla de ejemplo:
   ```bash
   cp .env.example .env.local
   ```
   *Rellena el archivo `.env.local` con las URLs correctas del backend, tus claves públicas de Supabase, tokens de Mapbox y la clave pública de Stripe.*

4. **Iniciar el servidor de desarrollo:**
   ```bash
   npm run dev
   ```
   *La aplicación estará disponible en [http://localhost:3002](http://localhost:3002).*

5. **Construir para producción:**
   ```bash
   npm run build
   npm run start
   ```
