# 🏫 SIGMA - Sistema de Mantenimiento Institucional

Plataforma integral para la supervisión, control y seguimiento de infraestructura institucional (**Zonas Eléctricas**, **Estructurales & Obras** y **Recursos & Equipamiento**) desarrollada bajo **Arquitectura Hexagonal (Ports & Adapters)** con **React 19**, **Tailwind CSS v4**, **TypeScript** y servidor **Express**.

---

## 📋 Tabla de Contenido
1. [Requisitos del Sistema](#-requisitos-del-sistema)
2. [Descarga del Proyecto](#-descarga-del-proyecto)
3. [Instalación y Configuración del Entorno](#-instalación-y-configuración-del-entorno)
4. [Variables de Entorno](#-variables-de-entorno)
5. [Ejecución en Modo Desarrollo](#-ejecución-en-modo-desarrollo)
6. [Compilación y Ejecución en Producción](#-compilación-y-ejecución-en-producción)
7. [Cuentas de Acceso Demo](#-cuentas-de-acceso-demo)
8. [Flujo de Autenticación y Aprobación de Usuarios](#-flujo-de-autenticación-y-aprobación-de-usuarios)
9. [Arquitectura del Proyecto](#-arquitectura-del-proyecto)
10. [Solución de Problemas Frecuentes](#-solución-de-problemas-frecuentes)

---

## 💻 Requisitos del Sistema

Antes de iniciar, asegúrate de tener instalado en tu computadora:

- **Node.js**: Versión **18.0.0** o superior (Recomendado: Node.js LTS v20 o v22).
  - Verifica tu versión ejecutando: `node -v`
- **Gestor de Paquetes**: `npm` (incluido con Node.js), `bun`, `pnpm` o `yarn`.
  - Verifica tu versión ejecutando: `npm -v`
- **Git** (Opcional, para clonar el repositorio).
- **Editor de Código**: Visual Studio Code, Cursor u otro de tu preferencia.
- **Navegador Web**: Google Chrome, Mozilla Firefox, Microsoft Edge o Safari (versiones modernas).

---

## 📥 Descarga del Proyecto

### Opción A: Desde Google AI Studio
1. En la esquina superior derecha de la interfaz de AI Studio, abre el menú de opciones (**Settings / Export**).
2. Selecciona **Export to ZIP** o **Export to GitHub**.
3. Si descargaste el archivo `.zip`, descomprímelo en la carpeta de tu preferencia.

### Opción B: Mediante Git Clone
Si tienes el repositorio enlazado a GitHub:
```bash
git clone <URL_DE_TU_REPOSITORIO>
cd sistema-mantenimiento-institucional
```

---

## ⚙️ Instalación y Configuración del Entorno

1. **Abre una terminal** en la carpeta raíz del proyecto:
   ```bash
   cd ruta/hacia/tu/proyecto
   ```

2. **Instala las dependencias del proyecto**:
   ```bash
   npm install
   ```
   *(Si usas Bun, puedes ejecutar `bun install`)*.

---

## 🔐 Variables de Entorno

El proyecto incluye un archivo de plantilla llamado `.env.example`.

1. Crea tu archivo `.env` en la raíz del proyecto copiando la plantilla:
   ```bash
   cp .env.example .env
   ```
   *(En Windows PowerShell: `copy .env.example .env`)*.

2. Contenido del archivo `.env`:
   ```env
   # Clave de API de Google Gemini (Opcional si integras funciones de IA)
   GEMINI_API_KEY=tu_clave_aqui

   # URL base de la aplicación (Por defecto en desarrollo: http://localhost:3000)
   APP_URL=http://localhost:3000
   ```

> 💡 **Nota:** Para el funcionamiento base de autenticación, control de daños, registro de avances fotográficos y gestión de áreas, la aplicación opera de forma local e inmediata sin requerir claves obligatorias.

---

## 🚀 Ejecución en Modo Desarrollo

Para iniciar el servidor de desarrollo en tiempo real (Frontend con Vite + Backend con Express):

```bash
npm run dev
```

Una vez ejecutado, abre tu navegador web en:
👉 **[http://localhost:3000](http://localhost:3000)**

- El servidor Express se iniciará en el puerto `3000` y montará Vite automáticamente como middleware.
- La pantalla inicial te solicitará **Iniciar Sesión** o **Registrarte**.

---

## 📦 Compilación y Ejecución en Producción

Para generar el paquete optimizado de producción y desplegarlo en un servidor o contenedor:

1. **Verificar tipos TypeScript (Linting)**:
   ```bash
   npm run lint
   ```

2. **Compilar el Frontend y Backend**:
   ```bash
   npm run build
   ```
   Este comando:
   - Compila la aplicación React con Vite en la carpeta `dist/`.
   - Empaqueta el servidor `server.ts` con `esbuild` en un archivo autocontenido `dist/server.cjs`.

3. **Iniciar el servidor en Producción**:
   ```bash
   npm start
   ```

---

## 🔑 Cuentas de Acceso Demo

Para probar inmediatamente todas las funcionalidades y niveles de autorización, se han precargado tres cuentas institucionales:

| Usuario | Contraseña | Rol Institucional | Cargo / Función | Permisos |
| :--- | :--- | :--- | :--- | :--- |
| **`rectoria`** | `password123` | **Directivo / Superior** | Rectora General | Acceso total, aprobación de usuarios, gestión de daños y asignación de personal. |
| **`coord.mantenimiento`** | `password123` | **Administrativo** | Coord. Mantenimiento | Registro y actualización técnica de daños, seguimiento de avances y fotos. |
| **`prof.martinez`** | `password123` | **Docente** | Docente Titular | Reporte de incidencias en aulas, laboratorios y consulta del estado de arreglos. |

> ⚡ **Atajo Rápido:** En la pantalla de login encontrarás botones directos para autocompletar e ingresar con cualquiera de estas cuentas demo con un solo clic.

---

## 👥 Flujo de Autenticación y Aprobación de Usuarios

1. **Acceso Restringido a Estudiantes**:
   - La plataforma está diseñada exclusivamente para personal docente, administrativo y directivo.
2. **Registro de Nuevo Personal**:
   - En la pantalla de inicio, selecciona la pestaña **«2. Registrarse»**.
   - Diligencia los datos requeridos (nombre completo, usuario, correo, contraseña, rol y departamento).
   - Al enviar el formulario, el usuario queda en estado **`PENDING` (Pendiente de Aprobación)**.
3. **Aprobación por Parte del Administrador / Rector**:
   - Inicia sesión con la cuenta de Rectoría (`rectoria`).
   - El sistema mostrará un banner de aviso indicando las solicitudes pendientes.
   - Abre el botón **«Revisar y Autorizar Personal»** (o desde la barra superior en **Aprobaciones**).
   - Haz clic en **«Aprobar Ingreso»** para habilitar el acceso del nuevo funcionario.

---

## 🏗️ Arquitectura del Proyecto

El sistema está estructurado bajo los principios de la **Arquitectura Hexagonal (Puertos y Adaptadores)**:

```
├── .env.example              # Plantilla de variables de entorno
├── index.html                # Entrada HTML principal
├── metadata.json             # Metadatos del aplicativo
├── package.json              # Dependencias y scripts de ejecución
├── server.ts                 # Servidor Express (API REST y persistencia)
├── tsconfig.json             # Configuración del compilador TypeScript
├── vite.config.ts            # Configuración de Vite y Tailwind CSS
├── database/                 # 🗄️ BASE DE DATOS (MYSQL)
│   ├── schema.sql            # Script DDL, DML, relaciones e inserts iniciales
│   └── README.md             # Guía de importación en MySQL / phpMyAdmin
└── src/
    ├── main.tsx              # Bootstrap de React
    ├── App.tsx               # Componente raíz y control de sesión
    ├── index.css             # Importación de Tailwind CSS v4
    ├── core/                 # 💎 NÚCLEO DE DOMINIO Y PUERTOS
    │   ├── domain/
    │   │   └── entities.ts   # Entidades puras (MaintenanceItem, ProgressAdvance, User)
    │   └── ports/
    │       └── repositories.ts # Interfaces y contratos del repositorio
    ├── application/          # ⚙️ CASOS DE USO
    │   └── useCases.ts       # Orquestación de lógica, filtros y estadísticas
    ├── adapters/             # 🔌 ADAPTADORES
    │   └── api/
    │       └── apiClient.ts  # Cliente HTTP tipado para consumir la API REST
    └── components/           # 🎨 INTERFAZ DE USUARIO (REACT)
        ├── LoginView.tsx     # Pantalla principal de autenticación y registro
        ├── Navbar.tsx        # Barra de navegación con filtro por áreas
        ├── StatsDashboard.tsx # Métricas de estado (Dañados, En arreglo, Nuevos)
        ├── AreaTableView.tsx # Tablas interactivas y vista móvil de tarjetas
        ├── NewIncidentModal.tsx # Registro de daños con captura de fotos
        ├── ProgressModal.tsx # Registro de avances y evidencias técnicas
        ├── ItemDetailModal.tsx # Hoja de vida y trazabilidad del elemento
        ├── SuperiorApprovalPanel.tsx # Panel directivo de aprobación de personal
        └── HexagonalArchitectureModal.tsx # Diagrama interactivo de arquitectura
```

### Principales Módulos de Mantenimiento:
1. **⚡ Zonas Eléctricas**: Tableros de distribución, iluminación, luminarias, cableado, tomacorrientes y cajas térmicas.
2. **🏢 Estructurales & Obras**: Techos, cubiertas, filtraciones, grietas, baterías de baños, cerrajería y pintura.
3. **📦 Recursos & Equipamiento**: Mobiliario, pupitres, computadores, proyectores y equipos de laboratorio.

---

## 🛠️ Solución de Problemas Frecuentes

### 1. El puerto 3000 ya está en uso (`EADDRINUSE`)
Si otro proceso está utilizando el puerto 3000:
- **En Linux / macOS:**
  ```bash
  lsof -ti :3000 | xargs kill -9
  ```
- **En Windows (PowerShell):**
  ```powershell
  Get-Process -Id (Get-NetTCPConnection -LocalPort 3000).OwningProcess | Stop-Process -Force
  ```

### 2. Error al instalar dependencias (`node_modules`)
Limpia la caché de npm e instala nuevamente:
```bash
npm cache clean --force
rm -rf node_modules package-lock.json
npm install
```

### 3. Problemas de carga de imágenes o cámara
- Asegúrate de otorgar permisos de cámara en tu navegador al intentar adjuntar evidencias fotográficas en tiempo real.
- Las imágenes se procesan localmente mediante `FileReader` en formato Base64 para garantizar portabilidad sin necesidad de almacenamiento externo S3.

---

## 📜 Licencia y Autoría

Desarrollado para la gestión y modernización de la infraestructura escolar e institucional.
Distribuido bajo licencia Apache-2.0.
