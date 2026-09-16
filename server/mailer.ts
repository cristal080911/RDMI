import nodemailer, { type Transporter } from 'nodemailer';

export interface EmailOptions {
  toEmail: string;
  recipientName: string;
  recipientUsername: string;
  token?: string;
  otp?: string;
  resetLink?: string;
  expiresInMinutes?: number;
  sentAt?: string;
}

// Nodemailer transporter initialization
let transporter: Transporter | null = null;

// Correo por defecto del administrador de la plataforma RDMI (dinámico desde EMAIL_USER o fallback institucional)
export const DEFAULT_ADMIN_EMAIL = (process.env.EMAIL_USER || 'cristalpulecio@gmail.com').trim();

let cachedUser = '';
let cachedPass = '';

export function getMailTransporter(): { transporter: Transporter | null; error?: string } {
  const user = (process.env.EMAIL_USER || DEFAULT_ADMIN_EMAIL).trim();
  const pass = process.env.EMAIL_PASS ? process.env.EMAIL_PASS.trim() : '';
  const host = (process.env.SMTP_HOST || 'smtp.gmail.com').trim();
  const port = Number(process.env.SMTP_PORT) || 465;

  const isPlaceholderPass = !pass || pass.includes('tu_contrase') || pass.includes('placeholder') || pass === 'password';

  if (!user || isPlaceholderPass) {
    transporter = null;
    const missing = !user
      ? 'Falta la variable EMAIL_USER en el entorno.'
      : 'La variable EMAIL_PASS contiene un marcador de posición de ejemplo ("tu_contraseña_de_aplicacion_aqui"). Para despachar correos reales a bandejas de entrada, configure su Contraseña de Aplicación de 16 caracteres de Google en .env.';
    return { transporter: null, error: missing };
  }

  if (!transporter || cachedUser !== user || cachedPass !== pass) {
    cachedUser = user;
    cachedPass = pass;
    console.log(`🔌 [NODEMAILER] Configurando transporter SMTP: host=${host}, port=${port}, secure=${port === 465}, user=${user}`);
    transporter = nodemailer.createTransport({
      host,
      port,
      secure: port === 465, // true para puerto 465 (SSL/TLS)
      auth: {
        user,
        pass
      },
      tls: {
        rejectUnauthorized: false
      }
    });
  }

  return { transporter };
}

/**
 * Generates the formal institutional HTML template for password reset
 */
export function generatePasswordResetEmailHtml(options: EmailOptions): {
  subject: string;
  html: string;
  text: string;
} {
  const {
    toEmail,
    recipientName,
    recipientUsername,
    token = '',
    otp = '',
    resetLink = '#',
    expiresInMinutes = 15,
    sentAt = new Date().toISOString()
  } = options;

  const subject = `[Seguridad Institucional] Enlace de Restablecimiento de Contraseña - ${recipientUsername}`;

  const formattedDate = new Date(sentAt).toLocaleString('es-CO', {
    dateStyle: 'full',
    timeStyle: 'medium',
    timeZone: 'America/Bogota'
  }) || sentAt;

  const html = `
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${subject}</title>
  <style>
    body { margin: 0; padding: 0; background-color: #F3EFEA; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #1E293B; }
    .container { max-width: 600px; margin: 28px auto; background-color: #FFFFFF; border-radius: 20px; border: 1px solid #DCD3BE; overflow: hidden; box-shadow: 0 12px 30px rgba(0,0,0,0.08); }
    .header { background: linear-gradient(135deg, #2E0854 0%, #1E1B4B 60%, #0F172A 100%); padding: 32px 24px; text-align: center; color: #FFFFFF; }
    .badge { display: inline-block; background-color: #FEF3C7; color: #92400E; font-size: 11px; font-weight: 800; padding: 5px 14px; border-radius: 999px; margin-bottom: 14px; border: 1px solid #FCD34D; letter-spacing: 0.5px; text-transform: uppercase; }
    .header h1 { margin: 0; font-size: 21px; font-weight: 900; letter-spacing: -0.5px; color: #FFFFFF; }
    .header p { margin: 6px 0 0 0; font-size: 12px; color: #DDD6FE; text-transform: uppercase; letter-spacing: 1.2px; font-weight: 600; }
    .content { padding: 32px 26px; }
    .headline { font-size: 19px; font-weight: 900; color: #2E0854; margin: 0 0 14px 0; letter-spacing: -0.3px; }
    .text { font-size: 14px; line-height: 1.65; color: #334155; margin: 0 0 16px 0; }
    .action-container { text-align: center; margin: 28px 0; }
    .btn-primary { display: inline-block; background: linear-gradient(135deg, #581C87 0%, #3B0764 100%); color: #FFFFFF !important; font-size: 15px; font-weight: 800; text-decoration: none; padding: 14px 32px; border-radius: 14px; box-shadow: 0 6px 18px rgba(88, 28, 135, 0.35); letter-spacing: 0.3px; }
    .otp-box { background-color: #F8FAFC; border: 2px dashed #6366F1; border-radius: 14px; padding: 20px; text-align: center; margin: 24px 0; }
    .otp-label { font-size: 11px; font-weight: 800; color: #64748B; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 6px; }
    .otp-code { font-family: 'Courier New', Courier, monospace; font-size: 32px; font-weight: 900; letter-spacing: 8px; color: #4338CA; }
    .token-box { background-color: #F1F5F9; border-radius: 10px; padding: 12px 14px; font-family: monospace; font-size: 11px; color: #475569; word-break: break-all; margin-top: 10px; border: 1px solid #E2E8F0; }
    .details-table { width: 100%; border-collapse: collapse; margin: 24px 0; background-color: #FAF8F5; border-radius: 12px; border: 1px solid #EAE2D2; overflow: hidden; font-size: 13px; }
    .details-table td { padding: 11px 16px; border-bottom: 1px solid #EAE2D2; }
    .details-table td.label { font-weight: 700; color: #475569; width: 38%; }
    .details-table td.val { font-weight: 600; color: #0F172A; }
    .warning-box { background-color: #FEF2F2; border-left: 4px solid #DC2626; padding: 16px; border-radius: 0 12px 12px 0; margin: 26px 0; }
    .warning-box h4 { margin: 0 0 6px 0; font-size: 13px; font-weight: 800; color: #991B1B; }
    .warning-box p { margin: 0; font-size: 12px; color: #7F1D1D; line-height: 1.55; }
    .footer { background-color: #F8F5EE; padding: 22px 24px; border-top: 1px solid #E5DEC9; text-align: center; font-size: 11px; color: #64748B; }
    .footer p { margin: 4px 0; }
  </style>
</head>
<body>
  <div class="container">
    <!-- Header Institucional -->
    <div class="header">
      <div class="badge">SEGURIDAD Y CONTROL INSTITUCIONAL</div>
      <h1>SISTEMA DE MANTENIMIENTO</h1>
      <p>Gestión de Infraestructura & Seguridad Institucional</p>
    </div>

    <!-- Contenido Principal -->
    <div class="content">
      <h2 class="headline">Solicitud de Restablecimiento de Contraseña</h2>
      <p class="text">Estimado(a) <strong>${recipientName}</strong>,</p>
      <p class="text">
        Hemos recibido una solicitud para restablecer la contraseña de acceso a su cuenta institucional vinculada al usuario <strong>${recipientUsername}</strong>.
      </p>

      <!-- Botón de Acción Principal -->
      <div class="action-container">
        <a href="${resetLink}" target="_blank" class="btn-primary">
          🔐 Restablecer mi Contraseña
        </a>
        <p style="font-size: 12px; color: #64748B; margin-top: 10px;">
          ⏱️ Este enlace es personal y expira en <strong>${expiresInMinutes} minutos</strong>.
        </p>
      </div>

      <!-- Código OTP Alternativo -->
      <div class="otp-box">
        <div class="otp-label">Código de Verificación Rápida (OTP):</div>
        <div class="otp-code">${otp || '123456'}</div>
        <p style="font-size: 12px; color: #475569; margin: 8px 0 0 0;">
          También puede ingresar este código de 6 dígitos directamente en la pantalla de restablecimiento.
        </p>
      </div>

      <!-- Ficha de Datos Técnicos -->
      <table class="details-table">
        <tr>
          <td class="label">👤 Usuario:</td>
          <td class="val">${recipientUsername}</td>
        </tr>
        <tr>
          <td class="label">📧 Correo Registrado:</td>
          <td class="val">${toEmail}</td>
        </tr>
        <tr>
          <td class="label">🕒 Solicitado el:</td>
          <td class="val">${formattedDate}</td>
        </tr>
        <tr>
          <td class="label">⏳ Tiempo de Validez:</td>
          <td class="val" style="color: #B45309; font-weight: 800;">${expiresInMinutes} Minutos (Token Temporal Único)</td>
        </tr>
      </table>

      <div style="font-size: 12px; color: #64748B; margin: 16px 0;">
        Si el botón no funciona, copie y pegue la siguiente dirección en la barra de su navegador:
        <div class="token-box">${resetLink}</div>
      </div>

      <!-- Alerta de Seguridad -->
      <div class="warning-box">
        <h4>⚠️ ¿Usted no realizó esta solicitud?</h4>
        <p>
          Si usted <strong>no solicitó</strong> este cambio, puede ignorar este mensaje de forma segura. Su contraseña actual continuará siendo válida y protegida. Nadie puede acceder a su cuenta sin este enlace o código.
        </p>
      </div>
    </div>

    <!-- Pie de Página -->
    <div class="footer">
      <p><strong>Sistema Integral de Gestión de Mantenimiento</strong></p>
      <p>Mensaje generado de forma automática por el servicio de autenticación SMTP/Gmail institucional.</p>
      <p style="margin-top: 8px; color: #94A3B8;">&copy; ${new Date().getFullYear()} Plataforma Institucional. Todos los derechos reservados.</p>
    </div>
  </div>
</body>
</html>
  `.trim();

  const text = `
SISTEMA DE MANTENIMIENTO INSTITUCIONAL - Restablecimiento de Contraseña
=======================================================================
Hola ${recipientName},

Has solicitado restablecer tu contraseña para la cuenta: ${recipientUsername}.
Para completar el proceso, ingresa al siguiente enlace válido por ${expiresInMinutes} minutos:
${resetLink}

Código OTP de 6 dígitos: ${otp}

Si no solicitaste este cambio, puedes ignorar este mensaje.
  `.trim();

  return { subject, html, text };
}

/**
 * Sends a password reset email using Nodemailer
 */
export async function sendPasswordResetEmail(options: EmailOptions): Promise<{
  success: boolean;
  message: string;
  sentTo: string;
  previewUrl?: string;
  smtpConfigured: boolean;
  error?: string;
}> {
  const { toEmail } = options;
  const { subject, html, text } = generatePasswordResetEmailHtml(options);

  const { transporter: client, error: configError } = getMailTransporter();
  const user = (process.env.EMAIL_USER || DEFAULT_ADMIN_EMAIL).trim();
  const fromAddress = `"RDMI" <${user}>`;

  console.log(`\n======================================================`);
  console.log(`📧 [NODEMAILER DISPATCH: RECUPERACIÓN DE CONTRASEÑA]`);
  console.log(`➡️ Destinatario: ${options.recipientName} <${toEmail}>`);
  console.log(`🔑 Token: ${options.token}`);
  console.log(`🔢 OTP: ${options.otp}`);
  console.log(`🌐 Enlace: ${options.resetLink}`);
  console.log(`⏳ Validez: ${options.expiresInMinutes || 15} minutos`);
  console.log(`⚙️ SMTP Configurado: ${Boolean(client)} (Usuario: ${user || 'No configurado en .env'})`);
  console.log(`======================================================\n`);

  if (!client) {
    const errorMsg = configError || 'Credenciales de correo no configuradas en el entorno (EMAIL_USER / EMAIL_PASS no definidos en .env). No se simula el envío.';
    console.error(`❌ [NODEMAILER ERROR] ${errorMsg}`);
    return {
      success: false,
      message: errorMsg,
      sentTo: toEmail,
      smtpConfigured: false,
      error: errorMsg
    };
  }

  try {
    const info = await client.sendMail({
      from: fromAddress,
      to: toEmail,
      subject: 'Restablece tu contraseña | RDMI',
      text,
      html
    });

    console.log(`✅ [NODEMAILER SUCCESS] Mensaje entregado con ID: ${info.messageId}`);
    return {
      success: true,
      message: 'Correo de recuperación enviado con éxito a través del servidor SMTP/Gmail.',
      sentTo: toEmail,
      smtpConfigured: true
    };
  } catch (err: any) {
    console.error(`❌ [NODEMAILER ERROR] Fallo al enviar correo SMTP:`, err?.message || err);
    let errorDetail = err?.message || 'Error de conexión SMTP';
    if (err?.code === 'EAUTH' || (err?.response && String(err.response).includes('535'))) {
      errorDetail = 'Error de autenticación SMTP: Usuario o contraseña de correo no válidos. En Gmail debe usarse una Contraseña de Aplicación.';
    }
    return {
      success: false,
      message: `Error al enviar correo por SMTP: ${errorDetail}`,
      sentTo: toEmail,
      smtpConfigured: true,
      error: errorDetail
    };
  }
}

/**
 * Envia el correo con el código numérico de 6 dígitos (OTP) válido por 10 minutos
 * según requerimiento específico de recuperación de contraseña por Gmail / SMTP.
 */
export async function sendVerificationCodeEmail(options: {
  toEmail: string;
  recipientName?: string;
  code: string;
  expiresInMinutes?: number;
}): Promise<{
  success: boolean;
  message: string;
  sentTo: string;
  smtpConfigured: boolean;
  error?: string;
}> {
  const { toEmail, recipientName, code, expiresInMinutes = 15 } = options;
  const user = (process.env.EMAIL_USER || DEFAULT_ADMIN_EMAIL).trim();
  const host = (process.env.SMTP_HOST || 'smtp.gmail.com').trim();
  const port = Number(process.env.SMTP_PORT) || 465;

  console.log(`\n======================================================`);
  console.log(`📧 [INTENTO DE ENVÍO DE CORREO REAL - RECUPERACIÓN RDMI]`);
  console.log(`➡️ Para: ${toEmail}`);
  console.log(`🔢 Código OTP: ${code}`);
  console.log(`⏳ Validez: ${expiresInMinutes} minutos`);
  console.log(`⚙️ Servidor SMTP: ${host}:${port} (SSL: ${port === 465})`);
  console.log(`👤 Usuario emisor (EMAIL_USER): ${user || '⚠️ NO CONFIGURADO'}`);
  console.log(`🔑 Contraseña (EMAIL_PASS): ${process.env.EMAIL_PASS ? 'Configurada' : '⚠️ NO CONFIGURADA'}`);
  console.log(`======================================================\n`);

  const { transporter: client, error: configError } = getMailTransporter();

  if (!client) {
    const errorMsg = configError || 'Credenciales de correo no configuradas en el entorno (.env). Configure EMAIL_USER y EMAIL_PASS para enviar correos reales.';
    console.warn(`⚠️ [AVISO SMTP] ${errorMsg}`);
    return {
      success: false,
      message: errorMsg,
      error: errorMsg,
      sentTo: toEmail,
      smtpConfigured: false
    };
  }

  // Remitente exacto requerido: "RDMI" <tu_correo@gmail.com>
  const fromAddress = `"RDMI" <${user}>`;

  // Asunto exacto requerido: "Restablece tu contraseña | RDMI"
  const subject = 'Restablece tu contraseña | RDMI';

  const greeting = recipientName ? `Hola ${recipientName},` : 'Hola,';

  // Texto plano formal y conciso
  const text = `${greeting}\n\nTu código de verificación para restablecer tu contraseña en RDMI es: ${code}\n\nEste código vencerá en ${expiresInMinutes} minutos.\n\nSi no solicitaste este cambio, puedes ignorar este mensaje.\n\nRDMI - Sistema de Infraestructura y Mantenimiento`;

  // Plantilla HTML limpia y formal con el código OTP de 6 dígitos bien destacado y claro
  const html = `
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${subject}</title>
  <style>
    body { margin: 0; padding: 0; background-color: #F8FAFC; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #1E293B; }
    .container { max-width: 540px; margin: 32px auto; background: #FFFFFF; border-radius: 16px; border: 1px solid #E2E8F0; overflow: hidden; box-shadow: 0 10px 25px rgba(0,0,0,0.06); }
    .header { background: #1E1B4B; padding: 28px 24px; text-align: center; color: #FFFFFF; }
    .header h1 { margin: 0; font-size: 24px; font-weight: 900; letter-spacing: 1.5px; color: #FFFFFF; }
    .header p { margin: 6px 0 0 0; font-size: 11px; text-transform: uppercase; color: #A5B4FC; letter-spacing: 1px; font-weight: 700; }
    .body { padding: 32px 28px; }
    .headline { font-size: 18px; font-weight: 800; color: #1E1B4B; margin: 0 0 14px 0; }
    .message { font-size: 15px; line-height: 1.6; color: #334155; margin: 0 0 24px 0; }
    .code-box { background: #F1F5F9; border: 2px dashed #6366F1; border-radius: 14px; padding: 24px; text-align: center; margin: 24px 0; }
    .code-label { font-size: 12px; font-weight: 800; color: #4F46E5; text-transform: uppercase; letter-spacing: 1.5px; margin-bottom: 8px; }
    .code-digits { font-family: 'Courier New', Courier, monospace; font-size: 42px; font-weight: 900; letter-spacing: 10px; color: #312E81; margin: 8px 0; padding-left: 10px; }
    .notice { font-size: 13px; color: #B45309; background: #FFFBEB; border: 1px solid #FCD34D; border-radius: 10px; padding: 12px 16px; margin-top: 20px; line-height: 1.5; }
    .security-note { font-size: 12px; color: #64748B; margin-top: 24px; line-height: 1.5; border-top: 1px solid #F1F5F9; padding-top: 16px; }
    .footer { background: #F8FAFC; padding: 20px 24px; border-top: 1px solid #E2E8F0; text-align: center; font-size: 11px; color: #94A3B8; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>RDMI</h1>
      <p>Sistema Institucional de Mantenimiento</p>
    </div>
    <div class="body">
      <h2 class="headline">Restablece tu contraseña</h2>
      <p class="message">
        ${greeting}<br>
        Has solicitado restablecer tu contraseña de acceso a la plataforma <strong>RDMI</strong>. Utiliza el siguiente código de verificación de 6 dígitos para completar el proceso:
      </p>

      <div class="code-box">
        <div class="code-label">Código de Verificación</div>
        <div class="code-digits">${code}</div>
      </div>

      <div class="notice">
        ⏱️ <strong>Importante:</strong> Este código es de uso único y caducará exactamente en <strong>${expiresInMinutes} minutos</strong>.
      </div>

      <p class="security-note">
        Si tú no realizaste esta solicitud, puedes ignorar este mensaje con total seguridad. Tu contraseña actual no se modificará.
      </p>
    </div>
    <div class="footer">
      <p style="margin: 0 0 4px 0;"><strong>RDMI</strong> &bull; Gestión de Infraestructura y Mantenimiento</p>
      <p style="margin: 0;">Mensaje enviado automáticamente mediante el servicio institucional de correo SMTP.</p>
    </div>
  </div>
</body>
</html>
  `.trim();

  try {
    const info = await client.sendMail({
      from: fromAddress,
      to: toEmail,
      subject,
      text,
      html
    });

    console.log(`✅ [NODEMAILER SUCCESS] Código de verificación entregado exitosamente a ${toEmail}. MessageId: ${info.messageId}`);
    return {
      success: true,
      message: 'Código de verificación enviado exitosamente por correo electrónico.',
      sentTo: toEmail,
      smtpConfigured: true
    };
  } catch (err: any) {
    console.error(`❌ [NODEMAILER ERROR REAL] Error al despachar correo a ${toEmail}:`, err);
    let friendlyError = err?.message || 'Error de conexión con el servidor SMTP';

    if (err?.code === 'EAUTH' || (err?.response && String(err.response).includes('535'))) {
      friendlyError = 'Error de autenticación SMTP: Las credenciales de Gmail (EMAIL_USER / EMAIL_PASS) no son válidas. Asegúrese de generar una Contraseña de Aplicación de 16 dígitos en su cuenta de Google.';
    } else if (err?.code === 'ESOCKET' || err?.code === 'ETIMEDOUT') {
      friendlyError = 'Error de conexión SMTP: Tiempo de espera agotado al conectar con el servidor Gmail SMTP en puerto 465.';
    }

    return {
      success: false,
      message: `Error al enviar correo por SMTP: ${friendlyError}`,
      error: friendlyError,
      sentTo: toEmail,
      smtpConfigured: true
    };
  }
}

/**
 * Sends a confirmation email after password reset completes
 */
export async function sendPasswordChangedEmail(options: {
  toEmail: string;
  recipientName: string;
  recipientUsername: string;
}): Promise<void> {
  const { transporter: client } = getMailTransporter();
  const user = (process.env.EMAIL_USER || DEFAULT_ADMIN_EMAIL).trim();
  const fromAddress = `"RDMI" <${user}>`;

  const subject = `[Confirmación de Seguridad] Su contraseña institucional ha sido actualizada | RDMI`;
  const html = `
  <div style="font-family: sans-serif; max-width: 600px; margin: 20px auto; padding: 24px; border: 1px solid #E2E8F0; border-radius: 12px; background: #fff;">
    <h2 style="color: #1E1B4B; margin-top: 0;">RDMI - Contraseña Actualizada Exitosamente</h2>
    <p>Hola <strong>${options.recipientName}</strong>,</p>
    <p>Le confirmamos que la contraseña para su usuario <strong>${options.recipientUsername}</strong> ha sido actualizada de forma segura.</p>
    <p>Fecha y hora: <strong>${new Date().toLocaleString('es-CO', { timeZone: 'America/Bogota' })}</strong></p>
    <p style="color: #64748B; font-size: 12px; margin-top: 24px; border-top: 1px solid #E2E8F0; padding-top: 12px;">
      Si usted no realizó esta modificación, contacte inmediatamente a la administración institucional de RDMI.
    </p>
  </div>
  `;

  if (!client) {
    console.warn(`⚠️ [CONFIRMATION EMAIL] No se envió confirmación: credenciales SMTP no configuradas.`);
    return;
  }

  try {
    await client.sendMail({
      from: fromAddress,
      to: options.toEmail,
      subject,
      html
    });
  } catch (e) {
    console.warn('Error sending confirmation email:', e);
  }
}
