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

export interface MailConfig {
  host: string;
  port: number;
  secure: boolean;
  user: string;
  pass: string;
  fromAddress: string;
}

// Correo por defecto del administrador de la plataforma RDMI (dinámico desde EMAIL_USER)
export const DEFAULT_ADMIN_EMAIL = (process.env.EMAIL_USER || 'cristalpulecio@gmail.com').trim();

// Nodemailer transporter initialization
let transporter: Transporter | null = null;
let cachedUser = '';
let cachedPass = '';
let cachedHost = '';
let cachedPort = 0;

/**
 * Lee y sanitiza las credenciales exclusivamente desde variables de entorno (.env).
 * Soporta puerto 465 (SSL directo) y 587 (STARTTLS).
 * Limpia espacios internos de EMAIL_PASS para admitir tanto 'abcdefghijklmnop' como 'abcd efgh ijkl mnop'.
 * NUNCA expone EMAIL_PASS en logs ni en mensajes hacia el cliente.
 */
export function getMailConfig(): { config: MailConfig | null; error?: string } {
  const host = (process.env.SMTP_HOST || 'smtp.gmail.com').trim();
  const port = Number(process.env.SMTP_PORT) || 465;
  const secure = process.env.SMTP_SECURE !== undefined
    ? (process.env.SMTP_SECURE === 'true' || process.env.SMTP_SECURE === '1')
    : (port === 465);

  const rawUser = (process.env.EMAIL_USER || process.env.SMTP_USER || '').trim();
  const user = rawUser.replace(/^["']|["']$/g, '').trim();

  const rawPass = (process.env.EMAIL_PASS || process.env.SMTP_PASS || '').trim();
  // Sanitizar la Contraseña de Aplicación de Google: eliminar comillas y todos los espacios
  const pass = rawPass.replace(/^["']|["']$/g, '').replace(/\s+/g, '');

  if (!user) {
    return {
      config: null,
      error: 'Falta la variable EMAIL_USER en el archivo .env. Ingrese su correo emisor de Gmail (ej: cristalpulecio@gmail.com).'
    };
  }

  const isPlaceholder = !pass || pass.includes('tu_contrase') || pass.includes('placeholder') || pass === 'password';
  if (isPlaceholder) {
    return {
      config: null,
      error: 'Falta configurar EMAIL_PASS en el archivo .env con la contraseña de envío (o Contraseña de Aplicación de Google de 16 caracteres obtenida en https://myaccount.google.com/apppasswords).'
    };
  }

  const fromAddress = `"RDMI" <${user}>`;
  return {
    config: { host, port, secure, user, pass, fromAddress }
  };
}

/**
 * Verifica si existe una Contraseña de Aplicación válida de 16 caracteres para Gmail
 * o un servidor SMTP estándar autenticado, para evitar errores 535 Bad Credentials innecesarios.
 */
export function hasDedicatedSmtpAppPassword(): boolean {
  const { config } = getMailConfig();
  if (!config) return false;
  if (config.host.toLowerCase().includes('gmail.com')) {
    return /^[a-zA-Z]{16}$/.test(config.pass);
  }
  return true;
}

export function getMailTransporter(): { transporter: Transporter | null; config: MailConfig | null; error?: string } {
  const { config, error } = getMailConfig();
  if (!config) {
    transporter = null;
    return { transporter: null, config: null, error };
  }

  if (
    !transporter ||
    cachedUser !== config.user ||
    cachedPass !== config.pass ||
    cachedHost !== config.host ||
    cachedPort !== config.port
  ) {
    cachedUser = config.user;
    cachedPass = config.pass;
    cachedHost = config.host;
    cachedPort = config.port;

    console.log(`🔌 [NODEMAILER] Configurando transporte SMTP: host=${config.host}, port=${config.port}, secure=${config.secure}, user=${config.user}, passConfigured=true (${config.pass.length} caracteres)`);

    transporter = nodemailer.createTransport({
      host: config.host,
      port: config.port,
      secure: config.secure, // true para 465 (SSL), false para 587 (STARTTLS)
      auth: {
        user: config.user,
        pass: config.pass
      },
      tls: {
        rejectUnauthorized: false
      },
      connectionTimeout: 4000, // Timeout estricto de conexión inicial (4s)
      greetingTimeout: 4000,   // Timeout de saludo SMTP (4s)
      socketTimeout: 4500      // Timeout de inactividad de socket (4.5s)
    });
  }

  return { transporter, config };
}

/**
 * Verifica el estado de la conexión y autenticación con el servidor SMTP de Gmail.
 * Útil para pruebas diagnósticas y validación de variables de entorno sin exponer contraseñas.
 */
export async function verifySmtpConnection(): Promise<{
  success: boolean;
  message: string;
  host: string;
  port: number;
  user: string;
  secure: boolean;
  error?: string;
}> {
  const { transporter: client, config, error: configError } = getMailTransporter();
  const host = config?.host || process.env.SMTP_HOST || 'smtp.gmail.com';
  const port = config?.port || Number(process.env.SMTP_PORT) || 465;
  const user = config?.user || process.env.EMAIL_USER || '';
  const secure = config?.secure ?? (port === 465);

  if (!client || !config) {
    return {
      success: false,
      message: configError || 'Credenciales SMTP no configuradas en el archivo .env.',
      host,
      port,
      user,
      secure,
      error: configError
    };
  }

  try {
    const verifyPromise = client.verify();
    const timeoutPromise = new Promise((_, reject) => {
      setTimeout(() => {
        const err: any = new Error('ETIMEDOUT: Tiempo de espera agotado (4s) al verificar conexión con el servidor SMTP');
        err.code = 'ETIMEDOUT';
        reject(err);
      }, 4000);
    });

    await Promise.race([verifyPromise, timeoutPromise]);

    console.log(`✅ [NODEMAILER VERIFY SUCCESS] Conexión y autenticación SMTP con Gmail verificadas correctamente para ${user}.`);
    return {
      success: true,
      message: 'Conexión y autenticación SMTP con Google Gmail verificadas exitosamente.',
      host,
      port,
      user,
      secure
    };
  } catch (err: any) {
    console.warn('⚠️ [NODEMAILER VERIFY] Verificación SMTP con Gmail no completada:', err?.message || err);
    let friendly = 'Error de conexión con el servidor de correo.';

    if (err?.code === 'EAUTH' || (err?.response && String(err.response).includes('535'))) {
      friendly = 'Error de autenticación SMTP (535 Bad Credentials): Google rechazó las credenciales. Asegúrese de utilizar una Contraseña de Aplicación de 16 caracteres de Google (creada en https://myaccount.google.com/apppasswords) en EMAIL_PASS, NO la contraseña personal de Gmail.';
    } else if (err?.code === 'ETIMEDOUT' || err?.code === 'ESOCKET' || err?.message?.includes('ETIMEDOUT')) {
      friendly = `Tiempo de espera agotado (4s) al conectar con ${host}:${port}. Verifique la conectividad de red o la configuración del puerto.`;
    } else {
      friendly = `Error al conectar con servidor SMTP (${err?.code || 'ERR'}): ${err?.message || 'Error de socket'}`;
    }

    return {
      success: false,
      message: friendly,
      host,
      port,
      user,
      secure,
      error: friendly
    };
  }
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

  const { transporter: client, config, error: configError } = getMailTransporter();

  console.log(`\n======================================================`);
  console.log(`📧 [NODEMAILER DISPATCH: RECUPERACIÓN DE CONTRASEÑA]`);
  console.log(`➡️ Destinatario: ${options.recipientName} <${toEmail}>`);
  console.log(`🔑 Token: ${options.token}`);
  console.log(`🔢 OTP: ${options.otp}`);
  console.log(`🌐 Enlace: ${options.resetLink}`);
  console.log(`⏳ Validez: ${options.expiresInMinutes || 15} minutos`);
  console.log(`⚙️ SMTP Servidor: ${config?.host || 'No configurado'}:${config?.port || 0}`);
  console.log(`👤 Usuario emisor: ${config?.user || 'No configurado'}`);
  console.log(`======================================================\n`);

  if (!client || !config) {
    const errorMsg = configError || 'Credenciales SMTP no configuradas en el archivo .env (EMAIL_USER / EMAIL_PASS).';
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
    const sendPromise = client.sendMail({
      from: config.fromAddress,
      to: toEmail,
      subject: 'Restablece tu contraseña | RDMI',
      text,
      html
    });

    const timeoutPromise = new Promise((_, reject) => {
      setTimeout(() => {
        const err: any = new Error('ETIMEDOUT: Tiempo de espera agotado (4s) al enviar correo por SMTP');
        err.code = 'ETIMEDOUT';
        reject(err);
      }, 4200);
    });

    const info: any = await Promise.race([sendPromise, timeoutPromise]);

    console.log(`✅ [NODEMAILER SUCCESS] Mensaje entregado exitosamente con ID: ${info.messageId}`);
    return {
      success: true,
      message: 'Correo de recuperación enviado con éxito a través del servidor SMTP/Gmail.',
      sentTo: toEmail,
      smtpConfigured: true
    };
  } catch (err: any) {
    console.warn(`⚠️ [NODEMAILER NOTICE] No se pudo enviar el correo de recuperación SMTP a ${toEmail}:`, err?.message || err);
    let errorDetail = err?.message || 'Error de conexión SMTP';
    if (err?.code === 'EAUTH' || (err?.response && String(err.response).includes('535'))) {
      errorDetail = 'Error de autenticación SMTP (535 Bad Credentials): Google rechazó las credenciales. En Gmail debe usar una Contraseña de Aplicación de 16 caracteres (creada en https://myaccount.google.com/apppasswords) en EMAIL_PASS, NO la contraseña personal de Gmail.';
    } else if (err?.code === 'ETIMEDOUT' || err?.code === 'ESOCKET' || err?.message?.includes('ETIMEDOUT')) {
      errorDetail = `Tiempo de espera agotado (4s) al conectar con ${config.host}:${config.port}. Verifique la conectividad de red o intente nuevamente.`;
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
 * Envia el correo con el código numérico de 6 dígitos (OTP) válido por 15 minutos
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

  const { transporter: client, config, error: configError } = getMailTransporter();

  console.log(`\n======================================================`);
  console.log(`📧 [DESPACHO AUTOMÁTICO DE CÓDIGO OTP - GMAIL SMTP]`);
  console.log(`➡️ Para: ${toEmail}`);
  console.log(`🔢 Código OTP: ${code}`);
  console.log(`⏳ Validez: ${expiresInMinutes} minutos`);
  console.log(`⚙️ Servidor SMTP: ${config?.host || 'smtp.gmail.com'}:${config?.port || 465} (SSL: ${config?.secure ?? true})`);
  console.log(`👤 Usuario emisor: ${config?.user || '⚠️ NO CONFIGURADO'}`);
  console.log(`🔑 Contraseña de Aplicación: ${config ? 'Configurada y sanitizada' : '⚠️ NO CONFIGURADA'}`);
  console.log(`======================================================\n`);

  if (!client || !config) {
    const errorMsg = configError || 'Credenciales de correo no configuradas en el archivo .env. Configure EMAIL_USER y EMAIL_PASS con su Contraseña de Aplicación de 16 caracteres de Google.';
    console.warn(`⚠️ [AVISO SMTP] ${errorMsg}`);
    return {
      success: false,
      message: errorMsg,
      error: errorMsg,
      sentTo: toEmail,
      smtpConfigured: false
    };
  }

  // Remitente exacto institucional: "RDMI" <correo@gmail.com>
  const fromAddress = config.fromAddress;

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
    const sendPromise = client.sendMail({
      from: fromAddress,
      to: toEmail,
      subject,
      text,
      html
    });

    const timeoutPromise = new Promise((_, reject) => {
      setTimeout(() => {
        const err: any = new Error('ETIMEDOUT: Tiempo de espera agotado (4s) al conectar con el servidor SMTP');
        err.code = 'ETIMEDOUT';
        reject(err);
      }, 4200);
    });

    const info: any = await Promise.race([sendPromise, timeoutPromise]);

    console.log(`✅ [NODEMAILER SUCCESS] Código de verificación entregado exitosamente a ${toEmail}. MessageId: ${info.messageId}`);
    return {
      success: true,
      message: 'Código de verificación enviado exitosamente por correo electrónico.',
      sentTo: toEmail,
      smtpConfigured: true
    };
  } catch (err: any) {
    console.warn(`⚠️ [NODEMAILER NOTICE] No se pudo enviar el código de verificación SMTP a ${toEmail}:`, err?.message || err);
    let friendlyError = err?.message || 'Error de conexión con el servidor SMTP';

    if (err?.code === 'EAUTH' || (err?.response && String(err.response).includes('535'))) {
      friendlyError = 'Error de autenticación SMTP (535 Bad Credentials): Google rechazó las credenciales. Asegúrese de generar una Contraseña de Aplicación de 16 caracteres en su cuenta de Google (https://myaccount.google.com/apppasswords) y configurarla en EMAIL_PASS, no la contraseña personal de Gmail.';
    } else if (err?.code === 'ESOCKET' || err?.code === 'ETIMEDOUT') {
      friendlyError = `Error de conexión SMTP: Tiempo de espera agotado (4s) al conectar con el servidor Gmail SMTP en ${config.host}:${config.port}.`;
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
  const { transporter: client, config } = getMailTransporter();
  if (!client || !config) {
    console.warn(`⚠️ [CONFIRMATION EMAIL] No se envió confirmación: credenciales SMTP no configuradas.`);
    return;
  }

  const fromAddress = config.fromAddress;
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

  try {
    const sendPromise = client.sendMail({
      from: fromAddress,
      to: options.toEmail,
      subject,
      html
    });

    const timeoutPromise = new Promise((_, reject) => {
      setTimeout(() => reject(new Error('ETIMEDOUT')), 4000);
    });

    await Promise.race([sendPromise, timeoutPromise]);
  } catch (e) {
    console.warn('Error sending confirmation email:', e);
  }
}
