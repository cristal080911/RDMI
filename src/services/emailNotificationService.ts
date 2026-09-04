import { SecurityEmailNotification, EmailNotificationType, User } from '../core/domain/entities';
import { db } from '../lib/firebase';
import { collection, doc, setDoc, getDocs, query, orderBy, limit } from 'firebase/firestore';

const LOCAL_EMAIL_STORAGE_KEY = 'institutional_email_notifications_v1';

export function getLocalStoredEmailNotifications(): SecurityEmailNotification[] {
  try {
    const raw = localStorage.getItem(LOCAL_EMAIL_STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch (e) {
    return [];
  }
}

export function setLocalStoredEmailNotifications(notifications: SecurityEmailNotification[]): void {
  try {
    localStorage.setItem(LOCAL_EMAIL_STORAGE_KEY, JSON.stringify(notifications.slice(0, 50)));
  } catch (e) {
    console.warn('Error storing email notifications locally:', e);
  }
}

export class EmailNotificationService {
  /**
   * Generates a rich, responsive and formal institutional HTML email template
   */
  static generateEmailHtml(payload: {
    type: EmailNotificationType;
    toEmail: string;
    recipientName: string;
    recipientUsername: string;
    roleTitle?: string;
    sentAt: string;
    securityCode?: string;
    deviceInfo?: string;
  }): { subject: string; previewSnippet: string; html: string } {
    const { type, toEmail, recipientName, recipientUsername, roleTitle, sentAt, securityCode, deviceInfo } = payload;
    
    let subject = '';
    let headline = '';
    let alertBannerText = '';
    let mainDescription = '';
    let previewSnippet = '';

    const formattedDate = new Date(sentAt).toLocaleString('es-CO', {
      dateStyle: 'full',
      timeStyle: 'medium',
      timeZone: 'America/Bogota'
    }) || sentAt;

    switch (type) {
      case 'PASSWORD_RESET':
        subject = `[Seguridad Institucional] Contraseña restablecida exitosamente - ${recipientUsername}`;
        headline = 'Restablecimiento de Contraseña Exitoso';
        previewSnippet = `Se ha completado el restablecimiento de su clave institucional para ${recipientUsername}.`;
        alertBannerText = 'Notificación Oficial de Restablecimiento de Credenciales';
        mainDescription = `Le confirmamos que su contraseña de acceso al Sistema de Gestión de Mantenimiento e Infraestructura Institucional ha sido restablecida exitosamente. A partir de este momento puede iniciar sesión con su nueva clave configurada (máximo 10 caracteres).`;
        break;

      case 'PASSWORD_CHANGED':
        subject = `[Seguridad Institucional] Notificación de Cambio de Contraseña - ${recipientUsername}`;
        headline = 'Cambio de Contraseña Confirmado';
        previewSnippet = `Su contraseña de acceso institucional ha sido modificada desde su perfil activo.`;
        alertBannerText = 'Alerta de Seguridad: Modificación de Clave de Acceso';
        mainDescription = `Le informamos que se ha procesado un cambio voluntario de su contraseña desde una sesión institucional autenticada. Su nueva clave se encuentra activa y resguardada con cifrado de seguridad.`;
        break;

      case 'RECOVERY_CODE':
        subject = `[Código de Seguridad] Verificación para recuperación de cuenta - ${securityCode || '000000'}`;
        headline = 'Código de Verificación de Seguridad';
        previewSnippet = `Su código de verificación institucional es ${securityCode}. Válido por 15 minutos.`;
        alertBannerText = 'Código Temporal de Validación Institucional';
        mainDescription = `Ha solicitado un código de validación para proceder con el restablecimiento de su contraseña. Ingrese el siguiente código en la plataforma para confirmar su identidad:`;
        break;
    }

    const html = `
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${subject}</title>
  <style>
    body { margin: 0; padding: 0; background-color: #F4EFEB; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #1E293B; }
    .container { max-width: 600px; margin: 24px auto; background-color: #FFFFFF; border-radius: 16px; border: 1px solid #DCD3BE; overflow: hidden; box-shadow: 0 10px 25px rgba(0,0,0,0.08); }
    .header { background: linear-gradient(135deg, #2E0854 0%, #1E1B4B 100%); padding: 28px 24px; text-align: center; color: #FFFFFF; }
    .header h1 { margin: 0; font-size: 20px; font-weight: 900; letter-spacing: -0.5px; color: #FFFFFF; }
    .header p { margin: 6px 0 0 0; font-size: 12px; color: #DDD6FE; text-transform: uppercase; letter-spacing: 1px; }
    .badge { display: inline-block; background-color: #FEF3C7; color: #92400E; font-size: 11px; font-weight: 800; padding: 4px 12px; border-radius: 999px; margin-bottom: 12px; border: 1px solid #FCD34D; }
    .content { padding: 28px 24px; }
    .headline { font-size: 18px; font-weight: 800; color: #2E0854; margin: 0 0 12px 0; }
    .text { font-size: 14px; line-height: 1.6; color: #334155; margin: 0 0 16px 0; }
    .code-box { background-color: #F8FAFC; border: 2px dashed #6366F1; border-radius: 12px; padding: 18px; text-align: center; margin: 20px 0; }
    .code-value { font-family: monospace; font-size: 28px; font-weight: 900; letter-spacing: 6px; color: #4338CA; }
    .details-table { width: 100%; border-collapse: collapse; margin: 20px 0; background-color: #FAF8F5; border-radius: 12px; border: 1px solid #EAE2D2; overflow: hidden; font-size: 13px; }
    .details-table td { padding: 10px 14px; border-bottom: 1px solid #EAE2D2; }
    .details-table td.label { font-weight: 700; color: #475569; width: 38%; }
    .details-table td.val { font-weight: 600; color: #0F172A; }
    .warning-box { background-color: #FEF2F2; border-left: 4px solid #DC2626; padding: 14px; border-radius: 0 10px 10px 0; margin: 22px 0; }
    .warning-box h4 { margin: 0 0 4px 0; font-size: 13px; font-weight: 800; color: #991B1B; }
    .warning-box p { margin: 0; font-size: 12px; color: #7F1D1D; line-height: 1.5; }
    .footer { background-color: #F8F5EE; padding: 20px 24px; border-top: 1px solid #E5DEC9; text-align: center; font-size: 11px; color: #64748B; }
    .footer p { margin: 4px 0; }
    .footer a { color: #581C87; text-decoration: none; font-weight: 700; }
  </style>
</head>
<body>
  <div class="container">
    <!-- Header -->
    <div class="header">
      <div class="badge">${alertBannerText}</div>
      <h1>SISTEMA DE MANTENIMIENTO INSTITUCIONAL</h1>
      <p>Gestión de Infraestructura & Seguridad Escolar</p>
    </div>

    <!-- Content -->
    <div class="content">
      <h2 class="headline">${headline}</h2>
      <p class="text">Estimado(a) <strong>${recipientName}</strong>,</p>
      <p class="text">${mainDescription}</p>

      ${type === 'RECOVERY_CODE' && securityCode ? `
      <div class="code-box">
        <div style="font-size: 11px; font-weight: 700; color: #64748B; text-transform: uppercase; margin-bottom: 6px;">Código de Confirmación:</div>
        <div class="code-value">${securityCode}</div>
      </div>
      ` : ''}

      <!-- Detailed Info Card -->
      <table class="details-table">
        <tr>
          <td class="label">👤 Usuario Institucional:</td>
          <td class="val">${recipientUsername}</td>
        </tr>
        <tr>
          <td class="label">📧 Correo Registrado:</td>
          <td class="val">${toEmail}</td>
        </tr>
        ${roleTitle ? `
        <tr>
          <td class="label">🏛️ Cargo / Perfil:</td>
          <td class="val">${roleTitle}</td>
        </tr>
        ` : ''}
        <tr>
          <td class="label">🕒 Fecha y Hora:</td>
          <td class="val">${formattedDate}</td>
        </tr>
        <tr>
          <td class="label">🔒 Estado de la Clave:</td>
          <td class="val" style="color: #15803D; font-weight: 800;">✓ Actualizada (Cifrado Institucional Activo)</td>
        </tr>
        <tr>
          <td class="label">💻 Dispositivo / Navegador:</td>
          <td class="val">${deviceInfo || 'Navegador Web Seguro'}</td>
        </tr>
      </table>

      <!-- Security Warning -->
      <div class="warning-box">
        <h4>⚠️ ¿Usted no realizó esta solicitud?</h4>
        <p>
          Si usted <strong>no reconoció</strong> este cambio de contraseña o no solicitó el restablecimiento, póngase en contacto inmediato con el equipo directivo de la institución (<strong>cristalpulecio@gmail.com</strong>, <strong>waespinosa2017@gmail.com</strong> o <strong>karollsofiaac19@gmail.com</strong>) para bloquear y proteger su cuenta.
        </p>
      </div>

      <p class="text" style="font-size: 12px; color: #64748B; margin-top: 20px;">
        <em>Recomendación de seguridad: Nunca comparta su clave de acceso con terceros ni permita el acceso a estudiantes a los módulos de gestión institucional.</em>
      </p>
    </div>

    <!-- Footer -->
    <div class="footer">
      <p><strong>Sistema Integral de Mantenimiento e Infraestructura Escolar</strong></p>
      <p>Este es un correo institucional generado automáticamente por el sistema de seguridad.</p>
      <p style="margin-top: 8px; color: #94A3B8;">&copy; ${new Date().getFullYear()} Plataforma Institucional. Todos los derechos reservados.</p>
    </div>
  </div>
</body>
</html>
    `.trim();

    return { subject, previewSnippet, html };
  }

  /**
   * Dispatches the email notification, records it in Firestore and local storage, and notifies backend
   */
  static async sendSecurityEmailNotification(params: {
    type: EmailNotificationType;
    toEmail: string;
    recipientName: string;
    recipientUsername: string;
    roleTitle?: string;
    securityCode?: string;
  }): Promise<SecurityEmailNotification> {
    const sentAt = new Date().toISOString();
    const deviceInfo = typeof navigator !== 'undefined' ? `${navigator.userAgent.slice(0, 90)}...` : 'Plataforma Web';

    const { subject, previewSnippet, html } = this.generateEmailHtml({
      type: params.type,
      toEmail: params.toEmail,
      recipientName: params.recipientName,
      recipientUsername: params.recipientUsername,
      roleTitle: params.roleTitle,
      sentAt,
      securityCode: params.securityCode,
      deviceInfo
    });

    const notificationId = `mail_notif_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;

    const notificationRecord: SecurityEmailNotification = {
      id: notificationId,
      type: params.type,
      toEmail: params.toEmail,
      recipientName: params.recipientName,
      recipientUsername: params.recipientUsername,
      subject,
      previewSnippet,
      htmlContent: html,
      sentAt,
      status: 'DELIVERED',
      deviceInfo,
      securityCode: params.securityCode
    };

    // 1. Save to local storage for immediate offline/client access
    const local = getLocalStoredEmailNotifications();
    setLocalStoredEmailNotifications([notificationRecord, ...local]);

    // 2. Persist to Firestore collection `email_notifications`
    try {
      await setDoc(doc(db, 'email_notifications', notificationRecord.id), notificationRecord);
    } catch (e) {
      console.warn('Firestore email notification log skipped:', e);
    }

    // 3. Post to backend server route to trigger server-side dispatch log
    try {
      await fetch('/api/auth/send-security-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          notificationId: notificationRecord.id,
          toEmail: params.toEmail,
          recipientName: params.recipientName,
          recipientUsername: params.recipientUsername,
          type: params.type,
          subject,
          html: html,
          sentAt
        })
      });
    } catch (e) {
      // Non-blocking fetch
    }

    return notificationRecord;
  }

  /**
   * Retrieves all recent email notifications for auditing or preview
   */
  static async getRecentNotifications(): Promise<SecurityEmailNotification[]> {
    try {
      const q = query(collection(db, 'email_notifications'), orderBy('sentAt', 'desc'), limit(20));
      const snap = await getDocs(q);
      const docs = snap.docs.map(d => d.data() as SecurityEmailNotification);
      if (docs.length > 0) {
        setLocalStoredEmailNotifications(docs);
        return docs;
      }
    } catch (e) {
      console.warn('Fallback to local email notifications:', e);
    }
    return getLocalStoredEmailNotifications();
  }
}
