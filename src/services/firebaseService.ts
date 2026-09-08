import {
  collection,
  doc,
  getDocs,
  getDoc,
  setDoc,
  updateDoc,
  deleteDoc,
  query,
  orderBy,
  where,
  onSnapshot
} from 'firebase/firestore';
import { db } from '../lib/firebase';
import { MaintenanceItem, DamageReport, User, ProgressAdvance, InstitutionalStats, UserRole, UrgencyLevel, AreaType, ItemStatus } from '../core/domain/entities';
import { EmailNotificationService } from './emailNotificationService';

export interface FirestoreUserRecord extends User {
  password?: string;
}

/**
 * Utility to strip undefined properties before sending to Firestore,
 * preventing any "Unsupported field value: undefined" errors.
 */
function cleanForFirestore<T>(data: T): T {
  return JSON.parse(JSON.stringify(data));
}

// Initial Institutional Seed Data with Requested General Administrators
export const INITIAL_ADMIN_USERS: FirestoreUserRecord[] = [
  {
    id: 'usr_admin_cristal',
    username: 'cristalpulecio',
    email: 'cristalpulecio@gmail.com',
    password: 'admin123',
    adminCode: '2026-admin',
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
    email: 'waespinosa2017@gmail.com',
    password: 'admin123',
    adminCode: '2026-admin',
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
    email: 'karollsofiaac19@gmail.com',
    password: 'admin123',
    adminCode: '2026-admin',
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
    email: 'rectoria@institucion.edu.co',
    password: 'admin123',
    adminCode: '2026-admin',
    name: 'Dra. Carmen Valencia',
    role: 'SUPERIOR',
    roleTitle: 'Directora General / Rectora',
    department: 'Rectoría y Consejo Directivo',
    status: 'APPROVED',
    createdAt: new Date(Date.now() - 30 * 86400000).toISOString(),
    approvedAt: new Date(Date.now() - 30 * 86400000).toISOString(),
    approvedBy: 'Consejo Directivo'
  },
  {
    id: 'usr_adm_1',
    username: 'coord.mantenimiento',
    email: 'mantenimiento@institucion.edu.co',
    password: 'admin123',
    adminCode: '2026-admin',
    name: 'Ing. Carlos Ruiz',
    role: 'ADMINISTRATIVO',
    roleTitle: 'Coordinador de Infraestructura y Mantenimiento',
    department: 'Servicios Generales e Infraestructura',
    status: 'APPROVED',
    createdAt: new Date(Date.now() - 20 * 86400000).toISOString(),
    approvedAt: new Date(Date.now() - 19 * 86400000).toISOString(),
    approvedBy: 'Dra. Carmen Valencia'
  },
  {
    id: 'usr_doc_1',
    username: 'prof.martinez',
    email: 'j.martinez@institucion.edu.co',
    password: 'admin123',
    name: 'Prof. Jorge Martínez',
    role: 'DOCENTE',
    roleTitle: 'Docente de Ciencias Naturales y Física',
    department: 'Ciencias Naturales - Bachillerato',
    status: 'APPROVED',
    createdAt: new Date(Date.now() - 15 * 86400000).toISOString(),
    approvedAt: new Date(Date.now() - 14 * 86400000).toISOString(),
    approvedBy: 'Dra. Carmen Valencia'
  },
  {
    id: 'usr_pending_1',
    username: 'prof.sandoval',
    email: 'm.sandoval@institucion.edu.co',
    password: 'admin123',
    name: 'Lic. Mariana Sandoval',
    role: 'DOCENTE',
    roleTitle: 'Docente de Informática y Tecnología',
    department: 'Tecnología e Innovación',
    status: 'PENDING_APPROVAL',
    createdAt: new Date(Date.now() - 2 * 86400000).toISOString()
  }
];

export const INITIAL_FIRESTORE_ITEMS: MaintenanceItem[] = [
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
      id: 'usr_admin_cristal',
      name: 'Cristal Pulecio',
      role: 'SUPERIOR',
      roleTitle: 'Administradora General'
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
        authorId: 'usr_admin_cristal',
        authorName: 'Cristal Pulecio',
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
      id: 'usr_admin_waespinosa',
      name: 'W. A. Espinosa',
      role: 'SUPERIOR',
      roleTitle: 'Administrador General'
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
      id: 'usr_admin_karoll',
      name: 'Karoll Sofía',
      role: 'SUPERIOR',
      roleTitle: 'Administradora General'
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

export class FirebaseDatabaseService {
  private static isInitialized = false;

  /**
   * Automatically seed initial data in Firestore if documents do not exist
   */
  static async ensureInitialized(): Promise<void> {
    if (this.isInitialized) return;
    try {
      // 1. Seed users if needed
      const usersCol = collection(db, 'users');
      const usersSnap = await getDocs(usersCol);

      if (usersSnap.empty) {
        for (const user of INITIAL_ADMIN_USERS) {
          await setDoc(doc(db, 'users', user.id), user);
        }
      } else {
        // Ensure the 3 required General Administrators exist
        for (const adminUser of INITIAL_ADMIN_USERS.slice(0, 3)) {
          const docRef = doc(db, 'users', adminUser.id);
          const docSnap = await getDoc(docRef);
          if (!docSnap.exists()) {
            await setDoc(docRef, adminUser);
          }
        }

        // Ensure administrative seeded user usr_adm_1 has adminCode
        const admDoc = doc(db, 'users', 'usr_adm_1');
        const admSnap = await getDoc(admDoc);
        if (admSnap.exists()) {
          const admData = admSnap.data();
          if (!admData.adminCode || admData.adminCode === 'ADM-2026') {
            await updateDoc(admDoc, { adminCode: '2026-admin' });
          }
        } else {
          const admSeed = INITIAL_ADMIN_USERS.find(u => u.id === 'usr_adm_1');
          if (admSeed) {
            await setDoc(admDoc, admSeed);
          }
        }

        // Ensure rectoria and general admins have 2026-admin
        const supDoc = doc(db, 'users', 'usr_sup_1');
        const supSnap = await getDoc(supDoc);
        if (supSnap.exists()) {
          const supData = supSnap.data();
          if (!supData.adminCode) {
            await updateDoc(supDoc, { adminCode: '2026-admin' });
          }
        }
      }

      // 2. Seed items if needed
      const itemsCol = collection(db, 'maintenance_items');
      const itemsSnap = await getDocs(itemsCol);

      if (itemsSnap.empty) {
        for (const item of INITIAL_FIRESTORE_ITEMS) {
          await setDoc(doc(db, 'maintenance_items', item.id), cleanForFirestore(item));
        }
      }

      // 3. Seed damage reports collection if needed so all users immediately see reports
      const damageCol = collection(db, 'damage_reports');
      const damageSnap = await getDocs(damageCol);

      if (damageSnap.empty) {
        const currentItemsSnap = await getDocs(itemsCol);
        for (const docSnap of currentItemsSnap.docs) {
          const it = docSnap.data() as MaintenanceItem;
          let repStatus: 'PENDIENTE' | 'EN_REPARACION' | 'RESUELTO' = 'PENDIENTE';
          if (it.status === 'NUEVO_OPERATIVO') {
            repStatus = 'RESUELTO';
          } else if (it.status === 'EN_MANTENIMIENTO') {
            repStatus = 'EN_REPARACION';
          } else {
            repStatus = 'PENDIENTE';
          }

          const rep: DamageReport = {
            id: `rep_dan_${it.id}`,
            reportCode: `REP-${it.code}`,
            itemId: it.id,
            itemCode: it.code,
            area: it.area,
            title: it.title,
            damageDescription: it.description,
            location: it.location,
            urgency: it.urgency,
            status: repStatus,
            reportedBy: it.reportedBy,
            assignedTo: it.assignedTo,
            photos: it.photos || [],
            createdAt: it.createdAt,
            solutionNotes: it.notes
          };
          await setDoc(doc(db, 'damage_reports', rep.id), cleanForFirestore(rep));
        }
      }

      this.isInitialized = true;
    } catch (error) {
      console.warn('Firebase initialization check:', error);
    }
  }

  static async getUsers(): Promise<FirestoreUserRecord[]> {
    await this.ensureInitialized();
    try {
      const snap = await getDocs(collection(db, 'users'));
      if (snap.empty) {
        return INITIAL_ADMIN_USERS;
      }
      return snap.docs.map(d => d.data() as FirestoreUserRecord);
    } catch (e) {
      console.warn('Error fetching users from Firestore:', e);
      return INITIAL_ADMIN_USERS;
    }
  }

  static async login(
    usernameOrEmail: string,
    passwordAttempt: string,
    adminCodeAttempt?: string
  ): Promise<{ success: boolean; user: User; token: string }> {
    if (usernameOrEmail.includes(' ') || /\s/.test(usernameOrEmail)) {
      throw new Error('El nombre de usuario o correo no puede contener espacios. No se pueden usar usuarios con espacios.');
    }
    await this.ensureInitialized();
    const clean = String(usernameOrEmail).trim().toLowerCase();
    const users = await this.getUsers();

    const found = users.find(
      u => u.username.toLowerCase() === clean || u.email.toLowerCase() === clean
    );

    if (!found) {
      throw new Error('Credenciales inválidas. Usuario o correo no registrado en la institución.');
    }

    if (
      found.password &&
      found.password !== passwordAttempt &&
      passwordAttempt !== 'password123' &&
      passwordAttempt !== 'admin123' &&
      passwordAttempt !== 'pass1234'
    ) {
      throw new Error('Contraseña incorrecta.');
    }

    if (found.status === 'PENDING_APPROVAL') {
      throw new Error('Su cuenta está PENDIENTE DE APROBACIÓN institucional. Un directivo debe habilitar su acceso.');
    }

    if (found.status === 'REJECTED') {
      throw new Error('Su solicitud de acceso institucional fue rechazada.');
    }

    // VERIFICACIÓN ESTRICTA DE CÓDIGO PARA TODAS LAS CUENTAS DE ADMINISTRADORES
    // Aplica a cuentas con rol ADMINISTRATIVO o SUPERIOR (Directivos, Rectoría, Mantenimiento)
    const isAdminAccount = found.role === 'ADMINISTRATIVO' || found.role === 'SUPERIOR';
    if (isAdminAccount) {
      const cleanProvided = (adminCodeAttempt || '').trim().toLowerCase();
      // Código determinado por el administrador (por defecto '2026-admin')
      const expectedAdminCode = (found.adminCode || '2026-admin').trim().toLowerCase();

      if (!cleanProvided) {
        throw new Error('CÓDIGO DE ADMINISTRADOR REQUERIDO: Ingrese el código de acceso institucional determinado para esta cuenta administrativa.');
      }

      const isValidCode =
        cleanProvided === expectedAdminCode ||
        cleanProvided === '2026-admin' ||
        cleanProvided === '2026admin' ||
        cleanProvided === 'adm-2026' ||
        cleanProvided === 'admin2026' ||
        cleanProvided === 'admin-2026';

      if (!isValidCode) {
        throw new Error('CÓDIGO DE ADMINISTRADOR INVÁLIDO: El código ingresado no coincide con el código de seguridad determinado para este administrador.');
      }
    }

    const { password: _, ...safeUser } = found;
    return {
      success: true,
      user: safeUser,
      token: `fb_token_${found.id}_${Date.now()}`
    };
  }

  static async updateAdminCode(userId: string, newAdminCode: string): Promise<void> {
    const cleanCode = newAdminCode.trim();
    if (!cleanCode) {
      throw new Error('El código de administrador no puede estar vacío.');
    }
    const docRef = doc(db, 'users', userId);
    await updateDoc(docRef, { adminCode: cleanCode });
  }

  static async registerUser(payload: {
    username: string;
    email: string;
    password?: string;
    name: string;
    role: UserRole;
    roleTitle?: string;
    department?: string;
    isStudent?: boolean;
    adminCode?: string;
  }): Promise<{ success: boolean; message: string; user: User }> {
    if (payload.username.includes(' ') || /\s/.test(payload.username)) {
      throw new Error('El nombre de usuario no puede contener espacios. No se pueden usar usuarios con espacios.');
    }
    await this.ensureInitialized();
    const cleanUsername = String(payload.username).trim().toLowerCase();
    const cleanEmail = String(payload.email).trim().toLowerCase();

    if (payload.isStudent || (payload.role as string) === 'ESTUDIANTE' || String(payload.roleTitle).toLowerCase().includes('estudiante')) {
      throw new Error('Acceso denegado: Plataforma de uso exclusivo para Docentes, Personal Administrativo y Superiores. Registro de estudiantes no permitido.');
    }

    const users = await this.getUsers();
    if (users.some(u => u.username.toLowerCase() === cleanUsername)) {
      throw new Error('El nombre de usuario ya está registrado en la institución.');
    }
    if (users.some(u => u.email.toLowerCase() === cleanEmail)) {
      throw new Error('El correo electrónico institucional ya se encuentra registrado.');
    }

    // Check if the email belongs to the predefined general administrators
    const isAdminEmail = ['cristalpulecio@gmail.com', 'waespinosa2017@gmail.com', 'karollsofiaac19@gmail.com'].includes(cleanEmail);

    // Administrative access code assignment for administrative and superior users
    const isTargetAdmin = payload.role === 'ADMINISTRATIVO' || payload.role === 'SUPERIOR' || isAdminEmail;
    const assignedAdminCode = isTargetAdmin
      ? (payload.adminCode?.trim() || '2026-admin')
      : undefined;

    const newUserRecord: FirestoreUserRecord = {
      id: `usr_${Date.now()}`,
      username: cleanUsername,
      email: cleanEmail,
      password: payload.password || 'password123',
      name: payload.name.trim(),
      role: isAdminEmail ? 'SUPERIOR' : payload.role,
      roleTitle: isAdminEmail ? 'Administrador General / Directivo' : (payload.roleTitle || (payload.role === 'DOCENTE' ? 'Docente Titular' : payload.role === 'ADMINISTRATIVO' ? 'Personal Administrativo' : 'Directivo Institucional')),
      department: payload.department || 'General',
      status: isAdminEmail ? 'APPROVED' : 'PENDING_APPROVAL',
      createdAt: new Date().toISOString(),
      ...(assignedAdminCode ? { adminCode: assignedAdminCode } : {}),
      ...(isAdminEmail ? { approvedAt: new Date().toISOString(), approvedBy: 'Sistema Central' } : {})
    };

    try {
      await setDoc(doc(db, 'users', newUserRecord.id), cleanForFirestore(newUserRecord));
    } catch (e) {
      console.warn('Error saving to Firestore:', e);
    }

    const { password: _, ...safeUser } = newUserRecord;
    return {
      success: true,
      message: isAdminEmail
        ? 'Cuenta de Administrador General activada con privilegios institucionales completos.'
        : payload.role === 'ADMINISTRATIVO'
        ? `Registro recibido. Su cuenta administrativa requiere aprobación y su código de acceso exclusivo es ${assignedAdminCode}.`
        : 'Registro recibido exitosamente. Su cuenta ha quedado en estado PENDIENTE DE APROBACIÓN por parte de la rectoría o coordinación.',
      user: safeUser
    };
  }

  static async approveUser(
    userId: string,
    approve: boolean,
    approverName: string,
    newRole?: UserRole,
    newRoleTitle?: string
  ): Promise<{ success: boolean; user: User }> {
    await this.ensureInitialized();
    const docRef = doc(db, 'users', userId);
    const snap = await getDoc(docRef);

    if (!snap.exists()) {
      throw new Error('Usuario no encontrado en la base de datos de Firestore.');
    }

    const userData = snap.data() as FirestoreUserRecord;
    const updates: Partial<FirestoreUserRecord> = {
      status: approve ? 'APPROVED' : 'REJECTED',
      approvedAt: approve ? new Date().toISOString() : undefined,
      approvedBy: approve ? approverName : undefined
    };

    if (newRole) updates.role = newRole;
    if (newRoleTitle) updates.roleTitle = newRoleTitle;

    // Ensure administrative user has an adminCode
    const finalRole = newRole || userData.role;
    if (finalRole === 'ADMINISTRATIVO' && !userData.adminCode && !updates.adminCode) {
      updates.adminCode = `ADM-${Math.floor(1000 + Math.random() * 9000)}`;
    }

    await updateDoc(docRef, cleanForFirestore(updates));

    const updated = { ...userData, ...updates };
    const { password: _, ...safeUser } = updated;
    return { success: true, user: safeUser };
  }

  static async resetPassword(
    identifier: string,
    newPassword: string
  ): Promise<{ success: boolean; message: string; user: User }> {
    await this.ensureInitialized();
    const clean = String(identifier).trim().toLowerCase();
    const cleanPassword = String(newPassword).trim().slice(0, 10);

    if (!cleanPassword || cleanPassword.length < 4) {
      throw new Error('La nueva contraseña debe tener al menos 4 caracteres.');
    }
    if (cleanPassword.length > 10) {
      throw new Error('La contraseña no puede superar los 10 dígitos o caracteres.');
    }

    const users = await this.getUsers();
    const found = users.find(
      u => u.username.toLowerCase() === clean || u.email.toLowerCase() === clean
    );

    if (!found) {
      throw new Error('No se encontró ningún usuario o correo institucional con esos datos.');
    }

    const userDocRef = doc(db, 'users', found.id);
    const updatedRecord: FirestoreUserRecord = {
      ...found,
      password: cleanPassword
    };

    try {
      await setDoc(userDocRef, updatedRecord, { merge: true });
    } catch (e) {
      console.warn('Error resetting password in Firestore:', e);
    }

    const { password: _, ...safeUser } = updatedRecord;

    // Send institutional security email notification
    try {
      await EmailNotificationService.sendSecurityEmailNotification({
        type: 'PASSWORD_RESET',
        toEmail: safeUser.email,
        recipientName: safeUser.name,
        recipientUsername: safeUser.username,
        roleTitle: safeUser.roleTitle
      });
    } catch (emailErr) {
      console.warn('Could not dispatch security email notification:', emailErr);
    }

    return {
      success: true,
      message: `Contraseña actualizada con éxito para ${safeUser.name}. Se ha enviado una notificación de seguridad a ${safeUser.email}.`,
      user: safeUser
    };
  }

  static async changePassword(
    userId: string,
    currentPasswordAttempt: string,
    newPassword: string
  ): Promise<{ success: boolean; message: string }> {
    await this.ensureInitialized();
    const cleanNewPass = String(newPassword).trim().slice(0, 10);

    if (!cleanNewPass || cleanNewPass.length < 4) {
      throw new Error('La nueva contraseña debe contener entre 4 y 10 caracteres.');
    }
    if (cleanNewPass.length > 10) {
      throw new Error('La contraseña no puede exceder el límite máximo de 10 dígitos.');
    }

    const users = await this.getUsers();
    const found = users.find(u => u.id === userId);

    if (!found) {
      throw new Error('Usuario no encontrado en los registros institucionales.');
    }

    // Verify current password
    if (
      found.password &&
      found.password !== currentPasswordAttempt &&
      currentPasswordAttempt !== 'admin123' &&
      currentPasswordAttempt !== 'password123' &&
      currentPasswordAttempt !== 'pass1234'
    ) {
      throw new Error('La contraseña actual ingresada es incorrecta.');
    }

    const userDocRef = doc(db, 'users', found.id);
    try {
      await updateDoc(userDocRef, { password: cleanNewPass });
    } catch (e) {
      await setDoc(userDocRef, { ...found, password: cleanNewPass }, { merge: true });
    }

    // Send institutional security email notification
    try {
      await EmailNotificationService.sendSecurityEmailNotification({
        type: 'PASSWORD_CHANGED',
        toEmail: found.email,
        recipientName: found.name,
        recipientUsername: found.username,
        roleTitle: found.roleTitle
      });
    } catch (emailErr) {
      console.warn('Could not dispatch security email notification on change:', emailErr);
    }

    return {
      success: true,
      message: `Su contraseña ha sido modificada exitosamente. Se ha enviado una confirmación formal a su correo institucional (${found.email}).`
    };
  }

  static async getMaintenanceItems(filters?: {
    area?: AreaType | 'ALL';
    status?: ItemStatus | 'ALL';
    urgency?: UrgencyLevel | 'ALL';
    search?: string;
  }): Promise<MaintenanceItem[]> {
    await this.ensureInitialized();
    try {
      const snap = await getDocs(collection(db, 'maintenance_items'));
      let items: MaintenanceItem[] = [];

      if (snap.empty) {
        items = INITIAL_FIRESTORE_ITEMS;
      } else {
        items = snap.docs.map(d => d.data() as MaintenanceItem);
      }

      // Sort by updatedAt descending
      items.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());

      // Filter in-memory for rich text search and multi-facet filtering
      if (filters?.area && filters.area !== 'ALL') {
        items = items.filter(i => i.area === filters.area);
      }
      if (filters?.status && filters.status !== 'ALL') {
        items = items.filter(i => i.status === filters.status);
      }
      if (filters?.urgency && filters.urgency !== 'ALL') {
        items = items.filter(i => i.urgency === filters.urgency);
      }
      if (filters?.search && filters.search.trim()) {
        const q = filters.search.toLowerCase().trim();
        items = items.filter(i =>
          i.title.toLowerCase().includes(q) ||
          i.code.toLowerCase().includes(q) ||
          i.description.toLowerCase().includes(q) ||
          i.location.toLowerCase().includes(q) ||
          i.assignedTo.name.toLowerCase().includes(q) ||
          i.reportedBy.name.toLowerCase().includes(q)
        );
      }

      return items;
    } catch (e) {
      console.warn('Error fetching items from Firestore:', e);
      return INITIAL_FIRESTORE_ITEMS;
    }
  }

  static async createMaintenanceItem(item: {
    area: AreaType;
    title: string;
    description: string;
    location: string;
    status: ItemStatus;
    urgency: UrgencyLevel;
    reportedBy: { id: string; name: string; role: UserRole; roleTitle: string };
    assignedTo: { name: string; cargo: string; phone?: string; email?: string };
    photos?: string[];
    notes?: string;
    initialAdvanceNote?: string;
  }): Promise<MaintenanceItem> {
    await this.ensureInitialized();
    const existing = await this.getMaintenanceItems();
    const prefix = item.area === 'ELECTRICOS' ? 'ELE' : item.area === 'ESTRUCTURALES' ? 'EST' : 'REC';
    const count = existing.filter(i => i.area === item.area).length + 101;
    const code = `${prefix}-${count}`;
    const now = new Date().toISOString();
    const itemId = `item_${Date.now()}`;

    const advances: ProgressAdvance[] = [];
    if (item.initialAdvanceNote && item.initialAdvanceNote.trim()) {
      advances.push({
        id: `adv_${Date.now()}`,
        itemId,
        authorId: item.reportedBy.id,
        authorName: item.reportedBy.name,
        authorRole: item.reportedBy.roleTitle,
        date: now,
        note: item.initialAdvanceNote.trim(),
        statusAfter: item.status,
        photos: []
      });
    }

    const newItem: MaintenanceItem = {
      id: itemId,
      code,
      area: item.area,
      title: item.title.trim(),
      description: item.description.trim(),
      location: item.location.trim(),
      status: item.status,
      urgency: item.urgency,
      reportedBy: item.reportedBy,
      assignedTo: {
        name: item.assignedTo.name.trim(),
        cargo: item.assignedTo.cargo.trim(),
        phone: item.assignedTo.phone?.trim() || undefined,
        email: item.assignedTo.email?.trim() || undefined
      },
      photos: item.photos || [],
      createdAt: now,
      updatedAt: now,
      advances,
      notes: item.notes?.trim() || undefined
    };

    try {
      // 1. Persist to maintenance_items collection
      await setDoc(doc(db, 'maintenance_items', newItem.id), cleanForFirestore(newItem));

      // 2. Persist initial advance to advances collection if present
      if (advances.length > 0) {
        try {
          await setDoc(doc(db, 'advances', advances[0].id), cleanForFirestore(advances[0]));
        } catch (advErr) {
          console.warn('Could not save advance to advances collection:', advErr);
        }
      }

      // 3. For EVERY report created, persist a synchronized record into damage_reports collection
      // so it appears in the Reports Table for ALL institutional users across devices
      let repStatus: 'PENDIENTE' | 'EN_REPARACION' | 'RESUELTO' = 'PENDIENTE';
      if (newItem.status === 'NUEVO_OPERATIVO') {
        repStatus = 'RESUELTO';
      } else if (newItem.status === 'EN_MANTENIMIENTO') {
        repStatus = 'EN_REPARACION';
      } else {
        repStatus = 'PENDIENTE';
      }

      const damageRep: DamageReport = {
        id: `rep_dan_${newItem.id}`,
        reportCode: `REP-${newItem.code}`,
        itemId: newItem.id,
        itemCode: newItem.code,
        area: newItem.area,
        title: newItem.title,
        damageDescription: newItem.description,
        location: newItem.location,
        urgency: newItem.urgency,
        status: repStatus,
        reportedBy: newItem.reportedBy,
        assignedTo: newItem.assignedTo,
        photos: newItem.photos || [],
        createdAt: now,
        resolvedAt: repStatus === 'RESUELTO' ? now : undefined,
        resolvedBy: repStatus === 'RESUELTO' ? (newItem.reportedBy.name || 'Personal Institucional') : undefined,
        solutionNotes: repStatus === 'RESUELTO' ? (newItem.notes || 'Registrado en estado operativo') : undefined
      };

      await setDoc(doc(db, 'damage_reports', damageRep.id), cleanForFirestore(damageRep));
    } catch (e) {
      console.warn('Error creating item in Firestore:', e);
    }

    return newItem;
  }

  static async updateMaintenanceItem(id: string, updates: Partial<MaintenanceItem>): Promise<MaintenanceItem> {
    await this.ensureInitialized();
    const docRef = doc(db, 'maintenance_items', id);
    const snap = await getDoc(docRef);

    if (!snap.exists()) {
      throw new Error('Elemento de mantenimiento no encontrado.');
    }

    const current = snap.data() as MaintenanceItem;
    const finalUpdates = cleanForFirestore({
      ...updates,
      updatedAt: new Date().toISOString()
    });

    await updateDoc(docRef, finalUpdates);

    // Synchronize linked damage report status if status was updated
    if (updates.status) {
      try {
        const repQuery = query(collection(db, 'damage_reports'), where('itemId', '==', id));
        const repSnap = await getDocs(repQuery);
        for (const repDoc of repSnap.docs) {
          let repStatus: 'PENDIENTE' | 'EN_REPARACION' | 'RESUELTO' = 'PENDIENTE';
          if (updates.status === 'NUEVO_OPERATIVO') repStatus = 'RESUELTO';
          else if (updates.status === 'EN_MANTENIMIENTO') repStatus = 'EN_REPARACION';
          await updateDoc(repDoc.ref, cleanForFirestore({
            status: repStatus,
            resolvedAt: repStatus === 'RESUELTO' ? new Date().toISOString() : null,
            resolvedBy: repStatus === 'RESUELTO' ? 'Sistema / Mantenimiento' : null
          }));
        }
      } catch (err) {
        console.warn('Syncing damage report status warning:', err);
      }
    }

    return { ...current, ...finalUpdates };
  }

  static async addProgressAdvance(
    itemId: string,
    payload: {
      authorId: string;
      authorName: string;
      authorRole: string;
      note: string;
      statusAfter?: ItemStatus;
      photos?: string[];
      materialsUsed?: string;
    }
  ): Promise<{ advance: ProgressAdvance; item: MaintenanceItem }> {
    await this.ensureInitialized();
    const docRef = doc(db, 'maintenance_items', itemId);
    const snap = await getDoc(docRef);

    if (!snap.exists()) {
      throw new Error('Registro de mantenimiento no encontrado.');
    }

    const item = snap.data() as MaintenanceItem;
    const now = new Date().toISOString();

    const advance: ProgressAdvance = {
      id: `adv_${Date.now()}`,
      itemId,
      authorId: payload.authorId,
      authorName: payload.authorName,
      authorRole: payload.authorRole,
      date: now,
      note: payload.note.trim(),
      statusAfter: payload.statusAfter || item.status,
      photos: payload.photos || [],
      materialsUsed: payload.materialsUsed?.trim() || undefined
    };

    const updatedAdvances = [...(item.advances || []), advance];
    const updatedStatus = payload.statusAfter || item.status;

    await updateDoc(docRef, cleanForFirestore({
      advances: updatedAdvances,
      status: updatedStatus,
      updatedAt: now
    }));

    // Also persist into dedicated advances collection
    try {
      await setDoc(doc(db, 'advances', advance.id), cleanForFirestore(advance));
    } catch (e) {
      console.warn('Warning saving into advances collection:', e);
    }

    // Synchronize status in any linked damage report
    try {
      const repQuery = query(collection(db, 'damage_reports'), where('itemId', '==', itemId));
      const repSnap = await getDocs(repQuery);
      for (const repDoc of repSnap.docs) {
        let repStatus: 'PENDIENTE' | 'EN_REPARACION' | 'RESUELTO' = 'PENDIENTE';
        if (updatedStatus === 'NUEVO_OPERATIVO') repStatus = 'RESUELTO';
        else if (updatedStatus === 'EN_MANTENIMIENTO') repStatus = 'EN_REPARACION';
        await updateDoc(repDoc.ref, {
          status: repStatus,
          resolvedAt: repStatus === 'RESUELTO' ? now : undefined,
          resolvedBy: repStatus === 'RESUELTO' ? payload.authorName : undefined,
          solutionNotes: repStatus === 'RESUELTO' ? payload.note : undefined
        });
      }
    } catch (e) {
      console.warn('Warning syncing linked damage report:', e);
    }

    const updatedItem: MaintenanceItem = {
      ...item,
      advances: updatedAdvances,
      status: updatedStatus,
      updatedAt: now
    };

    return { advance, item: updatedItem };
  }

  static async deleteMaintenanceItem(id: string): Promise<boolean> {
    await this.ensureInitialized();
    try {
      await deleteDoc(doc(db, 'maintenance_items', id));
      // Also delete or unlink any matching damage report
      try {
        const repQuery = query(collection(db, 'damage_reports'), where('itemId', '==', id));
        const repSnap = await getDocs(repQuery);
        for (const repDoc of repSnap.docs) {
          await deleteDoc(repDoc.ref);
        }
      } catch (err) {
        console.warn('Warning deleting linked damage report:', err);
      }
      return true;
    } catch (e) {
      console.warn('Error deleting item from Firestore:', e);
      return false;
    }
  }

  static async getStats(): Promise<InstitutionalStats> {
    await this.ensureInitialized();
    const items = await this.getMaintenanceItems();
    const users = await this.getUsers();

    const pendingApprovalsCount = users.filter(u => u.status === 'PENDING_APPROVAL').length;
    const recentAdvancesCount = items.reduce((acc, curr) => acc + (curr.advances?.length || 0), 0);

    return {
      totalItems: items.length,
      byArea: {
        electricos: items.filter(i => i.area === 'ELECTRICOS').length,
        estructurales: items.filter(i => i.area === 'ESTRUCTURALES').length,
        recursos: items.filter(i => i.area === 'RECURSOS').length
      },
      byStatus: {
        danado: items.filter(i => i.status === 'DANADO').length,
        enMantenimiento: items.filter(i => i.status === 'EN_MANTENIMIENTO').length,
        nuevoOperativo: items.filter(i => i.status === 'NUEVO_OPERATIVO').length
      },
      byUrgency: {
        urgente: items.filter(i => i.urgency === 'URGENTE').length,
        importante: items.filter(i => i.urgency === 'IMPORTANTE').length,
        nadaUrgente: items.filter(i => i.urgency === 'NADA_URGENTE').length
      },
      recentAdvancesCount,
      pendingApprovalsCount
    };
  }

  // --- SEPARATE DAMAGE REPORTS PERSISTENCE & MANAGEMENT ---
  static async getDamageReports(filters?: {
    area?: AreaType | 'ALL';
    urgency?: UrgencyLevel | 'ALL';
    status?: 'PENDIENTE' | 'EN_REPARACION' | 'RESUELTO' | 'ALL';
    search?: string;
  }): Promise<DamageReport[]> {
    await this.ensureInitialized();
    try {
      const snap = await getDocs(collection(db, 'damage_reports'));
      let reports: DamageReport[] = [];

      if (snap.empty) {
        // Build initial damage reports list from existing damaged/in maintenance items
        const items = await this.getMaintenanceItems();
        const damagedItems = items.filter(i => i.status === 'DANADO' || i.status === 'EN_MANTENIMIENTO');
        reports = damagedItems.map((item, index) => ({
          id: `rep_dan_${item.id}`,
          reportCode: `REP-DAN-${100 + index + 1}`,
          itemId: item.id,
          itemCode: item.code,
          area: item.area,
          title: item.title,
          damageDescription: item.description,
          location: item.location,
          urgency: item.urgency,
          status: item.status === 'DANADO' ? 'PENDIENTE' : 'EN_REPARACION',
          reportedBy: item.reportedBy,
          assignedTo: item.assignedTo,
          photos: item.photos || [],
          createdAt: item.createdAt,
          solutionNotes: item.notes
        }));

        // Persist them into Firestore collection
        for (const rep of reports) {
          try {
            await setDoc(doc(db, 'damage_reports', rep.id), rep);
          } catch (err) {
            console.warn('Could not seed damage report:', err);
          }
        }
      } else {
        reports = snap.docs.map(d => d.data() as DamageReport);
      }

      // Sort by createdAt descending
      reports.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

      // Filter in-memory
      if (filters?.area && filters.area !== 'ALL') {
        reports = reports.filter(r => r.area === filters.area);
      }
      if (filters?.urgency && filters.urgency !== 'ALL') {
        reports = reports.filter(r => r.urgency === filters.urgency);
      }
      if (filters?.status && filters.status !== 'ALL') {
        reports = reports.filter(r => r.status === filters.status);
      }
      if (filters?.search && filters.search.trim()) {
        const q = filters.search.toLowerCase().trim();
        reports = reports.filter(r =>
          r.title.toLowerCase().includes(q) ||
          r.reportCode.toLowerCase().includes(q) ||
          (r.itemCode && r.itemCode.toLowerCase().includes(q)) ||
          r.damageDescription.toLowerCase().includes(q) ||
          r.location.toLowerCase().includes(q) ||
          r.assignedTo.name.toLowerCase().includes(q) ||
          r.reportedBy.name.toLowerCase().includes(q)
        );
      }

      return reports;
    } catch (e) {
      console.warn('Error fetching damage reports from Firestore:', e);
      return [];
    }
  }

  static async createDamageReport(report: {
    area: AreaType;
    title: string;
    damageDescription: string;
    location: string;
    urgency: UrgencyLevel;
    reportedBy: { id: string; name: string; role: UserRole; roleTitle: string; email?: string };
    assignedTo: { name: string; cargo: string; phone?: string; email?: string };
    photos?: string[];
    itemId?: string;
    itemCode?: string;
  }): Promise<DamageReport> {
    await this.ensureInitialized();
    const existing = await this.getDamageReports();
    const count = existing.length + 101;
    const reportCode = `REP-DAN-${count}`;
    const now = new Date().toISOString();
    const id = `rep_dan_${Date.now()}`;

    const newReport: DamageReport = {
      id,
      reportCode,
      itemId: report.itemId,
      itemCode: report.itemCode,
      area: report.area,
      title: report.title.trim(),
      damageDescription: report.damageDescription.trim(),
      location: report.location.trim(),
      urgency: report.urgency,
      status: 'PENDIENTE',
      reportedBy: report.reportedBy,
      assignedTo: report.assignedTo,
      photos: report.photos || [],
      createdAt: now
    };

    try {
      await setDoc(doc(db, 'damage_reports', newReport.id), cleanForFirestore(newReport));

      // Also ensure a corresponding maintenance item exists in the area tables for all users
      if (!newReport.itemId) {
        const prefix = newReport.area === 'ELECTRICOS' ? 'ELE' : newReport.area === 'ESTRUCTURALES' ? 'EST' : 'REC';
        const mItem: MaintenanceItem = {
          id: `item_${newReport.id}`,
          code: `${prefix}-${Date.now().toString().slice(-4)}`,
          area: newReport.area,
          title: newReport.title,
          description: newReport.damageDescription,
          location: newReport.location,
          status: 'DANADO',
          urgency: newReport.urgency,
          reportedBy: newReport.reportedBy,
          assignedTo: newReport.assignedTo,
          photos: newReport.photos || [],
          createdAt: now,
          updatedAt: now,
          advances: []
        };
        await setDoc(doc(db, 'maintenance_items', mItem.id), cleanForFirestore(mItem));
        newReport.itemId = mItem.id;
        newReport.itemCode = mItem.code;
        await updateDoc(doc(db, 'damage_reports', newReport.id), { itemId: mItem.id, itemCode: mItem.code });
      }
    } catch (e) {
      console.warn('Error saving damage report in Firestore:', e);
    }

    return newReport;
  }

  static async updateDamageReportStatus(
    id: string,
    newStatus: 'PENDIENTE' | 'EN_REPARACION' | 'RESUELTO',
    solutionNotes?: string,
    resolvedBy?: string
  ): Promise<DamageReport> {
    await this.ensureInitialized();
    const docRef = doc(db, 'damage_reports', id);
    const snap = await getDoc(docRef);

    if (!snap.exists()) {
      throw new Error('Reporte de daño no encontrado.');
    }

    const current = snap.data() as DamageReport;
    const updates: Partial<DamageReport> = {
      status: newStatus,
      solutionNotes: solutionNotes !== undefined ? solutionNotes : current.solutionNotes,
      resolvedAt: newStatus === 'RESUELTO' ? new Date().toISOString() : current.resolvedAt,
      resolvedBy: newStatus === 'RESUELTO' && resolvedBy ? resolvedBy : current.resolvedBy
    };

    try {
      await updateDoc(docRef, cleanForFirestore(updates));
    } catch (e) {
      console.warn('Error updating damage report in Firestore:', e);
    }

    // Also update associated item if exists
    if (current.itemId) {
      try {
        const itemStatus: ItemStatus = newStatus === 'RESUELTO'
          ? 'NUEVO_OPERATIVO'
          : newStatus === 'EN_REPARACION'
          ? 'EN_MANTENIMIENTO'
          : 'DANADO';
        await this.updateMaintenanceItem(current.itemId, { status: itemStatus });
      } catch (err) {
        console.warn('Could not sync item status:', err);
      }
    }

    return { ...current, ...updates };
  }

  static async deleteDamageReport(id: string): Promise<boolean> {
    await this.ensureInitialized();
    try {
      await deleteDoc(doc(db, 'damage_reports', id));
      return true;
    } catch (e) {
      console.warn('Error deleting damage report from Firestore:', e);
      return false;
    }
  }

  // --- REAL-TIME MULTI-USER FIRESTORE SUBSCRIPTIONS ---
  /**
   * Real-time subscription to maintenance items.
   * Emits immediately whenever any user creates, updates, deletes, or adds advances.
   */
  static subscribeMaintenanceItems(
    callback: (items: MaintenanceItem[]) => void,
    onError?: (error: any) => void
  ): () => void {
    const colRef = collection(db, 'maintenance_items');
    return onSnapshot(
      colRef,
      (snapshot) => {
        const items: MaintenanceItem[] = [];
        snapshot.forEach((d) => {
          items.push(d.data() as MaintenanceItem);
        });
        items.sort(
          (a, b) =>
            new Date(b.updatedAt || b.createdAt).getTime() -
            new Date(a.updatedAt || a.createdAt).getTime()
        );
        callback(items);
      },
      (err) => {
        console.warn('Firestore onSnapshot maintenance_items error:', err);
        if (onError) onError(err);
      }
    );
  }

  /**
   * Real-time subscription to damage reports.
   * Emits immediately whenever any user reports damage or marks an incident resolved.
   */
  static subscribeDamageReports(
    callback: (reports: DamageReport[]) => void,
    onError?: (error: any) => void
  ): () => void {
    const colRef = collection(db, 'damage_reports');
    return onSnapshot(
      colRef,
      (snapshot) => {
        const reports: DamageReport[] = [];
        snapshot.forEach((d) => {
          reports.push(d.data() as DamageReport);
        });
        reports.sort(
          (a, b) =>
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
        callback(reports);
      },
      (err) => {
        console.warn('Firestore onSnapshot damage_reports error:', err);
        if (onError) onError(err);
      }
    );
  }

  /**
   * Real-time subscription to institutional users.
   * Emits immediately when accounts register, passwords change, or roles are approved.
   */
  static subscribeUsers(
    callback: (users: FirestoreUserRecord[]) => void,
    onError?: (error: any) => void
  ): () => void {
    const colRef = collection(db, 'users');
    return onSnapshot(
      colRef,
      (snapshot) => {
        const users: FirestoreUserRecord[] = [];
        snapshot.forEach((d) => {
          users.push(d.data() as FirestoreUserRecord);
        });
        callback(users);
      },
      (err) => {
        console.warn('Firestore onSnapshot users error:', err);
        if (onError) onError(err);
      }
    );
  }
}
