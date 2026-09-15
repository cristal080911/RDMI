import nodemailer from 'nodemailer';

export const sendResetPasswordEmail = async (email: string, resetUrl: string) => {
  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST || 'smtp.gmail.com',
    port: Number(process.env.SMTP_PORT) || 465,
    secure: true,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  const htmlContent = `
    <div style="background-color: #121212; color: #ffffff; padding: 30px; font-family: Arial, sans-serif; border-radius: 8px; max-width: 500px; margin: 0 auto;">
      <h1 style="color: #4caf50; margin-bottom: 10px;">RDMI</h1>
      <h2 style="font-size: 18px; margin-bottom: 20px;">Restablece tu contraseña</h2>
      <p>Hola,</p>
      <p>Has solicitado cambiar tu contraseña en RDMI. Haz clic en el botón de abajo para continuar:</p>
      <a href="${resetUrl}" style="display: inline-block; background-color: #2e7d32; color: #ffffff; padding: 12px 20px; text-decoration: none; border-radius: 5px; font-weight: bold; margin: 20px 0;">Restablecer mi contraseña</a>
      <p style="font-size: 12px; color: #888888;">Este enlace vence en 15 minutos.<br>Si no solicitaste este cambio, puedes ignorar este mensaje.</p>
    </div>
  `;

  await transporter.sendMail({
    from: '"RDMI" <' + process.env.EMAIL_USER + '>',
    to: email,
    subject: 'Restablece tu contraseña | RDMI',
    import nodemailer from 'nodemailer';

export const sendResetPasswordEmail = async (email: string, resetUrl: string) => {
  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST || 'smtp.gmail.com',
    port: Number(process.env.SMTP_PORT) || 465,
    secure: true,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  const htmlContent = `
    <div style="background-color: #121212; color: #ffffff; padding: 30px; font-family: Arial, sans-serif; border-radius: 8px; max-width: 500px; margin: 0 auto;">
      <h1 style="color: #4caf50; margin-bottom: 10px;">RDMI</h1>
      <h2 style="font-size: 18px; margin-bottom: 20px;">Restablece tu contraseña</h2>
      <p>Hola,</p>
      <p>Has solicitado cambiar tu contraseña en RDMI. Haz clic en el siguiente botón para continuar:</p>
      <a href="${resetUrl}" style="display: inline-block; background-color: #2e7d32; color: #ffffff; padding: 12px 20px; text-decoration: none; border-radius: 5px; font-weight: bold; margin: 20px 0;">Restablecer mi contraseña</a>
      <p style="font-size: 12px; color: #888888;">Este enlace vence en 15 minutos.<br>Si no solicitaste este cambio, puedes ignorar este mensaje.</p>
    </div>
  `;

  await transporter.sendMail({
    from: '"RDMI" <' + process.env.EMAIL_USER + '>',
    to: email,
    subject: 'Restablece tu contraseña | RDMI',
    html: htmlContent,
  });
};
    html: htmlContent,
  });
};