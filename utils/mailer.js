// utils/mailer.js
const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_PASS,
  },
});

const sendVerificationEmail = (email, code) => {
  return transporter.sendMail({
    from: process.env.GMAIL_USER,
    to: email,
    subject: 'Código de Verificação',
    text: `Seu código de verificação é: ${code}`,
  });
};

module.exports = { sendVerificationEmail };
