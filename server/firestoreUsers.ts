import fs from 'fs';
import path from 'path';
import { initializeApp, getApps, getApp } from 'firebase/app';
import {
  initializeFirestore,
  getFirestore,
  collection,
  getDocs,
  doc,
  getDoc,
  updateDoc
} from 'firebase/firestore';

export interface RegisteredUserSummary {
  id: string;
  email: string;
  name: string;
  username: string;
  role: string;
  roleTitle?: string;
  department?: string;
  status: string;
  createdAt?: string;
  resetPasswordOtp?: string;
  resetPasswordExpires?: number;
  password?: string;
}

// Cargar configuración de Firebase Applet
let firebaseConfig: any = null;
try {
  const configPath = path.join(process.cwd(), 'firebase-applet-config.json');
  if (fs.existsSync(configPath)) {
    firebaseConfig = JSON.parse(fs.readFileSync(configPath, 'utf8'));
  }
} catch (e) {
  console.warn('⚠️ No se pudo leer firebase-applet-config.json:', e);
}

// Inicializar instancia de Firestore para Node.js
let dbInstance: any = null;

export function getBackendFirestore() {
  if (dbInstance) return dbInstance;
  if (!firebaseConfig) return null;

  try {
    const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
    const dbId = firebaseConfig.firestoreDatabaseId && firebaseConfig.firestoreDatabaseId !== '(default)'
      ? firebaseConfig.firestoreDatabaseId
      : undefined;

    try {
      dbInstance = initializeFirestore(app, { ignoreUndefinedProperties: true }, dbId);
    } catch {
      dbInstance = dbId ? getFirestore(app, dbId) : getFirestore(app);
    }
    return dbInstance;
  } catch (err) {
    console.error('❌ Error inicializando Firestore en backend:', err);
    return null;
  }
}

/**
 * 1. BÚSQUEDA FLEXIBLE (CASE INSENSITIVE):
 * Busca en la colección 'users' de Firestore aplicando .toLowerCase() y .trim()
 * tanto al correo buscado como al campo del documento.
 *
 * 2. VERIFICACIÓN DE TABLA Y CAMPOS:
 * - Colección consultada: 'users'
 * - Campos verificados: 'email', 'correo_electronico', 'correo'
 */
export async function findUserByEmailInFirestore(
  targetEmail: string,
  memoryUsersFallback: any[] = []
): Promise<RegisteredUserSummary | null> {
  const cleanTarget = String(targetEmail || '').trim().toLowerCase();
  if (!cleanTarget) return null;

  const db = getBackendFirestore();
  if (db) {
    try {
      const usersCol = collection(db, 'users');
      const snap = await getDocs(usersCol);

      for (const docSnap of snap.docs) {
        const data = docSnap.data();
        // Verificar campos de correo posibles con comparación flexible insensible a mayúsculas/minúsculas
        const candidateEmail = String(
          data.email || data.correo_electronico || data.correo || ''
        ).trim().toLowerCase();

        if (candidateEmail === cleanTarget) {
          return {
            id: docSnap.id,
            email: candidateEmail,
            name: data.name || data.nombre || 'Usuario Institucional',
            username: data.username || data.usuario || '',
            role: data.role || data.rol || 'DOCENTE',
            roleTitle: data.roleTitle || data.cargo || '',
            department: data.department || data.departamento || '',
            status: data.status || data.estado || 'APPROVED',
            createdAt: data.createdAt,
            resetPasswordOtp: data.resetPasswordOtp,
            resetPasswordExpires: data.resetPasswordExpires,
            password: data.password
          };
        }
      }
    } catch (err) {
      console.warn('⚠️ Error consultando Firestore users collection:', err);
    }
  }

  // Fallback en memoria si la base de datos externa no responde o el usuario es una semilla local
  const foundMem = memoryUsersFallback.find(u => {
    const memEmail = String(u.email || u.correo_electronico || u.correo || '').trim().toLowerCase();
    return memEmail === cleanTarget;
  });

  if (foundMem) {
    return {
      id: foundMem.id,
      email: String(foundMem.email).trim().toLowerCase(),
      name: foundMem.name,
      username: foundMem.username,
      role: foundMem.role,
      roleTitle: foundMem.roleTitle,
      department: foundMem.department,
      status: foundMem.status,
      createdAt: foundMem.createdAt,
      resetPasswordOtp: foundMem.resetPasswordOtp,
      resetPasswordExpires: foundMem.resetPasswordExpires,
      password: foundMem.password
    };
  }

  return null;
}

/**
 * Guarda el código OTP y su fecha de expiración en Firestore para el usuario.
 */
export async function saveUserOtpInFirestore(
  userId: string,
  otpCode: string,
  expiresAt: number,
  memoryUsers: any[] = []
): Promise<boolean> {
  let updatedInFirestore = false;
  const db = getBackendFirestore();
  if (db && userId) {
    try {
      const userDocRef = doc(db, 'users', userId);
      await updateDoc(userDocRef, {
        resetPasswordOtp: otpCode,
        resetPasswordExpires: expiresAt
      });
      updatedInFirestore = true;
    } catch (err) {
      console.warn(`⚠️ No se pudo guardar OTP en Firestore doc users/${userId}:`, err);
    }
  }

  // Sincronizar también en la lista de memoria
  const mem = memoryUsers.find(u => u.id === userId);
  if (mem) {
    mem.resetPasswordOtp = otpCode;
    mem.resetPasswordExpires = expiresAt;
  }

  return updatedInFirestore;
}

/**
 * Guarda el token único de recuperación y código OTP en Firestore para el usuario.
 */
export async function saveUserResetTokenInFirestore(
  userId: string,
  token: string,
  otpCode: string,
  expiresAt: number,
  memoryUsers: any[] = []
): Promise<boolean> {
  let updatedInFirestore = false;
  const db = getBackendFirestore();
  if (db && userId) {
    try {
      const userDocRef = doc(db, 'users', userId);
      await updateDoc(userDocRef, {
        resetPasswordToken: token,
        resetPasswordOtp: otpCode,
        resetPasswordExpires: expiresAt,
        updatedAt: new Date().toISOString()
      });
      updatedInFirestore = true;
    } catch (err) {
      console.warn(`⚠️ No se pudo guardar reset token en Firestore doc users/${userId}:`, err);
    }
  }

  // Sincronizar en memoria
  const mem = memoryUsers.find(u => u.id === userId);
  if (mem) {
    mem.resetPasswordToken = token;
    mem.resetPasswordOtp = otpCode;
    mem.resetPasswordExpires = expiresAt;
  }

  return updatedInFirestore;
}

/**
 * Busca un usuario por ID en Firestore con fallback en memoria.
 */
export async function findUserByIdInFirestore(
  userId: string,
  memoryUsersFallback: any[] = []
): Promise<RegisteredUserSummary | null> {
  if (!userId) return null;
  const db = getBackendFirestore();
  if (db) {
    try {
      const userDocRef = doc(db, 'users', userId);
      const snap = await getDoc(userDocRef);
      if (snap.exists()) {
        const d = snap.data();
        return {
          id: snap.id,
          email: String(d.email || d.correo_electronico || d.correo || '').trim().toLowerCase(),
          name: d.name || d.nombre || 'Usuario Institucional',
          username: d.username || d.usuario || '',
          role: d.role || d.rol || 'DOCENTE',
          roleTitle: d.roleTitle || d.cargo || '',
          department: d.department || d.departamento || '',
          status: d.status || d.estado || 'APPROVED',
          createdAt: d.createdAt,
          resetPasswordOtp: d.resetPasswordOtp,
          resetPasswordExpires: d.resetPasswordExpires,
          password: d.password
        };
      }
    } catch (e) {
      console.warn(`⚠️ Error al buscar usuario por ID en Firestore users/${userId}:`, e);
    }
  }

  const foundMem = memoryUsersFallback.find(u => u.id === userId);
  return foundMem || null;
}

/**
 * Busca un usuario por su token o código temporal de recuperación en Firestore.
 */
export async function findUserByTokenInFirestore(
  tokenOrOtp: string,
  memoryUsersFallback: any[] = []
): Promise<RegisteredUserSummary | null> {
  const clean = String(tokenOrOtp || '').trim();
  if (!clean) return null;

  const db = getBackendFirestore();
  if (db) {
    try {
      const usersCol = collection(db, 'users');
      const snap = await getDocs(usersCol);
      for (const docSnap of snap.docs) {
        const d = docSnap.data();
        if (d.resetPasswordToken === clean || d.resetPasswordOtp === clean) {
          return {
            id: docSnap.id,
            email: String(d.email || d.correo_electronico || d.correo || '').trim().toLowerCase(),
            name: d.name || d.nombre || 'Usuario Institucional',
            username: d.username || d.usuario || '',
            role: d.role || d.rol || 'DOCENTE',
            roleTitle: d.roleTitle || d.cargo || '',
            department: d.department || d.departamento || '',
            status: d.status || d.estado || 'APPROVED',
            createdAt: d.createdAt,
            resetPasswordOtp: d.resetPasswordOtp,
            resetPasswordExpires: d.resetPasswordExpires,
            password: d.password
          };
        }
      }
    } catch (e) {
      console.warn('⚠️ Error al buscar usuario por token en Firestore:', e);
    }
  }

  const foundMem = memoryUsersFallback.find(
    (u: any) => u.resetPasswordToken === clean || u.resetPasswordOtp === clean
  );
  return foundMem || null;
}

/**
 * Actualiza la contraseña en Firestore y anula el código OTP, token y su expiración.
 * Guarda tanto la contraseña directa (compatible con cliente Firebase) como el hash opcional.
 */
export async function updateUserPasswordInFirestore(
  userId: string,
  plainPassword: string,
  hashedPassword?: string,
  memoryUsers: any[] = []
): Promise<boolean> {
  let updatedInFirestore = false;
  const db = getBackendFirestore();
  if (db && userId) {
    try {
      const userDocRef = doc(db, 'users', userId);
      await updateDoc(userDocRef, {
        password: plainPassword,
        passwordHash: hashedPassword || plainPassword,
        resetPasswordOtp: null,
        resetPasswordExpires: null,
        resetPasswordToken: null,
        updatedAt: new Date().toISOString()
      });
      updatedInFirestore = true;
    } catch (err) {
      console.warn(`⚠️ No se pudo actualizar contraseña en Firestore doc users/${userId}:`, err);
    }
  }

  const mem = memoryUsers.find(u => u.id === userId);
  if (mem) {
    mem.password = plainPassword;
    mem.resetPasswordOtp = undefined;
    mem.resetPasswordExpires = undefined;
    mem.resetPasswordToken = undefined;
  }

  return updatedInFirestore;
}

/**
 * Obtiene todos los usuarios y correos registrados en la base de datos (para diagnóstico y pruebas).
 */
export async function getRegisteredUsersDiagnostic(memoryUsers: any[] = []) {
  const list: Array<{
    id: string;
    email: string;
    name: string;
    username: string;
    role: string;
    status: string;
    source: 'FIRESTORE' | 'MEMORY';
  }> = [];

  const seenEmails = new Set<string>();

  const db = getBackendFirestore();
  if (db) {
    try {
      const usersCol = collection(db, 'users');
      const snap = await getDocs(usersCol);
      snap.forEach(docSnap => {
        const d = docSnap.data();
        const em = String(d.email || d.correo_electronico || d.correo || '').trim().toLowerCase();
        if (em) {
          seenEmails.add(em);
          list.push({
            id: docSnap.id,
            email: em,
            name: d.name || 'Sin nombre',
            username: d.username || 'Sin usuario',
            role: d.role || 'DOCENTE',
            status: d.status || 'APPROVED',
            source: 'FIRESTORE'
          });
        }
      });
    } catch (e) {
      console.warn('⚠️ Error al listar usuarios de Firestore:', e);
    }
  }

  // Agregar los de memoria que no estén en Firestore
  for (const mu of memoryUsers) {
    const em = String(mu.email || '').trim().toLowerCase();
    if (em && !seenEmails.has(em)) {
      seenEmails.add(em);
      list.push({
        id: mu.id,
        email: em,
        name: mu.name,
        username: mu.username,
        role: mu.role,
        status: mu.status,
        source: 'MEMORY'
      });
    }
  }

  return {
    total: list.length,
    collection: 'users',
    databaseId: firebaseConfig?.firestoreDatabaseId || 'default',
    users: list
  };
}
