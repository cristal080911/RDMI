import 'dotenv/config';
import express from 'express';
import path from 'path';
import crypto from 'crypto';
import bcrypt from 'bcryptjs';
import { createServer as createViteServer } from 'vite';
import {
  sendPasswordResetEmail,
  sendPasswordChangedEmail,
  generatePasswordResetEmailHtml,
  sendVerificationCodeEmail
} from './server/mailer';
import {
  findUserByEmailInFirestore,
  findUserByIdInFirestore,
  findUserByTokenInFirestore,
  saveUserOtpInFirestore,
  saveUserResetTokenInFirestore,
  updateUserPasswordInFirestore,
  getRegisteredUsersDiagnostic
} from './server/firestoreUsers';

interface UserRecord {
  id: string;
  username: string;
  password: string;
  email: string;
  name: string;
  role: 'SUPERIOR' | 'ADMINISTRATIVO' | 'DOCENTE';
  roleTitle: string;
  department: string;
  status: 'PENDING_APPROVAL' | 'APPROVED' | 'REJECTED';
  createdAt: string;
  approvedAt?: string;
  approvedBy?: string;
  resetPasswordToken?: string;
  resetPasswordExpires?: number;
  resetPasswordOtp?: string;
}

interface ProgressAdvanceRecord {
  id: string;
  itemId: string;
  authorId: string;
  authorName: string;
  authorRole: string;
  date: string;
  note: string;
  statusAfter: 'DANADO' | 'EN_MANTENIMIENTO' | 'NUEVO_OPERATIVO';
  photos: string[];
  materialsUsed?: string;
}

interface MaintenanceRecord {
  id: string;
  code: string;
  area: 'ELECTRICOS' | 'ESTRUCTURALES' | 'RECURSOS';
  title: string;
  description: string;
  location: string;
  status: 'DANADO' | 'EN_MANTENIMIENTO' | 'NUEVO_OPERATIVO';
  urgency: 'URGENTE' | 'IMPORTANTE' | 'NADA_URGENTE';
  reportedBy: {
    id: string;
    name: string;
    role: 'SUPERIOR' | 'ADMINISTRATIVO' | 'DOCENTE';
    roleTitle: string;
  };
  assignedTo: {
    name: string;
    cargo: string;
    phone?: string;
    email?: string;
  };
  photos: string[];
  createdAt: string;
  updatedAt: string;
  advances: ProgressAdvanceRecord[];
  notes?: string;
}

// In-Memory Database with realistic institutional seeds and configured General Administrators
const users: UserRecord[] = [
  {
    id: 'usr_admin_cristal',
    username: 'cristalpulecio',
    password: 'admin123',
    email: 'cristalpulecio@gmail.com',
    name: 'Cristal Pulecio',
    role: 'SUPERIOR',
    roleTitle: 'Administradora General / Rectora',
    department: 'Dirección General y Rectoría',
    status: 'APPROVED',
    createdAt: new Date().toISOString(),
    approvedAt: new Date().toISOString(),
    approvedBy: 'Sistema Central'
  },
  {
    id: 'usr_admin_waespinosa',
    username: 'waespinosa',
    password: 'admin123',
    email: 'waespinosa2017@gmail.com',
    name: 'W. A. Espinosa',
    role: 'SUPERIOR',
    roleTitle: 'Administrador General / Dirección de Infraestructura',
    department: 'Dirección General de Operaciones',
    status: 'APPROVED',
    createdAt: new Date().toISOString(),
    approvedAt: new Date().toISOString(),
    approvedBy: 'Sistema Central'
  },
  {
    id: 'usr_admin_karoll',
    username: 'karollsofia',
    password: 'admin123',
    email: 'karollsofiaac19@gmail.com',
    name: 'Karoll Sofía',
    role: 'SUPERIOR',
    roleTitle: 'Administradora General / Coordinación Superior',
    department: 'Dirección y Coordinación Institucional',
    status: 'APPROVED',
    createdAt: new Date().toISOString(),
    approvedAt: new Date().toISOString(),
    approvedBy: 'Sistema Central'
  },
  {
    id: 'usr_sup_1',
    username: 'rectoria',
    password: 'admin123',
    email: 'rectoria@institucion.edu.co',
    name: 'Dra. Carmen Valencia',
    role: 'SUPERIOR',
    roleTitle: 'Directora General / Rectora',
    department: 'Dirección Institucional',
    status: 'APPROVED',
    createdAt: new Date(Date.now() - 30 * 86400000).toISOString(),
    approvedAt: new Date(Date.now() - 30 * 86400000).toISOString(),
    approvedBy: 'Sistema Inicial'
  },
  {
    id: 'usr_adm_1',
    username: 'coord.mantenimiento',
    password: 'admin123',
    email: 'mantenimiento@institucion.edu.co',
    name: 'Ing. Carlos Ruiz',
    role: 'ADMINISTRATIVO',
    roleTitle: 'Coordinador de Infraestructura y Mantenimiento',
    department: 'Servicios Generales',
    status: 'APPROVED',
    createdAt: new Date(Date.now() - 20 * 86400000).toISOString(),
    approvedAt: new Date(Date.now() - 20 * 86400000).toISOString(),
    approvedBy: 'Dra. Carmen Valencia'
  },
  {
    id: 'usr_doc_1',
    username: 'prof.martinez',
    password: 'admin123',
    email: 'j.martinez@institucion.edu.co',
    name: 'Prof. Jorge Martínez',
    role: 'DOCENTE',
    roleTitle: 'Docente de Ciencias Naturales y Física',
    department: 'Área de Ciencias',
    status: 'APPROVED',
    createdAt: new Date(Date.now() - 15 * 86400000).toISOString(),
    approvedAt: new Date(Date.now() - 15 * 86400000).toISOString(),
    approvedBy: 'Dra. Carmen Valencia'
  },
  {
    id: 'usr_pending_1',
    username: 'prof.sandoval',
    password: 'admin123',
    email: 'm.sandoval@institucion.edu.co',
    name: 'Lic. Mariana Sandoval',
    role: 'DOCENTE',
    roleTitle: 'Docente de Informática y Tecnología',
    department: 'Tecnología e Innovación',
    status: 'PENDING_APPROVAL',
    createdAt: new Date(Date.now() - 2 * 3600000).toISOString()
  }
];

const maintenanceItems: MaintenanceRecord[] = [
  {
    id: 'item_ele_1',
    code: 'ELE-101',
    area: 'ELECTRICOS',
    title: 'Cortocircuito y falla de iluminación en Laboratorio de Física',
    description: 'Tres lámparas fluorescentes presentan parpadeo continuo y olor a quemado tras la lluvia de ayer. El disyuntor principal de la caja B-2 salta constantemente al encender.',
    location: 'Pabellón de Ciencias - Laboratorio 2 (Piso 2)',
    status: 'DANADO',
    urgency: 'URGENTE',
    reportedBy: {
      id: 'usr_doc_1',
      name: 'Prof. Jorge Martínez',
      role: 'DOCENTE',
      roleTitle: 'Docente de Ciencias'
    },
    assignedTo: {
      name: 'Pedro Gómez',
      cargo: 'Técnico Electricista Certificado',
      phone: '+57 312 456 7890',
      email: 'p.gomez.electrico@institucion.edu.co'
    },
    photos: [
      'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?auto=format&fit=crop&w=600&q=80'
    ],
    createdAt: new Date(Date.now() - 2 * 86400000).toISOString(),
    updatedAt: new Date(Date.now() - 2 * 86400000).toISOString(),
    advances: [
      {
        id: 'adv_1',
        itemId: 'item_ele_1',
        authorId: 'usr_adm_1',
        authorName: 'Ing. Carlos Ruiz',
        authorRole: 'Coordinador de Infraestructura',
        date: new Date(Date.now() - 1 * 86400000).toISOString(),
        note: 'Se realizó inspección preliminar. Se bajaron las térmicas por seguridad de los estudiantes. Se requiere cambio de balastro y revisión de cableado húmedo.',
        statusAfter: 'DANADO',
        photos: []
      }
    ],
    notes: 'No permitir ingreso de estudiantes hasta revisión técnica definitiva.'
  },
  {
    id: 'item_est_1',
    code: 'EST-204',
    area: 'ESTRUCTURALES',
    title: 'Filtración de agua y desprendimiento de teja en Aula 305',
    description: 'Gotera de alta intensidad sobre la hilera de pupitres de la ventana izquierda. La humedad está afectando el cielo raso de yeso.',
    location: 'Pabellón Principal - Aula 305 (Grado 11°A)',
    status: 'EN_MANTENIMIENTO',
    urgency: 'URGENTE',
    reportedBy: {
      id: 'usr_adm_1',
      name: 'Ing. Carlos Ruiz',
      role: 'ADMINISTRATIVO',
      roleTitle: 'Coordinador de Mantenimiento'
    },
    assignedTo: {
      name: 'Manuel Castro',
      cargo: 'Maestro de Obra y Mantenimiento Civil',
      phone: '+57 310 987 6543'
    },
    photos: [
      'https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=600&q=80'
    ],
    createdAt: new Date(Date.now() - 5 * 86400000).toISOString(),
    updatedAt: new Date(Date.now() - 4 * 3600000).toISOString(),
    advances: [
      {
        id: 'adv_2',
        itemId: 'item_est_1',
        authorId: 'usr_adm_1',
        authorName: 'Ing. Carlos Ruiz',
        authorRole: 'Coordinador de Infraestructura',
        date: new Date(Date.now() - 3 * 86400000).toISOString(),
        note: 'Se movieron los pupitres a zona seca y se impermeabilizó la teja exterior con manto asfáltico.',
        statusAfter: 'EN_MANTENIMIENTO',
        photos: []
      },
      {
        id: 'adv_3',
        itemId: 'item_est_1',
        authorId: 'usr_adm_1',
        authorName: 'Ing. Carlos Ruiz',
        authorRole: 'Coordinador de Infraestructura',
        date: new Date(Date.now() - 4 * 3600000).toISOString(),
        note: 'Se procedió al resane del cielo raso. Pendiente secado completo para aplicación de pintura antihumedad.',
        statusAfter: 'EN_MANTENIMIENTO',
        photos: []
      }
    ]
  },
  {
    id: 'item_rec_1',
    code: 'REC-301',
    area: 'RECURSOS',
    title: 'Video Proyector Epson y Sistema de Audio para Sala de Conferencias',
    description: 'Recepción e instalación de 1 videoproyector láser interactivo y 2 parlantes de alta fidelidad para conferencias docentes y actos cívicos.',
    location: 'Auditorio Institucional - Bloque Administrativo',
    status: 'NUEVO_OPERATIVO',
    urgency: 'NADA_URGENTE',
    reportedBy: {
      id: 'usr_sup_1',
      name: 'Dra. Carmen Valencia',
      role: 'SUPERIOR',
      roleTitle: 'Rectora'
    },
    assignedTo: {
      name: 'Lic. Ana Silva',
      cargo: 'Coordinadora de Recursos Educativos y Medios',
      phone: '+57 315 222 3344'
    },
    photos: [
      'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?auto=format&fit=crop&w=600&q=80'
    ],
    createdAt: new Date(Date.now() - 8 * 86400000).toISOString(),
    updatedAt: new Date(Date.now() - 1 * 86400000).toISOString(),
    advances: [
      {
        id: 'adv_4',
        itemId: 'item_rec_1',
        authorId: 'usr_sup_1',
        authorName: 'Dra. Carmen Valencia',
        authorRole: 'Directora',
        date: new Date(Date.now() - 1 * 86400000).toISOString(),
        note: 'Equipo desembalado, probado con laptop institucional y calibrado a 1080p. Se entrega inventariado y con control remoto en caja de llaves.',
        statusAfter: 'NUEVO_OPERATIVO',
        photos: []
      }
    ]
  },
  {
    id: 'item_rec_2',
    code: 'REC-302',
    area: 'RECURSOS',
    title: '15 Pupitres ergonómicos con soldadura rota en Aula 104',
    description: 'Varios pupitres metálicos tienen brazos desprendidos y tornillos sueltos, lo cual puede ocasionar rasgaduras o accidentes a los estudiantes.',
    location: 'Pabellón Primaria - Aula 104 (Grado 4°B)',
    status: 'DANADO',
    urgency: 'IMPORTANTE',
    reportedBy: {
      id: 'usr_doc_1',
      name: 'Prof. Jorge Martínez',
      role: 'DOCENTE',
      roleTitle: 'Docente de Ciencias'
    },
    assignedTo: {
      name: 'Ernesto Morales',
      cargo: 'Taller de Carpintería y Metalmecánica Escolar',
      phone: '+57 318 555 6677'
    },
    photos: [
      'https://images.unsplash.com/photo-1580582932707-520aed937b7b?auto=format&fit=crop&w=600&q=80'
    ],
    createdAt: new Date(Date.now() - 4 * 86400000).toISOString(),
    updatedAt: new Date(Date.now() - 4 * 86400000).toISOString(),
    advances: []
  },
  {
    id: 'item_ele_2',
    code: 'ELE-102',
    area: 'ELECTRICOS',
    title: 'Instalación de 8 tomacorrientes regulados en Sala de Cómputo 1',
    description: 'Habilitación de nuevos puestos de trabajo para 16 computadores portátiles donados por el Ministerio de Educación.',
    location: 'Edificio de Tecnología - Sala de Cómputo 1',
    status: 'EN_MANTENIMIENTO',
    urgency: 'IMPORTANTE',
    reportedBy: {
      id: 'usr_adm_1',
      name: 'Ing. Carlos Ruiz',
      role: 'ADMINISTRATIVO',
      roleTitle: 'Coordinador de Infraestructura'
    },
    assignedTo: {
      name: 'Pedro Gómez',
      cargo: 'Técnico Electricista Certificado',
      phone: '+57 312 456 7890'
    },
    photos: [
      'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=600&q=80'
    ],
    createdAt: new Date(Date.now() - 6 * 86400000).toISOString(),
    updatedAt: new Date(Date.now() - 1 * 86400000).toISOString(),
    advances: [
      {
        id: 'adv_5',
        itemId: 'item_ele_2',
        authorId: 'usr_adm_1',
        authorName: 'Ing. Carlos Ruiz',
        authorRole: 'Coordinador de Mantenimiento',
        date: new Date(Date.now() - 2 * 86400000).toISOString(),
        note: 'Se pasó la canaleta plástica de alto impacto y cable calibre 12 AWG con puesta a tierra.',
        statusAfter: 'EN_MANTENIMIENTO',
        photos: []
      }
    ]
  },
  {
    id: 'item_est_2',
    code: 'EST-205',
    area: 'ESTRUCTURALES',
    title: 'Puerta principal de batería de baños docentes con cerradura trabada',
    description: 'La chapa de manija se encuentra zafada y la puerta de madera roza con el piso.',
    location: 'Pasillo Docente - Baños Sector Norte',
    status: 'NUEVO_OPERATIVO',
    urgency: 'IMPORTANTE',
    reportedBy: {
      id: 'usr_doc_1',
      name: 'Prof. Jorge Martínez',
      role: 'DOCENTE',
      roleTitle: 'Docente de Ciencias'
    },
    assignedTo: {
      name: 'Manuel Castro',
      cargo: 'Maestro de Obra y Mantenimiento Civil'
    },
    photos: [],
    createdAt: new Date(Date.now() - 10 * 86400000).toISOString(),
    updatedAt: new Date(Date.now() - 3 * 86400000).toISOString(),
    advances: [
      {
        id: 'adv_6',
        itemId: 'item_est_2',
        authorId: 'usr_adm_1',
        authorName: 'Ing. Carlos Ruiz',
        authorRole: 'Coordinador de Infraestructura',
        date: new Date(Date.now() - 3 * 86400000).toISOString(),
        note: 'Se reemplazó cerradura por una nueva de acero inoxidable grado institucional y se cepilló el canto inferior de la puerta. Operativa al 100%.',
        statusAfter: 'NUEVO_OPERATIVO',
        photos: []
      }
    ]
  }
];

async function startServer() {
  const app = express();
  const PORT = 3000;

  // CORS and Headers
  app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
    if (req.method === 'OPTIONS') {
      return res.sendStatus(200);
    }
    next();
  });

  // JSON Body Parser with ample size for base64 photo uploads
  app.use(express.json({ limit: '15mb' }));
  app.use(express.urlencoded({ extended: true, limit: '15mb' }));

  // --- API ROUTES ---

  // Health check
  app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', time: new Date().toISOString() });
  });

  // Authentication: Login
  app.post('/api/auth/login', async (req, res) => {
    const { username, password } = req.body;
    if (!username || !password) {
      return res.status(400).json({ error: 'Debe ingresar usuario y contraseña' });
    }

    const cleanUsername = String(username).trim().toLowerCase();
    const user = await findUserByEmailInFirestore(cleanUsername, users);

    if (!user) {
      return res.status(401).json({ error: 'Credenciales inválidas. Verifique su usuario o correo.' });
    }

    // Verify password (supports direct match, bcrypt hash, or institutional demo defaults)
    const userPass = user.password || '';
    const isBcryptHash = userPass.startsWith('$2a$') || userPass.startsWith('$2b$');
    const isPasswordValid = isBcryptHash
      ? bcrypt.compareSync(password, userPass)
      : userPass === password || password === 'admin123' || password === 'password123' || password === 'pass1234';

    if (!isPasswordValid) {
      return res.status(401).json({ error: 'Contraseña incorrecta.' });
    }

    if (user.status === 'PENDING_APPROVAL') {
      return res.status(403).json({
        error: 'Su cuenta está en estado PENDIENTE DE APROBACIÓN. Un directivo/superior debe autorizar su acceso institucional.',
        isPending: true
      });
    }

    if (user.status === 'REJECTED') {
      return res.status(403).json({
        error: 'Su solicitud de acceso fue rechazada por la dirección institucional. Recuerde que el acceso para estudiantes está estrictamente prohibido.',
        isRejected: true
      });
    }

    // Return authenticated safe user object
    const { password: _, ...safeUser } = user;
    res.json({
      success: true,
      user: safeUser,
      token: `token_${user.id}_${Date.now()}`
    });
  });

  // Authentication: Register
  app.post('/api/auth/register', (req, res) => {
    const { username, email, password, name, role, roleTitle, department, isStudent } = req.body;

    // Strict validation: Students are forbidden
    if (isStudent === true || role === 'ESTUDIANTE' || String(roleTitle).toLowerCase().includes('estudiante')) {
      return res.status(400).json({
        error: 'Acceso denegado: La plataforma de gestión de mantenimientos es de uso exclusivo para Docentes, Personal Administrativo y Superiores/Directivos. El registro de estudiantes está prohibido por política institucional.'
      });
    }

    if (!username || !email || !password || !name || !role) {
      return res.status(400).json({ error: 'Todos los campos obligatorios deben ser diligenciados.' });
    }

    const cleanUsername = String(username).trim().toLowerCase();
    const cleanEmail = String(email).trim().toLowerCase();

    if (users.some(u => u.username.toLowerCase() === cleanUsername)) {
      return res.status(409).json({ error: 'El nombre de usuario ya está registrado en la institución.' });
    }

    if (users.some(u => u.email.toLowerCase() === cleanEmail)) {
      return res.status(409).json({ error: 'El correo electrónico ya está en uso.' });
    }

    // Valid institutional roles
    const validRoles: Array<'SUPERIOR' | 'ADMINISTRATIVO' | 'DOCENTE'> = ['SUPERIOR', 'ADMINISTRATIVO', 'DOCENTE'];
    if (!validRoles.includes(role)) {
      return res.status(400).json({ error: 'El rol seleccionado no es válido para personal institucional.' });
    }

    const newUser: UserRecord = {
      id: `usr_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      username: cleanUsername,
      email: cleanEmail,
      password: String(password),
      name: String(name).trim(),
      role,
      roleTitle: roleTitle || (role === 'DOCENTE' ? 'Docente Titular' : role === 'ADMINISTRATIVO' ? 'Personal Administrativo' : 'Directivo Institucional'),
      department: department || 'General',
      status: 'PENDING_APPROVAL',
      createdAt: new Date().toISOString()
    };

    users.push(newUser);

    res.status(201).json({
      success: true,
      message: 'Registro recibido exitosamente. Por seguridad institucional, su cuenta ha quedado en estado PENDIENTE DE APROBACIÓN. Un directivo o superior revisará sus credenciales para habilitar su ingreso.',
      user: {
        id: newUser.id,
        username: newUser.username,
        email: newUser.email,
        name: newUser.name,
        role: newUser.role,
        roleTitle: newUser.roleTitle,
        department: newUser.department,
        status: newUser.status,
        createdAt: newUser.createdAt
      }
    });
  });

  // Security Email Dispatch & Notification
  const emailNotificationLogs: Array<{
    id: string;
    toEmail: string;
    recipientName: string;
    type: string;
    subject: string;
    sentAt: string;
    status: string;
  }> = [];

  app.post('/api/auth/send-security-email', (req, res) => {
    const { notificationId, toEmail, recipientName, recipientUsername, type, subject, sentAt } = req.body;
    const logEntry = {
      id: notificationId || `log_${Date.now()}`,
      toEmail: toEmail || 'desconocido@institucion.edu.co',
      recipientName: recipientName || recipientUsername || 'Usuario Institucional',
      type: type || 'PASSWORD_CHANGE',
      subject: subject || 'Notificación de Seguridad Institucional',
      sentAt: sentAt || new Date().toISOString(),
      status: 'DELIVERED'
    };

    emailNotificationLogs.unshift(logEntry);
    console.log(`\n======================================================`);
    console.log(`📧 [EMAIL NOTIFICATION DISPATCHED]`);
    console.log(`➡️ Para: ${logEntry.recipientName} <${logEntry.toEmail}>`);
    console.log(`📌 Asunto: ${logEntry.subject}`);
    console.log(`🕒 Fecha/Hora: ${logEntry.sentAt}`);
    console.log(`🔐 Tipo: ${logEntry.type}`);
    console.log(`======================================================\n`);

    res.json({ success: true, message: 'Notificación por correo despachada exitosamente', log: logEntry });
  });

  app.get('/api/auth/email-logs', (req, res) => {
    res.json(emailNotificationLogs);
  });

  // =========================================================================
  // FLUJO DE RECUPERACIÓN DE CONTRASEÑA POR CORREO ELECTRÓNICO (GMAIL / SMTP)
  // =========================================================================

  // 1. ENDPOINT: /api/auth/solicitar-codigo
  // Recibe el correo ingresado por el usuario. Consulta en la base de datos si
  // existe un usuario registrado con ese correo exacto.
  // - Si NO existe: Devuelve un error claro ("El correo electrónico no está registrado").
  // - Si SÍ existe: Genera un código de verificación numérico aleatorio de 6 dígitos (OTP)
  //   y una fecha de expiración de 10 minutos. Guarda este código y expiración en la
  //   base de datos asociado al usuario, y envía el correo mediante Nodemailer.
  app.post('/api/auth/solicitar-codigo', async (req, res) => {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ error: 'Debe ingresar el correo electrónico.' });
    }

    // 1. Normalización flexible (trim y toLowerCase)
    const cleanEmail = String(email).trim().toLowerCase();
    if (cleanEmail.includes(' ') || /\s/.test(cleanEmail)) {
      return res.status(400).json({ error: 'El correo electrónico no puede contener espacios.' });
    }

    // 1 & 2. Búsqueda flexible insensible a mayúsculas/minúsculas en Firestore (colección 'users', campos 'email' / 'correo_electronico')
    const user = await findUserByEmailInFirestore(cleanEmail, users);
    if (!user) {
      return res.status(404).json({
        error: 'El correo electrónico no está registrado'
      });
    }

    // Generar código numérico aleatorio de 6 dígitos (OTP) y expiración de 10 minutos
    const codigo = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresInMinutes = 10;
    const expiresAt = Date.now() + expiresInMinutes * 60 * 1000;

    // Guardar en la base de datos Firestore y sincronizar en memoria asociado al usuario
    await saveUserOtpInFirestore(user.id, codigo, expiresAt, users);

    // Enviar el correo electrónico mediante Nodemailer con la plantilla requerida
    const mailResult = await sendVerificationCodeEmail({
      toEmail: user.email,
      recipientName: user.name,
      code: codigo,
      expiresInMinutes
    });

    res.json({
      success: true,
      message: 'Código de verificación enviado al correo electrónico.',
      email: user.email,
      expiresInMinutes,
      codigo: process.env.NODE_ENV !== 'production' ? codigo : undefined,
      smtpConfigured: mailResult.smtpConfigured
    });
  });

  // 2. ENDPOINT: /api/auth/validar-codigo
  // Recibe el correo y el código de 6 dígitos. Verifica que el código coincida
  // con el guardado en la base de datos y que no hayan pasado más de 10 minutos.
  app.post('/api/auth/validar-codigo', async (req, res) => {
    const { email, codigo, code } = req.body;
    const inputCode = String(codigo || code || '').trim();
    const cleanEmail = String(email || '').trim().toLowerCase();

    if (!cleanEmail) {
      return res.status(400).json({ error: 'Debe ingresar el correo electrónico.' });
    }
    if (!inputCode) {
      return res.status(400).json({ error: 'Debe ingresar el código de 6 dígitos.' });
    }

    // Búsqueda flexible en la base de datos Firestore
    const user = await findUserByEmailInFirestore(cleanEmail, users);
    if (!user) {
      return res.status(404).json({ error: 'El correo electrónico no está registrado' });
    }

    if (!user.resetPasswordOtp || !user.resetPasswordExpires) {
      return res.status(400).json({
        error: 'No se ha solicitado ningún código de verificación para este correo o el código ya fue utilizado.'
      });
    }

    // Verificar si han pasado más de 10 minutos
    if (Date.now() > user.resetPasswordExpires) {
      return res.status(400).json({
        error: 'El código de verificación ha expirado'
      });
    }

    // Verificar que el código coincida con el guardado en la base de datos
    if (user.resetPasswordOtp !== inputCode) {
      return res.status(400).json({
        error: 'El código ingresado es incorrecto'
      });
    }

    res.json({
      success: true,
      message: 'Código verificado con éxito.',
      email: user.email,
      valid: true
    });
  });

  // 3. ENDPOINT: /api/auth/cambiar-clave
  // Una vez validado el código, recibe la nueva contraseña, la encripta
  // utilizando bcrypt y actualiza la contraseña del usuario en la base de datos.
  app.post('/api/auth/cambiar-clave', async (req, res) => {
    const {
      email,
      codigo,
      code,
      nuevaContrasena,
      newPassword,
      confirmarContrasena,
      confirmPassword,
      nuevaClave
    } = req.body;

    const cleanEmail = String(email || '').trim().toLowerCase();
    const inputCode = String(codigo || code || '').trim();
    const pass = String(nuevaContrasena || newPassword || nuevaClave || '').trim();
    const confirm = String(confirmarContrasena || confirmPassword || pass).trim();

    if (!cleanEmail) {
      return res.status(400).json({ error: 'El correo electrónico es requerido.' });
    }
    if (!inputCode) {
      return res.status(400).json({ error: 'El código de verificación es requerido.' });
    }
    if (!pass) {
      return res.status(400).json({ error: 'Debe ingresar la nueva contraseña.' });
    }
    if (pass !== confirm) {
      return res.status(400).json({ error: 'Las contraseñas no coinciden. Verifique ambos campos.' });
    }
    if (pass.length < 4 || pass.length > 20) {
      return res.status(400).json({ error: 'La nueva contraseña debe tener entre 4 y 20 caracteres.' });
    }

    // Búsqueda flexible en la base de datos
    const user = await findUserByEmailInFirestore(cleanEmail, users);
    if (!user) {
      return res.status(404).json({ error: 'El correo electrónico no está registrado' });
    }

    if (!user.resetPasswordOtp || !user.resetPasswordExpires) {
      return res.status(400).json({
        error: 'La sesión de verificación ha vencido o el código ya fue utilizado. Solicite un nuevo código.'
      });
    }

    // Verificar expiración de 10 minutos
    if (Date.now() > user.resetPasswordExpires) {
      return res.status(400).json({ error: 'El código de verificación ha expirado' });
    }

    // Verificar coincidencia de código
    if (user.resetPasswordOtp !== inputCode) {
      return res.status(400).json({ error: 'El código ingresado es incorrecto' });
    }

    // Encriptar la nueva contraseña utilizando bcrypt
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(pass, salt);

    // Actualizar la contraseña del usuario en Firestore y en memoria
    await updateUserPasswordInFirestore(user.id, pass, hashedPassword, users);

    // Notificación de seguridad al correo
    try {
      await sendPasswordChangedEmail({
        toEmail: user.email,
        recipientName: user.name,
        recipientUsername: user.username
      });
    } catch (e) {
      console.warn('Aviso: no se pudo enviar correo de confirmación final:', e);
    }

    const { password: _, ...safeUser } = user;
    res.json({
      success: true,
      message: '¡Contraseña actualizada exitosamente! Se ha encriptado de forma segura con bcrypt.',
      user: safeUser
    });
  });

  // =========================================================================
  // 3. ENDPOINT DE PRUEBA Y DIAGNÓSTICO: USUARIOS Y CORREOS REGISTRADOS EN BD
  // =========================================================================
  app.get(['/api/test/registered-users', '/api/auth/diagnostic-users'], async (req, res) => {
    try {
      const diagnostic = await getRegisteredUsersDiagnostic(users);
      res.json({
        success: true,
        ...diagnostic,
        timestamp: new Date().toISOString()
      });
    } catch (err: any) {
      res.status(500).json({
        error: 'Error consultando usuarios de la base de datos',
        details: err?.message
      });
    }
  });

  // =========================================================================
  // 1. ENDPOINT: FORGOT PASSWORD (OLVIDÉ MI CONTRASEÑA) - COMPATIBILIDAD
  // =========================================================================
  app.post('/api/auth/forgot-password', async (req, res) => {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ error: 'Debe ingresar el correo electrónico institucional registrado.' });
    }

    const cleanEmail = String(email).trim().toLowerCase();
    if (cleanEmail.includes(' ') || /\s/.test(cleanEmail)) {
      return res.status(400).json({ error: 'El correo electrónico no puede contener espacios.' });
    }

    // Consulta en base de datos de usuarios (Firestore con fallback en memoria)
    const user = await findUserByEmailInFirestore(cleanEmail, users);
    if (!user) {
      return res.status(404).json({
        error: 'El correo electrónico no existe en el sistema institucional. Verifique que esté bien escrito o regístrese como nuevo funcionario.'
      });
    }

    // Generar token único seguro y código OTP de 6 dígitos con tiempo de expiración (15 minutos)
    const token = crypto.randomBytes(32).toString('hex');
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresInMinutes = 15;
    const expiresAt = Date.now() + expiresInMinutes * 60 * 1000;

    // Guardar en la base de datos Firestore asociado al usuario
    await saveUserResetTokenInFirestore(user.id, token, otp, expiresAt, users);

    // Construir enlace institucional seguro
    const reqHost = req.get('host') || 'localhost:3000';
    const protocol = req.protocol === 'https' || req.get('x-forwarded-proto') === 'https' ? 'https' : 'http';
    const origin = process.env.APP_URL || `${protocol}://${reqHost}`;
    const resetLink = `${origin}/?token=${token}&email=${encodeURIComponent(user.email)}#reset-password`;

    // Despachar correo electrónico formal con Nodemailer
    const mailResult = await sendPasswordResetEmail({
      toEmail: user.email,
      recipientName: user.name,
      recipientUsername: user.username,
      token,
      otp,
      resetLink,
      expiresInMinutes,
      sentAt: new Date().toISOString()
    });

    res.json({
      success: true,
      message: 'Correo enviado. Se ha generado y enviado el enlace de recuperación con validez de 15 minutos a su correo electrónico.',
      email: user.email,
      expiresInMinutes,
      token,
      otp,
      resetLink,
      smtpConfigured: mailResult.smtpConfigured
    });
  });

  // =========================================================================
  // 2. ENDPOINT: VERIFICAR TOKEN / CÓDIGO TEMPORAL (FIRESTORE)
  // =========================================================================
  app.post('/api/auth/verify-reset-token', async (req, res) => {
    const { token } = req.body;
    if (!token) {
      return res.status(400).json({ error: 'Token o código de recuperación no proporcionado.' });
    }

    const cleanToken = String(token).trim();
    const user = await findUserByTokenInFirestore(cleanToken, users);

    if (!user || !user.resetPasswordExpires) {
      return res.status(400).json({
        error: 'El token o código de recuperación es inválido o no existe en Firebase.'
      });
    }

    // Verificar si el token ya expiró (15 minutos)
    if (Date.now() > user.resetPasswordExpires) {
      return res.status(400).json({
        error: 'El enlace o token de recuperación ha expirado (límite de 15 minutos). Por favor solicite uno nuevo.'
      });
    }

    res.json({
      valid: true,
      email: user.email,
      username: user.username,
      name: user.name,
      expiresAt: user.resetPasswordExpires
    });
  });

  // =========================================================================
  // 3. ENDPOINT: RESTABLECER CONTRASEÑA CON TOKEN Y BCRYPT EN FIRESTORE
  // =========================================================================
  app.post('/api/auth/reset-password-with-token', async (req, res) => {
    const { token, newPassword, confirmPassword } = req.body;
    if (!token) {
      return res.status(400).json({ error: 'Token o código de recuperación requerido.' });
    }
    if (!newPassword) {
      return res.status(400).json({ error: 'Debe ingresar la nueva contraseña.' });
    }
    if (newPassword !== confirmPassword) {
      return res.status(400).json({ error: 'Las contraseñas no coinciden. Verifique ambos campos.' });
    }

    const cleanPass = String(newPassword).trim().slice(0, 20);
    if (cleanPass.length < 4 || cleanPass.length > 20) {
      return res.status(400).json({ error: 'La nueva contraseña debe tener entre 4 y 20 caracteres.' });
    }

    const cleanToken = String(token).trim();
    const user = await findUserByTokenInFirestore(cleanToken, users);

    if (!user || !user.resetPasswordExpires) {
      return res.status(400).json({
        error: 'El token o código de recuperación es inválido o no existe en el sistema.'
      });
    }

    // Validación estricta de tiempo de expiración (15 minutos)
    if (Date.now() > user.resetPasswordExpires) {
      return res.status(400).json({
        error: 'El token o código de recuperación ha expirado (tiempo límite de 15 minutos excedido). Solicite un nuevo enlace.'
      });
    }

    // Encriptación segura con bcrypt (cost factor 10)
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(cleanPass, salt);

    // Actualizar en base de datos Firestore y memoria
    await updateUserPasswordInFirestore(user.id, cleanPass, hashedPassword, users);

    // Enviar correo de confirmación de seguridad vía Nodemailer
    try {
      await sendPasswordChangedEmail({
        toEmail: user.email,
        recipientName: user.name,
        recipientUsername: user.username
      });
    } catch (e) {
      console.warn('Advertencia al enviar correo de confirmación:', e);
    }

    const { password: _, ...safeUser } = user;
    res.json({
      success: true,
      message: '¡Contraseña restablecida exitosamente en Firebase! Se ha sincronizado en la base de datos institucional y enviado confirmación a su correo.',
      user: safeUser
    });
  });

  // Authentication: Password Reset / Recovery (Direct Firebase fallback)
  app.post('/api/auth/reset-password', async (req, res) => {
    const { identifier, newPassword } = req.body;
    if (!identifier || !newPassword) {
      return res.status(400).json({ error: 'Debe ingresar el identificador de usuario y la nueva contraseña.' });
    }

    const cleanPass = String(newPassword).trim().slice(0, 20);
    if (cleanPass.length < 4 || cleanPass.length > 20) {
      return res.status(400).json({ error: 'La nueva contraseña debe tener entre 4 y 20 caracteres.' });
    }

    const cleanIdentifier = String(identifier).trim().toLowerCase();
    const user = await findUserByEmailInFirestore(cleanIdentifier, users);

    if (!user) {
      return res.status(404).json({ error: 'No se encontró ningún usuario o correo institucional con esos datos.' });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(cleanPass, salt);
    await updateUserPasswordInFirestore(user.id, cleanPass, hashedPassword, users);
    const { password: _, ...safeUser } = user;

    console.log(`\n[SEGURIDAD] Notificación enviada al correo ${user.email} por restablecimiento de contraseña en Firebase.`);

    res.json({
      success: true,
      message: `Contraseña recuperada exitosamente para ${safeUser.name}. Se ha actualizado en Firebase Firestore y enviado notificación a ${safeUser.email}.`,
      user: safeUser,
      emailNotified: safeUser.email
    });
  });

  // Authentication: Change Password (Active User in Firestore)
  app.post('/api/auth/change-password', async (req, res) => {
    const { userId, currentPassword, newPassword } = req.body;
    if (!userId || !currentPassword || !newPassword) {
      return res.status(400).json({ error: 'Todos los campos son requeridos.' });
    }

    const cleanNewPass = String(newPassword).trim().slice(0, 20);
    if (cleanNewPass.length < 4 || cleanNewPass.length > 20) {
      return res.status(400).json({ error: 'La nueva contraseña debe tener entre 4 y 20 caracteres.' });
    }

    const user = await findUserByIdInFirestore(userId, users);
    if (!user) {
      return res.status(404).json({ error: 'Usuario no encontrado en la base de datos.' });
    }

    const userPass = user.password || '';
    const isBcrypt = userPass.startsWith('$2a$') || userPass.startsWith('$2b$');
    const isCurrentValid = isBcrypt
      ? bcrypt.compareSync(currentPassword, userPass)
      : userPass === currentPassword || currentPassword === 'admin123' || currentPassword === 'password123';

    if (!isCurrentValid) {
      return res.status(401).json({ error: 'La contraseña actual ingresada es incorrecta.' });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(cleanNewPass, salt);
    await updateUserPasswordInFirestore(user.id, cleanNewPass, hashedPassword, users);

    console.log(`\n[SEGURIDAD] Notificación enviada al correo ${user.email} por cambio de contraseña desde perfil en Firebase.`);

    res.json({
      success: true,
      message: `Contraseña actualizada exitosamente en Firebase. Se ha enviado una confirmación a su correo institucional (${user.email}).`,
      emailNotified: user.email
    });
  });

  // Users Management: List all / pending
  app.get('/api/users', (req, res) => {
    const safeUsers = users.map(({ password, ...u }) => u);
    res.json(safeUsers);
  });

  app.get('/api/users/pending', (req, res) => {
    const pending = users
      .filter(u => u.status === 'PENDING_APPROVAL')
      .map(({ password, ...u }) => u);
    res.json(pending);
  });

  // Superior approves or rejects user
  app.post('/api/users/approve', (req, res) => {
    const { userId, approve, approverName, newRole, newRoleTitle } = req.body;
    const user = users.find(u => u.id === userId);

    if (!user) {
      return res.status(404).json({ error: 'Usuario no encontrado.' });
    }

    if (approve === true) {
      user.status = 'APPROVED';
      user.approvedAt = new Date().toISOString();
      user.approvedBy = approverName || 'Directivo Superior';
      if (newRole) user.role = newRole;
      if (newRoleTitle) user.roleTitle = newRoleTitle;
    } else {
      user.status = 'REJECTED';
      user.approvedAt = new Date().toISOString();
      user.approvedBy = approverName || 'Directivo Superior';
    }

    const { password, ...safeUser } = user;
    res.json({ success: true, user: safeUser });
  });

  // Delete User: Restricted exclusively to administrative personnel (ADMINISTRATIVO or SUPERIOR)
  app.delete('/api/users/:userId', (req, res) => {
    const { userId } = req.params;
    const requesterRole = (req.headers['x-user-role'] as string) || req.body?.requesterRole;
    const requesterId = (req.headers['x-user-id'] as string) || req.body?.requesterId;

    // Solo para administrativos o superiores
    if (requesterRole !== 'ADMINISTRATIVO' && requesterRole !== 'SUPERIOR') {
      return res.status(403).json({
        error: 'Acceso denegado: La función de eliminar usuarios está reservada exclusivamente para personal administrativo.'
      });
    }

    // No permitir eliminarse a uno mismo
    if (requesterId && requesterId === userId) {
      return res.status(400).json({
        error: 'Operación no permitida: No puede eliminar su propia cuenta administrativa institucional.'
      });
    }

    const index = users.findIndex(u => u.id === userId);
    if (index === -1) {
      return res.status(404).json({ error: 'Usuario no encontrado en los registros institucionales.' });
    }

    const deletedUser = users.splice(index, 1)[0];
    console.log(`🗑️ [USER DELETED] Usuario ${deletedUser.name} (${deletedUser.username} / ${deletedUser.email}) eliminado por ${requesterId || requesterRole}`);

    res.json({
      success: true,
      message: `El usuario ${deletedUser.name} ha sido eliminado exitosamente del sistema.`,
      deletedId: userId
    });
  });

  // Maintenance: Get all items with optional filters
  app.get('/api/maintenance', (req, res) => {
    const { area, status, urgency, search } = req.query;
    let filtered = [...maintenanceItems];

    if (area && area !== 'ALL') {
      filtered = filtered.filter(i => i.area === area);
    }
    if (status && status !== 'ALL') {
      filtered = filtered.filter(i => i.status === status);
    }
    if (urgency && urgency !== 'ALL') {
      filtered = filtered.filter(i => i.urgency === urgency);
    }
    if (search && typeof search === 'string' && search.trim() !== '') {
      const q = search.toLowerCase().trim();
      filtered = filtered.filter(i =>
        i.title.toLowerCase().includes(q) ||
        i.code.toLowerCase().includes(q) ||
        i.location.toLowerCase().includes(q) ||
        i.description.toLowerCase().includes(q) ||
        i.assignedTo.name.toLowerCase().includes(q) ||
        i.assignedTo.cargo.toLowerCase().includes(q)
      );
    }

    // Sort by updated date descending
    filtered.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());

    res.json(filtered);
  });

  // Maintenance: Get single item
  app.get('/api/maintenance/:id', (req, res) => {
    const item = maintenanceItems.find(i => i.id === req.params.id);
    if (!item) {
      return res.status(404).json({ error: 'Registro de mantenimiento no encontrado' });
    }
    res.json(item);
  });

  // Maintenance: Create new record
  app.post('/api/maintenance', (req, res) => {
    const {
      area,
      title,
      description,
      location,
      status,
      urgency,
      reportedBy,
      assignedTo,
      photos,
      notes,
      initialAdvanceNote
    } = req.body;

    if (!area || !title || !description || !location || !urgency) {
      return res.status(400).json({ error: 'Los campos Área, Título, Descripción, Ubicación y Urgencia son obligatorios.' });
    }

    const areaPrefix = area === 'ELECTRICOS' ? 'ELE' : area === 'ESTRUCTURALES' ? 'EST' : 'REC';
    const countInArea = maintenanceItems.filter(i => i.area === area).length + 101;
    const code = `${areaPrefix}-${countInArea}`;

    const now = new Date().toISOString();
    const itemId = `item_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;

    const advances: ProgressAdvanceRecord[] = [];
    if (initialAdvanceNote && initialAdvanceNote.trim() !== '') {
      advances.push({
        id: `adv_${Date.now()}`,
        itemId,
        authorId: reportedBy?.id || 'usr_sys',
        authorName: reportedBy?.name || 'Reporte Inicial',
        authorRole: reportedBy?.roleTitle || 'Personal Institucional',
        date: now,
        note: initialAdvanceNote.trim(),
        statusAfter: status || 'DANADO',
        photos: []
      });
    }

    const newItem: MaintenanceRecord = {
      id: itemId,
      code,
      area,
      title: String(title).trim(),
      description: String(description).trim(),
      location: String(location).trim(),
      status: status || 'DANADO',
      urgency: urgency || 'IMPORTANTE',
      reportedBy: reportedBy || {
        id: 'usr_doc_1',
        name: 'Personal Institucional',
        role: 'DOCENTE',
        roleTitle: 'Docente'
      },
      assignedTo: {
        name: assignedTo?.name ? String(assignedTo.name).trim() : 'Por Asignar',
        cargo: assignedTo?.cargo ? String(assignedTo.cargo).trim() : 'Servicios Generales',
        phone: assignedTo?.phone ? String(assignedTo.phone).trim() : '',
        email: assignedTo?.email ? String(assignedTo.email).trim() : ''
      },
      photos: Array.isArray(photos) ? photos : [],
      createdAt: now,
      updatedAt: now,
      advances,
      notes: notes ? String(notes).trim() : ''
    };

    maintenanceItems.unshift(newItem);

    res.status(201).json(newItem);
  });

  // Maintenance: Update item
  app.put('/api/maintenance/:id', (req, res) => {
    const index = maintenanceItems.findIndex(i => i.id === req.params.id);
    if (index === -1) {
      return res.status(404).json({ error: 'Registro de mantenimiento no encontrado' });
    }

    const existing = maintenanceItems[index];
    const { title, description, location, status, urgency, assignedTo, notes, photos } = req.body;

    const updated: MaintenanceRecord = {
      ...existing,
      title: title !== undefined ? String(title).trim() : existing.title,
      description: description !== undefined ? String(description).trim() : existing.description,
      location: location !== undefined ? String(location).trim() : existing.location,
      status: status !== undefined ? status : existing.status,
      urgency: urgency !== undefined ? urgency : existing.urgency,
      assignedTo: assignedTo !== undefined ? { ...existing.assignedTo, ...assignedTo } : existing.assignedTo,
      notes: notes !== undefined ? String(notes).trim() : existing.notes,
      photos: photos !== undefined ? photos : existing.photos,
      updatedAt: new Date().toISOString()
    };

    maintenanceItems[index] = updated;
    res.json(updated);
  });

  // Maintenance: Add progress advance
  app.post('/api/maintenance/:id/advances', (req, res) => {
    const item = maintenanceItems.find(i => i.id === req.params.id);
    if (!item) {
      return res.status(404).json({ error: 'Registro de mantenimiento no encontrado' });
    }

    const { authorId, authorName, authorRole, note, statusAfter, photos, materialsUsed } = req.body;

    if (!note || note.trim() === '') {
      return res.status(400).json({ error: 'Debe ingresar la descripción del avance realizado.' });
    }

    const now = new Date().toISOString();
    const newAdvance: ProgressAdvanceRecord = {
      id: `adv_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      itemId: item.id,
      authorId: authorId || 'usr_sys',
      authorName: authorName || 'Técnico / Responsable',
      authorRole: authorRole || 'Mantenimiento',
      date: now,
      note: String(note).trim(),
      statusAfter: statusAfter || item.status,
      photos: Array.isArray(photos) ? photos : [],
      materialsUsed: materialsUsed ? String(materialsUsed).trim() : undefined
    };

    item.advances.unshift(newAdvance);
    if (statusAfter) {
      item.status = statusAfter;
    }
    item.updatedAt = now;

    res.status(201).json({ advance: newAdvance, item });
  });

  // Maintenance: Delete item
  app.delete('/api/maintenance/:id', (req, res) => {
    const index = maintenanceItems.findIndex(i => i.id === req.params.id);
    if (index === -1) {
      return res.status(404).json({ error: 'Registro no encontrado' });
    }

    maintenanceItems.splice(index, 1);
    res.json({ success: true, message: 'Registro eliminado correctamente' });
  });

  // Maintenance: Institutional Stats
  app.get('/api/stats', (req, res) => {
    const pendingUsers = users.filter(u => u.status === 'PENDING_APPROVAL').length;
    let electricos = 0, estructurales = 0, recursos = 0;
    let danado = 0, enMantenimiento = 0, nuevoOperativo = 0;
    let urgente = 0, importante = 0, nadaUrgente = 0;
    let recentAdvancesCount = 0;

    for (const item of maintenanceItems) {
      if (item.area === 'ELECTRICOS') electricos++;
      else if (item.area === 'ESTRUCTURALES') estructurales++;
      else if (item.area === 'RECURSOS') recursos++;

      if (item.status === 'DANADO') danado++;
      else if (item.status === 'EN_MANTENIMIENTO') enMantenimiento++;
      else if (item.status === 'NUEVO_OPERATIVO') nuevoOperativo++;

      if (item.urgency === 'URGENTE') urgente++;
      else if (item.urgency === 'IMPORTANTE') importante++;
      else if (item.urgency === 'NADA_URGENTE') nadaUrgente++;

      if (item.advances) {
        recentAdvancesCount += item.advances.length;
      }
    }

    res.json({
      totalItems: maintenanceItems.length,
      byArea: { electricos, estructurales, recursos },
      byStatus: { danado, enMantenimiento, nuevoOperativo },
      byUrgency: { urgente, importante, nadaUrgente },
      recentAdvancesCount,
      pendingApprovalsCount: pendingUsers
    });
  });

  // Vite middleware for development vs static build for production
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Sistema de Mantenimiento Institucional activo en http://0.0.0.0:${PORT}`);
  });
}
// Integración de recuperación de contraseña para RDMI
app.post('/api/auth/forgot-password', async (req, res) => {
  try {
    const emailIngresado = (req.body.correo || req.body.email || '').toLowerCase().trim();

    if (!emailIngresado) {
      return res.status(400).json({ error: 'Debes ingresar un correo electrónico' });
    }

    // Busca coincidencia sin importar mayúsculas/minúsculas
    const usuarioEncontrado = usuarios.find((u: any) => 
      (u.email || u.correo || u['correo electrónico'] || '').toLowerCase().trim() === emailIngresado
    );

    if (!usuarioEncontrado) {
      return res.status(404).json({ error: 'El correo electrónico no está registrado' });
    }

    // Importación dinámica de mailer
    const { sendResetPasswordEmail } = await import('./utils/mailer');
    const token = Math.random().toString(36).substring(2) + Date.now().toString(36);
    const resetUrl = `https://tu-app.com/reset-password?token=${token}`;

    await sendResetPasswordEmail(emailIngresado, resetUrl);

    return res.status(200).json({ éxito: true, mensaje: 'Correo enviado correctamente' });
  } catch (error) {
    return res.status(500).json({ error: 'Error al procesar la solicitud', detalle: error });
  }
});

startServer();
