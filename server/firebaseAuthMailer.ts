import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth, sendPasswordResetEmail, createUserWithEmailAndPassword } from 'firebase/auth';
import fs from 'fs';
import path from 'path';

let firebaseAuthInstance: any = null;

export function getBackendFirebaseAuth() {
  if (firebaseAuthInstance) return firebaseAuthInstance;
  try {
    const configPath = path.join(process.cwd(), 'firebase-applet-config.json');
    if (!fs.existsSync(configPath)) return null;
    const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
    const app = getApps().length === 0 ? initializeApp(config) : getApp();
    firebaseAuthInstance = getAuth(app);
    return firebaseAuthInstance;
  } catch (e) {
    console.warn('⚠️ Error inicializando Firebase Auth en backend:', e);
    return null;
  }
}

/**
 * Envía el correo oficial de restablecimiento a través de la infraestructura en la nube de Google Firebase.
 * No requiere contraseñas de aplicación ni configuración SMTP en .env.
 */
export async function sendFirebaseAuthResetEmail(email: string): Promise<{ success: boolean; message: string }> {
  const auth = getBackendFirebaseAuth();
  if (!auth) {
    return { success: false, message: 'Firebase Auth no está inicializado en el backend.' };
  }

  const cleanEmail = String(email || '').trim().toLowerCase();
  try {
    await sendPasswordResetEmail(auth, cleanEmail);
    return {
      success: true,
      message: `Correo oficial de restablecimiento enviado exitosamente por Google Firebase a ${cleanEmail}.`
    };
  } catch (err: any) {
    if (err.code === 'auth/user-not-found') {
      try {
        await createUserWithEmailAndPassword(auth, cleanEmail, 'TempPass123!_' + Math.random().toString(36).substring(2, 6));
        await sendPasswordResetEmail(auth, cleanEmail);
        return {
          success: true,
          message: `Correo oficial de restablecimiento enviado exitosamente por Google Firebase a ${cleanEmail}.`
        };
      } catch (innerErr: any) {
        return { success: false, message: innerErr?.message || 'Error al procesar usuario en Firebase Auth' };
      }
    }
    return { success: false, message: err?.message || 'Error en Firebase Auth' };
  }
}
