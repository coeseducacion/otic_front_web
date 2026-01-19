# SIDENAGERD Client - Cliente Web OTIC

Cliente web del sistema **SIDENAGERD** (Sistema Integrado de Defensa Nacional y Gestión de Riesgos y Desastres) desarrollado con Vue 3, Vite y Vuetify. Este frontend se conecta a los microservicios backend (Auth Service y COES Service) a través de un API Gateway.

## 📋 Tabla de Contenidos

- [Arquitectura](#arquitectura)
- [Requisitos](#requisitos)
- [Instalación](#instalación)
- [Configuración](#configuración)
- [Variables de Entorno](#variables-de-entorno)
- [Estructura del Proyecto](#estructura-del-proyecto)
- [Desarrollo](#desarrollo)
- [Build para Producción](#build-para-producción)
- [Docker](#docker)
- [Características](#características)
- [Tecnologías](#tecnologías)
- [Contribución](#contribución)

## 🏗️ Arquitectura

Este cliente se conecta a una arquitectura de microservicios:

```
Cliente Vue (Este proyecto)
    ↓
API Gateway (Nginx:8080)
    ↓
├── Auth Service (9020) - Autenticación y usuarios
└── COES Service (9021) - Alertas e instituciones educativas
```

### Características

- ✅ Interfaz moderna con Vuetify 3
- ✅ Autenticación JWT con refresh automático
- ✅ Gestión de permisos y roles
- ✅ Gestión de alertas de emergencia
- ✅ Gestión de instituciones educativas
- ✅ Catálogos y configuraciones
- ✅ Mapas interactivos (Leaflet)
- ✅ Generación de reportes y PDFs
- ✅ Notificaciones en tiempo real
- ✅ Internacionalización (i18n)
- ✅ Responsive design

## 📦 Requisitos

- **Node.js**: >= 18.0
- **npm**: >= 9.0 (o pnpm/yarn)
- **Navegador moderno**: Chrome, Firefox, Safari, Edge (últimas versiones)

## 🚀 Instalación

### 1. Clonar el repositorio

```bash
git clone <repository-url>
cd sidenagerd_client_otic
```

### 2. Instalar dependencias

```bash
npm install
# o
pnpm install
# o
yarn install
```

### 3. Configurar variables de entorno

Crea un archivo `.env` en la raíz del proyecto:

```env
# API Gateway (recomendado para desarrollo)
VITE_API_BASE_URL=http://localhost:8080/api

# O servicios directos (alternativa)
VITE_API_AUTH_URL=http://localhost:9020/api
VITE_API_COES_URL=http://localhost:9021/api
```

### 4. Iniciar servidor de desarrollo

```bash
npm run dev
```

La aplicación estará disponible en `http://localhost:5173` (o el puerto que Vite asigne)

## ⚙️ Configuración

### Variables de Entorno

Crea un archivo `.env` en la raíz del proyecto con las siguientes variables:

```env
# API Gateway (recomendado)
VITE_API_BASE_URL=http://localhost:8080/api

# Servicios directos (alternativa)
VITE_API_AUTH_URL=http://localhost:9020/api
VITE_API_COES_URL=http://localhost:9021/api

# Configuración de la aplicación
VITE_APP_NAME=SIDENAGERD
VITE_APP_TITLE=Sistema Integrado de Defensa Nacional
```

### Configuración con API Gateway (Recomendado)

Cuando uses el API Gateway, las rutas se estructuran así:

- **Auth Service**: `http://localhost:8080/api/auth/api/...`
- **COES Service**: `http://localhost:8080/api/coes/api/...`

### Configuración sin API Gateway

Si prefieres conectarte directamente a los servicios:

- **Auth Service**: `http://localhost:9020/api/...`
- **COES Service**: `http://localhost:9021/api/...`

## 📁 Estructura del Proyecto

```
sidenagerd_client_otic/
├── public/                    # Archivos estáticos
│   ├── images/               # Imágenes públicas
│   └── favicon.ico
├── src/
│   ├── @core/                # Componentes y utilidades core
│   │   ├── components/      # Componentes base
│   │   ├── composable/      # Composables core
│   │   ├── libs/            # Librerías
│   │   ├── scss/            # Estilos core
│   │   └── stores/          # Stores core
│   ├── @layouts/            # Layouts y componentes de layout
│   │   ├── components/     # Componentes de layout
│   │   ├── plugins/        # Plugins de layout
│   │   ├── stores/         # Stores de layout
│   │   └── styles/         # Estilos de layout
│   ├── assets/             # Recursos estáticos
│   │   ├── images/         # Imágenes
│   │   └── styles/         # Estilos globales
│   ├── boot/               # Configuración inicial
│   │   ├── axios.js        # Configuración de Axios
│   │   └── i18n.js         # Configuración de i18n
│   ├── components/         # Componentes reutilizables
│   │   ├── dialogs/        # Diálogos
│   │   ├── Filters/       # Filtros
│   │   └── ...
│   ├── composables/        # Composables Vue
│   │   ├── alertIEs/       # Composables de alertas
│   │   ├── catalogIEs/     # Composables de catálogos
│   │   └── ...
│   ├── layouts/            # Layouts de página
│   │   ├── blank.vue       # Layout en blanco
│   │   └── default.vue     # Layout por defecto
│   ├── navigation/         # Configuración de navegación
│   │   ├── horizontal/     # Menú horizontal
│   │   └── vertical/       # Menú vertical
│   ├── pages/              # Páginas/Vistas
│   │   ├── alerts/         # Páginas de alertas
│   │   ├── educativeInstitutions/  # Páginas de IEs
│   │   ├── imports/        # Páginas de importación
│   │   ├── modules/        # Páginas de módulos
│   │   ├── users/          # Páginas de usuarios
│   │   └── ...
│   ├── plugins/            # Plugins de Vue
│   │   ├── axios.js        # Plugin de Axios
│   │   └── ...
│   ├── stores/             # Stores de Pinia
│   │   └── useAuthStore.js # Store de autenticación
│   ├── utils/              # Utilidades
│   ├── views/              # Vistas adicionales
│   ├── App.vue             # Componente raíz
│   └── main.js             # Punto de entrada
├── .env                     # Variables de entorno (no commiteado)
├── .env.example            # Ejemplo de variables de entorno
├── vite.config.js          # Configuración de Vite
├── package.json            # Dependencias y scripts
└── README.md               # Este archivo
```

## 💻 Desarrollo

### Comandos Disponibles

```bash
# Desarrollo
npm run dev                  # Iniciar servidor de desarrollo

# Build
npm run build                # Build para producción
npm run preview              # Preview del build de producción

# Linting
npm run lint                 # Ejecutar ESLint

# Iconos
npm run build:icons          # Construir iconos
```

### Hot Module Replacement (HMR)

El proyecto está configurado con HMR, por lo que los cambios se reflejan automáticamente en el navegador sin necesidad de recargar la página.

### Estructura de Componentes

Los componentes se organizan de la siguiente manera:

- **Componentes Core** (`@core/components`): Componentes base reutilizables
- **Componentes de Layout** (`@layouts/components`): Componentes específicos de layout
- **Componentes de Página** (`components/`): Componentes específicos de funcionalidad
- **Vistas** (`pages/` y `views/`): Páginas completas

## 🏗️ Build para Producción

### Build Estándar

```bash
npm run build
```

El build se generará en el directorio `dist/`.

### Build con Análisis

```bash
npm run build -- --mode production
```

### Servir Build de Producción

```bash
npm run preview
```

Esto iniciará un servidor local en el puerto 5050 para probar el build de producción.

## 🐳 Docker

El proyecto incluye Dockerfiles para desarrollo y producción.

### Desarrollo

```bash
docker build -f dev.Dockerfile -t sidenagerd-client:dev .
docker run -p 5173:5173 sidenagerd-client:dev
```

### Producción

```bash
docker build -f prod.Dockerfile -t sidenagerd-client:prod .
docker run -p 80:80 sidenagerd-client:prod
```

## 🎯 Características

### Autenticación

- Login con JWT
- Refresh automático de tokens
- Gestión de sesión
- Logout seguro
- Protección de rutas

### Gestión de Alertas

- Crear alertas de emergencia
- Visualizar alertas en mapa
- Gestionar evidencias (imágenes, documentos)
- Asociar instituciones educativas afectadas
- Generar reportes PDF

### Instituciones Educativas

- Listar instituciones educativas
- Buscar por ubicación
- Importación masiva desde ESCALE
- Gestión de catálogos
- Filtros avanzados

### Catálogos

- Niveles educativos
- Formas de atención
- Características de instituciones
- Tipos de gestión
- Sectores de gestión
- Tipos de área
- Tipos de programa
- Turnos

### Mapas

- Visualización de alertas en mapa
- Búsqueda de instituciones por ubicación
- Polígonos de distritos
- Marcadores personalizados

### Notificaciones

- Notificaciones push
- Notificaciones en tiempo real
- Sistema de alertas

## 🛠️ Tecnologías

### Core

- **Vue 3**: Framework JavaScript progresivo
- **Vite**: Build tool y dev server
- **Vuetify 3**: Framework de componentes Material Design
- **Vue Router**: Router oficial de Vue
- **Pinia**: State management para Vue

### Utilidades

- **Axios**: Cliente HTTP
- **VueUse**: Colección de composables Vue
- **Vue I18n**: Internacionalización
- **JWT Decode**: Decodificación de tokens JWT

### UI/UX

- **Leaflet**: Mapas interactivos
- **ApexCharts**: Gráficos y visualizaciones
- **Chart.js**: Gráficos adicionales
- **TipTap**: Editor de texto enriquecido
- **Swiper**: Carruseles y sliders

### Desarrollo

- **ESLint**: Linter de código
- **Stylelint**: Linter de estilos
- **TypeScript**: Soporte de tipos (parcial)
- **MSW**: Mock Service Worker para testing

## 🔒 Seguridad

- ✅ Autenticación JWT
- ✅ Refresh automático de tokens
- ✅ Protección de rutas
- ✅ Validación de permisos
- ✅ Headers de seguridad
- ✅ Sanitización de inputs

## 📝 Contribución

1. Fork el proyecto
2. Crea una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

### Estándares de Código

```bash
# Ejecutar linter
npm run lint
```

El proyecto usa ESLint con configuración de Airbnb y reglas específicas de Vue.

## 📄 Licencia

Este proyecto está bajo la Licencia MIT.

## 📞 Soporte

Para soporte, contacta al equipo de desarrollo o abre un issue en el repositorio.

## 🔗 Enlaces Útiles

- [Documentación de Vue 3](https://vuejs.org/)
- [Documentación de Vuetify](https://vuetifyjs.com/)
- [Documentación de Vite](https://vitejs.dev/)
- [Documentación de Pinia](https://pinia.vuejs.org/)

---

**Desarrollado para el Sistema ODENAGED - Ministerio de Educación del Perú**
