import nodemailer from "nodemailer";

export default async function sendMail(to, subject, text) {
  const transporter = nodemailer.createTransport({
    service: "gmail",
    secure: true,
    port: 465,
    auth: {
      user: process.env.ADMIN_EMAIL,
      pass: process.env.PASSWORD_KEY,
    },
  });

  const mailOptions = {
    from: process.env.ADMIN_EMAIL,
    to,
    subject,
    html: text,
  };

  await transporter.sendMail(mailOptions);
}
