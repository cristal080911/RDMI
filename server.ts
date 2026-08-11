import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';

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

// In-Memory Database with realistic institutional seeds
const users: UserRecord[] = [
  {
    id: 'usr_sup_1',
    username: 'rectoria',
    password: 'password123',
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
    password: 'password123',
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
    password: 'password123',
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
    password: 'password123',
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

  // JSON Body Parser with ample size for base64 photo uploads
  app.use(express.json({ limit: '15mb' }));
  app.use(express.urlencoded({ extended: true, limit: '15mb' }));

  // --- API ROUTES ---

  // Health check
  app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', time: new Date().toISOString() });
  });

  // Authentication: Login
  app.post('/api/auth/login', (req, res) => {
    const { username, password } = req.body;
    if (!username || !password) {
      return res.status(400).json({ error: 'Debe ingresar usuario y contraseña' });
    }

    const cleanUsername = String(username).trim().toLowerCase();
    const user = users.find(u => u.username.toLowerCase() === cleanUsername || u.email.toLowerCase() === cleanUsername);

    if (!user) {
      return res.status(401).json({ error: 'Credenciales inválidas. Verifique su usuario o correo.' });
    }

    if (user.password !== password) {
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

startServer();
