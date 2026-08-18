-- ==============================================================================
-- PROYECTO: SIGMA - Sistema de Mantenimiento Institucional
-- MOTOR: MySQL 5.7+ / MySQL 8.0+ / MariaDB 10.3+
-- ARQUITECTURA: Hexagonal (Dominio, Puertos y Adaptadores)
-- DESCRIPCIÓN: Esquema relacional para control de personal, áreas eléctricas,
--              estructurales y recursos, reportes, avances con fotos y roles.
-- ==============================================================================

-- 1. CREACIÓN DE LA BASE DE DATOS
CREATE DATABASE IF NOT EXISTS `sigma_mantenimiento`
  DEFAULT CHARACTER SET utf8mb4
  DEFAULT COLLATE utf8mb4_unicode_ci;

USE `sigma_mantenimiento`;

-- Deshabilitar chequeo de claves foráneas temporalmente para recreación limpia
SET FOREIGN_KEY_CHECKS = 0;

DROP TABLE IF EXISTS `progress_advance_photos`;
DROP TABLE IF EXISTS `progress_advances`;
DROP TABLE IF EXISTS `maintenance_item_photos`;
DROP TABLE IF EXISTS `maintenance_items`;
DROP TABLE IF EXISTS `users`;

SET FOREIGN_KEY_CHECKS = 1;

-- ==============================================================================
-- 2. TABLA: users (Personal Institucional: Docentes, Administrativos, Directivos)
-- ==============================================================================
CREATE TABLE `users` (
  `id` VARCHAR(50) NOT NULL COMMENT 'Identificador único del usuario (ej: usr_sup_1)',
  `username` VARCHAR(60) NOT NULL COMMENT 'Nombre de usuario único para acceso',
  `password` VARCHAR(255) NOT NULL COMMENT 'Contraseña cifrada o hash de acceso',
  `email` VARCHAR(120) NOT NULL COMMENT 'Correo electrónico institucional',
  `name` VARCHAR(120) NOT NULL COMMENT 'Nombre completo y títulos del funcionario',
  `role` ENUM('SUPERIOR', 'ADMINISTRATIVO', 'DOCENTE') NOT NULL DEFAULT 'DOCENTE' COMMENT 'Rol institucional',
  `role_title` VARCHAR(100) NOT NULL COMMENT 'Cargo específico (ej: Rectora, Docente Titular, Coord. Mantenimiento)',
  `department` VARCHAR(100) NOT NULL COMMENT 'Departamento, sede o área académica',
  `status` ENUM('PENDING_APPROVAL', 'APPROVED', 'REJECTED') NOT NULL DEFAULT 'PENDING_APPROVAL' COMMENT 'Estado de autorización',
  `approved_at` DATETIME NULL COMMENT 'Fecha y hora en que fue autorizado por un superior',
  `approved_by` VARCHAR(120) NULL COMMENT 'Nombre o ID del directivo que aprobó la solicitud',
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT 'Fecha de registro inicial',
  `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT 'Última actualización del registro',
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_users_username` (`username`),
  UNIQUE KEY `uk_users_email` (`email`),
  KEY `idx_users_role` (`role`),
  KEY `idx_users_status` (`status`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Usuarios institucionales autorizados y pendientes';

-- ==============================================================================
-- 3. TABLA: maintenance_items (Elementos y Reportes de Mantenimiento)
-- ==============================================================================
CREATE TABLE `maintenance_items` (
  `id` VARCHAR(50) NOT NULL COMMENT 'Identificador único del reporte (ej: item_ele_1)',
  `code` VARCHAR(20) NOT NULL COMMENT 'Código alfanumérico institucional (ej: ELE-101, EST-201, REC-301)',
  `area` ENUM('ELECTRICOS', 'ESTRUCTURALES', 'RECURSOS') NOT NULL COMMENT 'Área institucional',
  `title` VARCHAR(200) NOT NULL COMMENT 'Título descriptivo de la incidencia o elemento',
  `description` TEXT NOT NULL COMMENT 'Descripción detallada de la avería o necesidad',
  `location` VARCHAR(180) NOT NULL COMMENT 'Ubicación precisa dentro del plantel (Pabellón, Aula, Laboratorio)',
  `status` ENUM('DANADO', 'EN_MANTENIMIENTO', 'NUEVO_OPERATIVO') NOT NULL DEFAULT 'DANADO' COMMENT 'Estado actual del elemento',
  `urgency` ENUM('URGENTE', 'IMPORTANTE', 'NADA_URGENTE') NOT NULL DEFAULT 'IMPORTANTE' COMMENT 'Nivel de prioridad',
  
  -- Datos del funcionario reportante (Foreign Key)
  `reported_by_id` VARCHAR(50) NULL COMMENT 'ID del usuario que reportó',
  `reported_by_name` VARCHAR(120) NOT NULL COMMENT 'Nombre del reportante',
  `reported_by_role` ENUM('SUPERIOR', 'ADMINISTRATIVO', 'DOCENTE') NOT NULL DEFAULT 'DOCENTE',
  `reported_by_role_title` VARCHAR(100) NOT NULL,
  
  -- Persona / Técnico Asignado
  `assigned_person_name` VARCHAR(120) NOT NULL COMMENT 'Nombre completo del responsable asignado',
  `assigned_person_cargo` VARCHAR(120) NOT NULL COMMENT 'Cargo técnico o profesional del asignado',
  `assigned_person_phone` VARCHAR(30) NULL COMMENT 'Teléfono de contacto técnico',
  `assigned_person_email` VARCHAR(120) NULL COMMENT 'Correo electrónico del técnico',
  
  `notes` TEXT NULL COMMENT 'Observaciones técnicas o administrativas adicionales',
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT 'Fecha de radicación del reporte',
  `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT 'Fecha de última modificación',
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_maintenance_code` (`code`),
  KEY `idx_maintenance_area` (`area`),
  KEY `idx_maintenance_status` (`status`),
  KEY `idx_maintenance_urgency` (`urgency`),
  KEY `fk_maintenance_reported_by` (`reported_by_id`),
  CONSTRAINT `fk_maintenance_reported_by` FOREIGN KEY (`reported_by_id`) REFERENCES `users` (`id`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Registros de mantenimiento y control de infraestructura';

-- ==============================================================================
-- 4. TABLA: maintenance_item_photos (Fotografías y Evidencias Iniciales)
-- ==============================================================================
CREATE TABLE `maintenance_item_photos` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `item_id` VARCHAR(50) NOT NULL COMMENT 'Referencia al elemento de mantenimiento',
  `photo_url` LONGTEXT NOT NULL COMMENT 'URL o cadena en Base64 de la imagen fotográfica',
  `caption` VARCHAR(255) NULL COMMENT 'Pie de foto o descripción visual',
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `fk_photos_maintenance_item` (`item_id`),
  CONSTRAINT `fk_photos_maintenance_item` FOREIGN KEY (`item_id`) REFERENCES `maintenance_items` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Evidencias fotográficas del daño inicial';

-- ==============================================================================
-- 5. TABLA: progress_advances (Avances, Trabajos Realizados y Repuestos)
-- ==============================================================================
CREATE TABLE `progress_advances` (
  `id` VARCHAR(50) NOT NULL COMMENT 'Identificador único del avance (ej: adv_101_1)',
  `item_id` VARCHAR(50) NOT NULL COMMENT 'Elemento al que pertenece el avance',
  `author_id` VARCHAR(50) NULL COMMENT 'Usuario que registra el avance',
  `author_name` VARCHAR(120) NOT NULL COMMENT 'Nombre del autor',
  `author_role` VARCHAR(100) NOT NULL COMMENT 'Cargo del autor del avance',
  `date` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT 'Fecha del reporte de avance',
  `note` TEXT NOT NULL COMMENT 'Detalle del trabajo técnico realizado',
  `status_after` ENUM('DANADO', 'EN_MANTENIMIENTO', 'NUEVO_OPERATIVO') NOT NULL COMMENT 'Estado resultante del elemento',
  `materials_used` TEXT NULL COMMENT 'Repuestos, consumibles o insumos implementados',
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `fk_advances_maintenance_item` (`item_id`),
  KEY `fk_advances_author` (`author_id`),
  CONSTRAINT `fk_advances_maintenance_item` FOREIGN KEY (`item_id`) REFERENCES `maintenance_items` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `fk_advances_author` FOREIGN KEY (`author_id`) REFERENCES `users` (`id`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Bitácora y trazabilidad de avances de mantenimiento';

-- ==============================================================================
-- 6. TABLA: progress_advance_photos (Fotografías de los Avances Técnicos)
-- ==============================================================================
CREATE TABLE `progress_advance_photos` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `advance_id` VARCHAR(50) NOT NULL COMMENT 'Referencia al avance',
  `photo_url` LONGTEXT NOT NULL COMMENT 'URL o Base64 de la evidencia del avance',
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `fk_advance_photos_advance` (`advance_id`),
  CONSTRAINT `fk_advance_photos_advance` FOREIGN KEY (`advance_id`) REFERENCES `progress_advances` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Evidencias fotográficas de los trabajos realizados';

-- ==============================================================================
-- 7. DATOS SEMILLA / INICIALES (SEED DATA INSTITUCIONAL)
-- ==============================================================================

-- A. Inserción de Usuarios Demo
INSERT INTO `users` (`id`, `username`, `password`, `email`, `name`, `role`, `role_title`, `department`, `status`, `approved_at`, `approved_by`, `created_at`) VALUES
('usr_sup_1', 'rectoria', 'password123', 'rectoria@institucion.edu.co', 'Dra. Carmen Valencia', 'SUPERIOR', 'Directora General / Rectora', 'Dirección Institucional', 'APPROVED', NOW(), 'Sistema Inicial', NOW() - INTERVAL 30 DAY),
('usr_adm_1', 'coord.mantenimiento', 'password123', 'mantenimiento@institucion.edu.co', 'Ing. Carlos Ruiz', 'ADMINISTRATIVO', 'Coordinador de Infraestructura y Mantenimiento', 'Servicios Generales', 'APPROVED', NOW(), 'Dra. Carmen Valencia', NOW() - INTERVAL 20 DAY),
('usr_doc_1', 'prof.martinez', 'password123', 'j.martinez@institucion.edu.co', 'Prof. Jorge Martínez', 'DOCENTE', 'Docente de Ciencias Naturales y Física', 'Área de Ciencias', 'APPROVED', NOW(), 'Dra. Carmen Valencia', NOW() - INTERVAL 15 DAY),
('usr_pending_1', 'prof.sandoval', 'password123', 'm.sandoval@institucion.edu.co', 'Lic. Mariana Sandoval', 'DOCENTE', 'Docente de Informática y Tecnología', 'Tecnología e Innovación', 'PENDING_APPROVAL', NULL, NULL, NOW() - INTERVAL 2 HOUR);

-- B. Inserción de Elementos de Mantenimiento Iniciales

-- 1. Zonas Eléctricas
INSERT INTO `maintenance_items` (
  `id`, `code`, `area`, `title`, `description`, `location`, `status`, `urgency`,
  `reported_by_id`, `reported_by_name`, `reported_by_role`, `reported_by_role_title`,
  `assigned_person_name`, `assigned_person_cargo`, `assigned_person_phone`, `assigned_person_email`,
  `notes`, `created_at`, `updated_at`
) VALUES
(
  'item_ele_1', 'ELE-101', 'ELECTRICOS',
  'Cortocircuito y falla de iluminación en Laboratorio de Física',
  'Tres lámparas fluorescentes presentan parpadeo continuo y olor a quemado tras la lluvia de ayer. El disyuntor principal de la caja B-2 salta constantemente al encender.',
  'Pabellón de Ciencias - Laboratorio 2 (Piso 2)',
  'DANADO', 'URGENTE',
  'usr_doc_1', 'Prof. Jorge Martínez', 'DOCENTE', 'Docente de Ciencias',
  'Pedro Gómez', 'Técnico Electricista Certificado', '+57 312 456 7890', 'p.gomez.electrico@institucion.edu.co',
  'Se suspendió preventivamente el suministro eléctrico en la caja auxiliar B-2.',
  NOW() - INTERVAL 3 DAY, NOW() - INTERVAL 1 DAY
),
(
  'item_ele_2', 'ELE-102', 'ELECTRICOS',
  'Mantenimiento preventivo de tableros eléctricos y tomas polo a tierra',
  'Inspección termográfica de contactores, apriete de bornes y medición de aislamiento en las tomas del aula de informática principal.',
  'Bloque Administrativo - Sala de Sistemas Central',
  'EN_MANTENIMIENTO', 'IMPORTANTE',
  'usr_adm_1', 'Ing. Carlos Ruiz', 'ADMINISTRATIVO', 'Coord. Mantenimiento',
  'Manuel Castro', 'Ingeniero Eléctrico Contratista', '+57 310 987 6543', 'm.castro.ing@institucion.edu.co',
  'Avance estimado al 70%. Pendiente cambio de dos térmicas de 20A.',
  NOW() - INTERVAL 5 DAY, NOW() - INTERVAL 4 HOUR
),
(
  'item_ele_3', 'ELE-103', 'ELECTRICOS',
  'Instalación de reflectores LED solares en patio central y canchas',
  'Finalizada la instalación de 4 reflectores LED solares de 200W con sensor de movimiento y fotocelda automática para senderos peatonales nocturnos.',
  'Zonas Exteriores - Canchas Polideportivas',
  'NUEVO_OPERATIVO', 'NADA_URGENTE',
  'usr_sup_1', 'Dra. Carmen Valencia', 'SUPERIOR', 'Rectora',
  'Pedro Gómez', 'Técnico Electricista Certificado', '+57 312 456 7890', 'p.gomez.electrico@institucion.edu.co',
  'Entrega formal con acta técnica y garantía vigente de 2 años.',
  NOW() - INTERVAL 10 DAY, NOW() - INTERVAL 2 DAY
);

-- 2. Estructurales & Obras
INSERT INTO `maintenance_items` (
  `id`, `code`, `area`, `title`, `description`, `location`, `status`, `urgency`,
  `reported_by_id`, `reported_by_name`, `reported_by_role`, `reported_by_role_title`,
  `assigned_person_name`, `assigned_person_cargo`, `assigned_person_phone`, `assigned_person_email`,
  `notes`, `created_at`, `updated_at`
) VALUES
(
  'item_est_1', 'EST-201', 'ESTRUCTURALES',
  'Filtración de agua y goteras en cubierta del Aula Máxima',
  'Desplazamiento de dos láminas de teja tras el vendaval, generando acumulación de agua sobre el falso techo de drywall en el escenario.',
  'Edificio Central - Auditorio / Aula Máxima',
  'DANADO', 'URGENTE',
  'usr_doc_1', 'Prof. Jorge Martínez', 'DOCENTE', 'Docente de Ciencias',
  'Juan Carlos Rivas', 'Maestro Mayor de Obra Civil', '+57 315 222 3344', 'jc.rivas@infraestructura.edu.co',
  'Se colocó plástico temporal de protección para preservar el piso de madera.',
  NOW() - INTERVAL 2 DAY, NOW() - INTERVAL 6 HOUR
),
(
  'item_est_2', 'EST-202', 'ESTRUCTURALES',
  'Reparación hidrosanitaria y enchape en batería de baños de Primaria',
  'Sustitución de tubería de desagüe de 3 pulgadas, cambio de 2 fluxómetros defectuosos y reposición de baldosas deterioradas.',
  'Pabellón Infantil - Batería Sanitaria Niñas',
  'EN_MANTENIMIENTO', 'IMPORTANTE',
  'usr_adm_1', 'Ing. Carlos Ruiz', 'ADMINISTRATIVO', 'Coord. Mantenimiento',
  'Juan Carlos Rivas', 'Maestro Mayor de Obra Civil', '+57 315 222 3344', 'jc.rivas@infraestructura.edu.co',
  'Tubería principal instalada; fraguando pegacor de baldosas.',
  NOW() - INTERVAL 4 DAY, NOW() - INTERVAL 12 HOUR
),
(
  'item_est_3', 'EST-203', 'ESTRUCTURALES',
  'Pintura lavable antibacterial e impermeabilización de aulas 3A y 3B',
  'Aplicación de dos manos de pintura epóxica antibacterial y sellado de microfisuras en muros exteriores.',
  'Pabellón Norte - Salones 3A y 3B',
  'NUEVO_OPERATIVO', 'NADA_URGENTE',
  'usr_sup_1', 'Dra. Carmen Valencia', 'SUPERIOR', 'Rectora',
  'Alberto Méndez', 'Contratista de Acabados y Pintura', '+57 318 777 8899', 'a.mendez.obras@institucion.edu.co',
  'Aulas totalmente habilitadas y entregadas a los docentes titulares.',
  NOW() - INTERVAL 14 DAY, NOW() - INTERVAL 5 DAY
);

-- 3. Recursos & Equipamiento
INSERT INTO `maintenance_items` (
  `id`, `code`, `area`, `title`, `description`, `location`, `status`, `urgency`,
  `reported_by_id`, `reported_by_name`, `reported_by_role`, `reported_by_role_title`,
  `assigned_person_name`, `assigned_person_cargo`, `assigned_person_phone`, `assigned_person_email`,
  `notes`, `created_at`, `updated_at`
) VALUES
(
  'item_rec_1', 'REC-301', 'RECURSOS',
  'Videoproyector interactivo con lámpara quemada en Sala Audiovisual 1',
  'El proyector Epson PowerLite no emite luz y arroja código de error de ventilación y lámpara térmica. Impide desarrollo de clases multimedia.',
  'Pabellón B - Sala Audiovisual 1',
  'DANADO', 'IMPORTANTE',
  'usr_doc_1', 'Prof. Jorge Martínez', 'DOCENTE', 'Docente de Ciencias',
  'Lic. Ana Sofía Silva', 'Coordinadora de Recursos Educativos', '+57 311 333 4455', 'a.silva.recursos@institucion.edu.co',
  'Se solicitó repuesto de lámpara original de 250W.',
  NOW() - INTERVAL 4 DAY, NOW() - INTERVAL 1 DAY
),
(
  'item_rec_2', 'REC-302', 'RECURSOS',
  'Restauración de 25 pupitres universitarios y soldadura de marcos',
  'Ajuste ergonómico, lijado y barnizado de paletas de madera y refuerzo de soldadura MIG en estructuras metálicas.',
  'Taller de Mantenimiento General',
  'EN_MANTENIMIENTO', 'NADA_URGENTE',
  'usr_adm_1', 'Ing. Carlos Ruiz', 'ADMINISTRATIVO', 'Coord. Mantenimiento',
  'Héctor Fabio Morales', 'Técnico en Carpintería y Soldadura', '+57 320 111 2233', 'h.morales.taller@institucion.edu.co',
  '15 pupitres listos con barniz seco; 10 pendientes de soldadura base.',
  NOW() - INTERVAL 6 DAY, NOW() - INTERVAL 8 HOUR
),
(
  'item_rec_3', 'REC-303', 'RECURSOS',
  'Dotación de 10 Microscopios binoculares para Laboratorio de Biología',
  'Recepción e inventario de 10 microscopios ópticos binoculares 1000X con iluminación LED y fundas antipolvo para prácticas de secundaria.',
  'Pabellón de Ciencias - Laboratorio de Biología',
  'NUEVO_OPERATIVO', 'IMPORTANTE',
  'usr_sup_1', 'Dra. Carmen Valencia', 'SUPERIOR', 'Rectora',
  'Lic. Ana Sofía Silva', 'Coordinadora de Recursos Educativos', '+57 311 333 4455', 'a.silva.recursos@institucion.edu.co',
  'Inventariados con placas institucionales BIO-01 a BIO-10.',
  NOW() - INTERVAL 12 DAY, NOW() - INTERVAL 3 DAY
);

-- C. Inserción de Avances de Mantenimiento (Bitácora de Progreso)
INSERT INTO `progress_advances` (
  `id`, `item_id`, `author_id`, `author_name`, `author_role`, `date`, `note`, `status_after`, `materials_used`
) VALUES
(
  'adv_102_1', 'item_ele_2', 'usr_adm_1', 'Ing. Carlos Ruiz', 'Coordinador de Infraestructura',
  NOW() - INTERVAL 3 DAY,
  'Se realizó diagnóstico con cámara termográfica y se desmontó el panel frontal de la caja central. Se detectaron 2 bornes recalentados.',
  'EN_MANTENIMIENTO',
  'Bornes de cobre 25mm, cinta autofundente 3M.'
),
(
  'adv_102_2', 'item_ele_2', 'usr_adm_1', 'Ing. Carlos Ruiz', 'Coordinador de Infraestructura',
  NOW() - INTERVAL 4 HOUR,
  'Se reemplazaron cables de alimentación principal por calibre 8 AWG y se balancearon las cargas en las 3 fases.',
  'EN_MANTENIMIENTO',
  'Cable THHN #8 AWG, terminales de compresión.'
),
(
  'adv_202_1', 'item_est_2', 'usr_adm_1', 'Ing. Carlos Ruiz', 'Coordinador de Infraestructura',
  NOW() - INTERVAL 2 DAY,
  'Retiro de escombros y demolición puntual del piso para acceder a la tubería sanitaria rota. Se colocó tramo nuevo de PVC 3".',
  'EN_MANTENIMIENTO',
  'Tubo PVC sanitario 3 pulgadas, soldadura PVC, codo 90°.'
),
(
  'adv_302_1', 'item_rec_2', 'usr_adm_1', 'Ing. Carlos Ruiz', 'Coordinador de Infraestructura',
  NOW() - INTERVAL 2 DAY,
  'Se terminó el lijado de las 25 paletas y se aplicó sellador para madera de alta resistencia.',
  'EN_MANTENIMIENTO',
  'Lijas grano 80 y 120, sellador catalizado para madera.'
);

-- ==============================================================================
-- 8. VISTAS SQL ÚTILES PARA REPORTES Y DASHBOARD
-- ==============================================================================

-- Vista 1: Resumen de Estadísticas Generales
CREATE OR REPLACE VIEW `vw_maintenance_stats` AS
SELECT
  COUNT(*) AS total_items,
  SUM(CASE WHEN `area` = 'ELECTRICOS' THEN 1 ELSE 0 END) AS count_electricos,
  SUM(CASE WHEN `area` = 'ESTRUCTURALES' THEN 1 ELSE 0 END) AS count_estructurales,
  SUM(CASE WHEN `area` = 'RECURSOS' THEN 1 ELSE 0 END) AS count_recursos,
  SUM(CASE WHEN `status` = 'DANADO' THEN 1 ELSE 0 END) AS count_danados,
  SUM(CASE WHEN `status` = 'EN_MANTENIMIENTO' THEN 1 ELSE 0 END) AS count_en_mantenimiento,
  SUM(CASE WHEN `status` = 'NUEVO_OPERATIVO' THEN 1 ELSE 0 END) AS count_nuevos_operativos,
  SUM(CASE WHEN `urgency` = 'URGENTE' THEN 1 ELSE 0 END) AS count_urgentes,
  SUM(CASE WHEN `urgency` = 'IMPORTANTE' THEN 1 ELSE 0 END) AS count_importantes,
  SUM(CASE WHEN `urgency` = 'NADA_URGENTE' THEN 1 ELSE 0 END) AS count_nada_urgentes
FROM `maintenance_items`;

-- Vista 2: Elementos con su último avance registrado
CREATE OR REPLACE VIEW `vw_items_with_latest_advance` AS
SELECT 
  mi.`id` AS item_id,
  mi.`code`,
  mi.`area`,
  mi.`title`,
  mi.`status`,
  mi.`urgency`,
  mi.`location`,
  mi.`assigned_person_name`,
  mi.`assigned_person_cargo`,
  pa.`id` AS latest_advance_id,
  pa.`note` AS latest_advance_note,
  pa.`date` AS latest_advance_date,
  pa.`author_name` AS latest_advance_author
FROM `maintenance_items` mi
LEFT JOIN `progress_advances` pa ON pa.`id` = (
  SELECT `id` FROM `progress_advances` 
  WHERE `item_id` = mi.`id` 
  ORDER BY `date` DESC LIMIT 1
);

-- ==============================================================================
-- FIN DEL ESQUEMA SQL
-- ==============================================================================
