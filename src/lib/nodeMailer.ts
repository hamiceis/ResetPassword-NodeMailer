import nodemailer from "nodemailer"

//transporter são as configurações do serviço de envio pode ser google ou algum SMTP
// const transporter = nodemailer.createTransport({
//   service: "Gmail",
//   auth: {
//     user: process.env.EMAIL_USER ?? "your_email@gmail.com",
//     pass: process.env.PASS_USER ?? "your_password",
//   }
// })

const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST || 'sandbox.smtp.mailtrap.io',
  port: parseInt(process.env.EMAIL_PORT!) || 2525,
  auth: {
    user: process.env.EMAIL_USER || '548d8d0b3dccbc',
    pass: process.env.EMAIL_PASS || '6f32616f06ec88',
  },
});

//função para enviar o email para o usuário resetar a senha
export async function sendResetPasswordEmail(email: string, token: string) {
  //URL para resetar senha
  const resetUrl = `http://localhost:3333/reset-password?token=${token}`
  
  //Opções de envio para destinatário
  const mailOptions = {
    from: "no-reply@example.com", // O remetente do email
    to: email, // O destinatário para quem vai receber
    subject: "Resetar senha", // Assunto do email
    text: `Clique no link para resetar sua senha: ${resetUrl}` // Messagem de texto 
  };

  await transporter.sendMail(mailOptions)
}