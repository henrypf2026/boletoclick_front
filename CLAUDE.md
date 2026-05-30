# CLAUDE.md — Reglas de trabajo BoletoClick Frontend

## Rama de trabajo
- Siempre trabajar desde la rama `dev-fermin`. Nunca commitear en `dev` ni en `main`.
- Antes de arrancar cualquier tarea, hacer `git pull origin dev` para estar actualizado con el equipo.
- Un PR por tarea — no mezclar varios cambios en el mismo PR.

## Código limpio y legible
- Nombres claros y descriptivos para funciones, archivos y carpetas. Que cualquiera entienda para qué sirve sin leerlo.
- Cada módulo tiene una responsabilidad específica. Si una función se usa en muchos lados, evaluar si debe estar en un archivo compartido (`utils`, `hooks`, `services`).
- Archivos cortos. Si un archivo supera las 200 líneas, evaluar si se puede dividir.

## Componentes reutilizables
- Si un elemento UI se usa en más de un lugar, debe ser un componente en `components/ui/`.
- Componentes de layout global (Navbar, Footer, etc.) van en `components/layout/`.
- No duplicar código. Antes de crear algo nuevo, revisar si ya existe.

## Estructura de rutas
- Rutas de admin bajo `/admin/*` → archivos en `app/(admin)/admin/`.
- Rutas de producer bajo `/producer/*` → archivos en `app/(producer)/producer/`.
- Los route groups `(admin)`, `(producer)`, `(user)`, `(public)` son solo organizativos y no afectan la URL.

## Configuración de navegación
- `src/config/navigation.ts` es la fuente única de links de navbar y footer.
- Agregar, quitar o renombrar un link de navegación = cambio solo en ese archivo.

## Estilos y diseño
- Siempre usar las variables globales definidas en `globals.css` para colores y tipografía (`--primary`, `--accent`, `--text`, etc.).
- Nunca definir colores o fuentes sueltas por módulo o componente.
- Usar las clases de Tailwind que mapean esas variables (`bg-primary`, `text-accent`, `text-text-soft`, etc.).

## Estilos — Tailwind primero
- Todos los estilos con clases de Tailwind. No crear clases CSS custom salvo que sea estrictamente necesario, y en ese caso consultarlo antes.
- El archivo `globals.css` es solo para tokens globales y estilos base. No agregar estilos de componentes ahí.
- Todo el diseño debe ser responsive desde el inicio. Pensar siempre en mobile primero.

## Límites del trabajo
- Nunca tocar el repositorio del back (`boletoclick_back`). Solo se consulta para ver endpoints.

## Commits
- Siempre mostrar el mensaje del commit antes de ejecutarlo para que Fermín lo apruebe o retoque.
- El mensaje debe ser claro para que los compañeros entiendan qué cambió.

## Dependencias
- Nunca instalar una librería sin consultarlo antes.

## Errores en consola
- Si hay errores o warnings en código propio, resolverlos.
- No tocar código de otros compañeros salvo indicación explícita. Si hay dudas, preguntar.

## React Server Components
- Por defecto, todos los componentes son Server Components (sin `"use client"`).
- Usar `"use client"` solo cuando el componente necesite: estado (`useState`), efectos (`useEffect`), event handlers del browser, o APIs del cliente (localStorage, etc.).
- Nunca marcar un componente como Client Component solo "por las dudas". Justificarlo.

## TypeScript
- Evitar `any` siempre. Solo como último recurso si no hay alternativa viable.

## Idioma del código
- Pendiente de definir con el equipo (variables, funciones y archivos en español o inglés).

## Alcance de las tareas
- Mantenerse estrictamente en la tarea pedida.
- Si se detecta una mejora, feature extra o cambio no solicitado, consultarlo antes de implementarlo.
- No tomar decisiones de arquitectura o diseño sin alinearlo con el equipo.
