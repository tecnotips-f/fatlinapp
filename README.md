Fatlin AI - Plataforma Tecnopedagógica (PACIE)

Fatlin AI es una aplicación web progresiva (PWA) diseñada para el aprendizaje gamificado de la metodología PACIE. El sistema utiliza Inteligencia Artificial para generar preguntas basadas en fuentes oficiales de FATLA, integrando mecánicas de juego con un sistema de recompensas y certificaciones.

🏗️ Arquitectura del Proyecto (index.html)

El archivo principal consolida una aplicación de una sola página (SPA) con las siguientes capas:

1. Núcleo PWA y Metaetiquetas

Configuración Móvil: Optimizado para iOS y Android con soporte apple-mobile-web-app-capable.

Manifiesto: Vinculado a manifest.json para permitir la instalación en dispositivos.

Tema Visual: Color principal #0ea5e9 (Cyan/Sky) para la interfaz del sistema.

2. Interfaz de Usuario (UI)

La interfaz está construida con Tailwind CSS y se divide en secciones dinámicas:

Pantalla de Carga (Splash): Un sistema de bienvenida que gestiona la transición inicial.

Contenedor Principal: Incluye el avatar del usuario, estadísticas de vida (corazones), energía (rayos) y monedas.

Sistema de Menús: Sidebar lateral y navegación inferior para acceder a diferentes secciones del juego.

Modales de Certificación: Estructura preparada para mostrar diplomas escalables mediante scaleDiploma.

3. Lógica y "Fixes" (JavaScript Integrado)

El archivo contiene un bloque de scripts crítico denominado [Fatlin fixes.js] que gestiona:

Observadores de Mutación (MutationObserver): Monitorea cambios en el DOM para corregir la visibilidad de estadísticas (fixUserVisibility) y el diseño del diploma en tiempo real.

Parches de Funcionalidad:

patchPrintButton: Gestión de impresión de certificados.

patchGenerateDiploma: Lógica de creación de documentos académicos.

fixPaywall: Control de acceso a contenido premium o restringido.

Escalado Responsivo: Una función de redimensionamiento inteligente que asegura que el certificado sea legible en cualquier tamaño de pantalla.

🛠️ Tecnologías Implementadas

Framework CSS: Tailwind CSS (vía CDN).

Iconografía: Lucide Icons.

Tipografías: Montserrat, Playfair Display y Cinzel (vía Google Fonts).

Backend: Integración con Firebase (Auth y Firestore) para persistencia de datos de usuario.

Offline: Service Worker (sw.js) para soporte sin conexión y caché de recursos estáticos.

🕹️ Mecánicas del Juego

Gestión de Energía: Los usuarios consumen recursos para participar en las actividades.

Sistema de "Rest": Lógica para la recuperación de estadísticas tras sesiones de juego.

Niveles de Certificación: Basados en el progreso del usuario dentro de la metodología PACIE.

📦 Despliegue y Ejecución

Para ejecutar la aplicación:

Asegúrese de tener configurados los archivos satélites: manifest.json y sw.js.

Abra index.html a través de un servidor local (o mediante la plataforma Fatlin).

La aplicación detectará automáticamente el estado de autenticación y cargará el perfil del usuario desde Firestore.

Documentación generada a partir del código fuente de Fatlin AI v156.
