"# dev_sistema_escolar_api" 

Este proyecto consiste en el desarrollo de una aplicación web **Full Stack** diseñada para la administración integral de eventos académicos en la Facultad de Ciencias de la Computación. 
El objetivo principal es resolver la gestión de conferencias, talleres y seminarios, garantizando la integridad de los datos mediante validaciones lógicas estrictas (fechas, horarios y cupos) y ofreciendo visualización de datos estadísticos en tiempo real.

##  Tecnologías Utilizadas

### Frontend
* **Framework:** Angular (TypeScript)
* **UI/UX:** Angular Material (Diseño responsivo y componentes modernos).
* **Visualización de Datos:** Chart.js (Gráficas dinámicas de Barras, Dona y Pastel).
* **Despliegue:** Vercel.

### Backend
* **Framework:** Django & Django REST Framework (DRF).
* **Autenticación:** Token Authentication (Seguridad basada en sesiones).
* **Base de Datos:** MySQL / SQLite (según entorno).
* **Despliegue:** PythonAnywhere / Render.

## Funcionalidades Principales

### 1. Gestión de Eventos (CRUD Completo)
Módulo central para la administración de actividades académicas.
* **Registro Inteligente:** Formularios con *Reactive Forms* que validan lógica de negocio:
    * Restricción de fechas pasadas.
    * Validación de coherencia horaria (Hora Inicio < Hora Fin).
    * Control de cupos máximos.
* **Listado Interactivo:** Tablas con paginación, ordenamiento y filtrado rápido.
* **Eliminación Segura:** Modales de confirmación para evitar borrados accidentales.

### 2. Roles 
El sistema adapta la interfaz y los permisos según el tipo de usuario detectado:
* **Administradores:** Acceso total (Crear, Leer, Actualizar, Eliminar) a eventos y usuarios.
* **Maestros:** Visualización filtrada de eventos exclusivos para profesores o público general.
* **Alumnos:** Acceso restringido a eventos estudiantiles y públicos; sin permisos de edición.

### 3. Dashboard Estadístico
Panel de inteligencia de negocios que consume datos vivos del backend para mostrar:
* Distribución de usuarios registrados (Admins, Maestros, Alumnos).
* Gráficas interactivas renderizadas en tiempo real.

##  Online
El proyecto se encuentra desplegado y funcional en:
* **Frontend:** [Enlace a Vercel](https://dev-sistema-escolar-fullstack.vercel.app/)

* Para que pueda acceder se deja unos usuarios de cada tipo.
Usuario Administrador
•	Correo: prueba1admin@correo.com
•	Contraseña: 1234567890
Usuario Maestro
•	Correo: prueba1maestro@correo.com
•	Contraseña: 1234567890
Usuario Alumno
•	Correo: prueba1alumno@correo.com
•	Contraseña: 1234567890

* **Backend:** [Enlace a PythonAnywhere](https://carloszc.pythonanywhere.com/panel/)
Para el Back el super usuario es:
username: carloszc
password: demo2005
