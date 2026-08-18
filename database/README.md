# 🗄️ Base de Datos MySQL - SIGMA Mantenimiento Institucional

Este directorio contiene el script SQL completo para crear e inicializar la base de datos relacional para el sistema de mantenimiento institucional.

---

## 📁 Archivos en este directorio

- **`schema.sql`**: Script de creación de la base de datos `sigma_mantenimiento`, tablas relacionales con claves foráneas, índices, datos semilla institucionales (usuarios demo, registros de las 3 áreas y avances técnicos) y vistas estadísticas.

---

## 📊 Estructura del Modelo Relacional

El modelo contiene las siguientes tablas principales:

1. **`users`**: Personal institucional (Docentes, Administrativos y Directivos/Superior) con estados de aprobación (`PENDING_APPROVAL`, `APPROVED`, `REJECTED`).
2. **`maintenance_items`**: Registros e incidencias clasificadas por área (`ELECTRICOS`, `ESTRUCTURALES`, `RECURSOS`), estados (`DANADO`, `EN_MANTENIMIENTO`, `NUEVO_OPERATIVO`), niveles de urgencia y responsable asignado con cargo.
3. **`maintenance_item_photos`**: Evidencias fotográficas del daño inicial.
4. **`progress_advances`**: Bitácora de avances, repuestos y materiales utilizados.
5. **`progress_advance_photos`**: Fotografías de evidencia técnica de cada avance.
6. **Vistas SQL**:
   - `vw_maintenance_stats`: Totales y métricas de estados y prioridades.
   - `vw_items_with_latest_advance`: Consulta ágil del estado y último reporte técnico de cada elemento.

---

## 🚀 Cómo Importar la Base de Datos en MySQL

### Opción 1: Mediante Terminal / Línea de Comandos MySQL
Abre tu terminal y ejecuta el siguiente comando (ingresa tu contraseña de MySQL cuando se te solicite):

```bash
mysql -u root -p < database/schema.sql
```

O si estás dentro de la consola de MySQL:
```sql
SOURCE database/schema.sql;
```

---

### Opción 2: Mediante phpMyAdmin (XAMPP / WampServer / Laragon)
1. Abre tu navegador e ingresa a `http://localhost/phpmyadmin`.
2. Haz clic en la pestaña superior **Importar** (o *Import*).
3. Haz clic en **Seleccionar archivo** y busca el archivo `database/schema.sql`.
4. Deja la codificación en **utf-8** y pulsa el botón **Importar** / **Continuar**.
5. phpMyAdmin creará automáticamente la base de datos `sigma_mantenimiento` con todas sus tablas y registros iniciales.

---

### Opción 3: Mediante MySQL Workbench o DBeaver
1. Conéctate a tu servidor MySQL en MySQL Workbench o DBeaver.
2. Ve al menú **File** -> **Open SQL Script...** y selecciona `database/schema.sql`.
3. Ejecuta todo el script con el botón del rayo (**Execute All**).
4. Actualiza el panel de *Schemas* en la barra lateral izquierda para ver `sigma_mantenimiento`.

---

### Opción 4: Ejecución rápida con Docker
Si prefieres levantar un contenedor MySQL listo para usar:

```bash
docker run --name mysql-sigma \
  -e MYSQL_ROOT_PASSWORD=rootpassword \
  -e MYSQL_DATABASE=sigma_mantenimiento \
  -p 3306:3306 \
  -v $(pwd)/database/schema.sql:/docker-entrypoint-initdb.d/schema.sql \
  -d mysql:8.0
```

---

## 🔑 Credenciales Demo Incluidas en el Script

El script incluye las siguientes cuentas institucionales precargadas:

| Usuario | Contraseña | Rol | Cargo |
| :--- | :--- | :--- | :--- |
| `rectoria` | `password123` | `SUPERIOR` | Directora General / Rectora |
| `coord.mantenimiento` | `password123` | `ADMINISTRATIVO` | Coordinador de Infraestructura |
| `prof.martinez` | `password123` | `DOCENTE` | Docente de Ciencias Naturales |
| `prof.sandoval` | `password123` | `DOCENTE` (Pendiente) | Docente de Tecnología |
