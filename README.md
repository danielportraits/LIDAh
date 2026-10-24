# LIDA

**LIDA** es un prototipo inicial de aplicación web progresiva (PWA) con identidad visual oscura premium, acentos verde neón y paneles translúcidos.

> Estado honesto del proyecto: esta entrega contiene una interfaz funcional de demostración. No es todavía un servicio de mensajería de producción. No incluye cuentas reales, backend, sincronización, cifrado de extremo a extremo, subida real de multimedia ni un proveedor de IA conectado.

## Incluye

- Navegación principal: Chats, Estados, LIDA Play, Reels, Perfil y LIDA AI.
- Conversaciones locales de demostración, búsqueda, filtros y creación de contactos locales.
- Envío de mensajes guardados en el navegador.
- Estados de texto locales.
- Edición local del perfil.
- Pantallas de descubrimiento para Play y Reels.
- Interfaz de LIDA AI con respuestas de demostración claramente identificadas.
- PWA: manifest, icono SVG y service worker con caché básica.
- Documentación de arquitectura, sistema visual, funciones, seguridad y hoja de ruta.

## Ejecutar localmente

Se necesita un servidor estático porque el proyecto utiliza módulos JavaScript ES y un service worker.

### Opción A: Python

```bash
python -m http.server 8000
```

Abre `http://localhost:8000`.

### Opción B: Node

```bash
npx serve .
```

Abre la URL local indicada por la herramienta.

## Publicar en GitHub Pages

1. Crea un repositorio llamado `LIDA` (o el nombre que prefieras).
2. Sube el contenido de esta carpeta a la raíz del repositorio. No subas únicamente el ZIP.
3. En GitHub, abre **Settings → Pages**.
4. En **Build and deployment**, elige **Deploy from a branch**, selecciona `main` y la carpeta `/ (root)`.
5. Guarda y espera a que GitHub Pages publique el sitio.

El proyecto usa rutas relativas (`./`) para que pueda publicarse también como proyecto de GitHub Pages.

## Estructura

```text
LIDA/
├── index.html
├── manifest.webmanifest
├── sw.js
├── assets/icons/lida-mark.svg
├── src/
│   ├── app.js
│   ├── data/demo-data.js
│   ├── modules/
│   │   ├── dialogs.js
│   │   ├── navigation.js
│   │   └── storage.js
│   └── styles/
│       ├── base.css
│       ├── components.css
│       └── tokens.css
└── docs/
    ├── ARCHITECTURE.md
    ├── FEATURES.md
    ├── ROADMAP.md
    ├── SECURITY-PRIVACY.md
    ├── VISUAL-SYSTEM.md
    ├── REPOSITORY-CHECKLIST.md
    └── DECISIONS.md
```

## Próximo paso técnico recomendado

Validar el prototipo en móvil y escritorio, ajustar la interfaz contra las propuestas visuales aprobadas e incorporar el logo original definitivo si el archivo maestro no forma parte de esta entrega. Después, definir backend, autenticación, base de datos, sincronización, almacenamiento de medios y proveedor de IA antes de exponer funciones reales a usuarios.
