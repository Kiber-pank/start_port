import nodemailer from 'nodemailer';
import constants from './const';

const transporter = nodemailer.createTransport({
  host: "smtp.yandex.ru",
  port: 465,
  secure: true, // Use `true` for port 465, `false` for all other ports
  auth: {
    user: constants.MAIL_LOGIN,
    pass: constants.MAIL_PWD,
  },
});

// async..await is not allowed in global scope, must use a wrapper
async function main() {
  // send mail with defined transport object
  const info = await transporter.sendMail({
    from: constants.MAIL_LOGIN, // sender address
    to: "irbis-tolik@mail.ru", // list of receivers
    subject: "Hello", // Subject line
    text: "Hello world?", // plain text body
    html: "<b>Hello world?</b>", // html body
  });

  console.log("Message sent: %s", info.messageId);
  // Message sent: <d786aa62-4e0a-070a-47ed-0b0666549519@ethereal.email>
}

main().catch(console.error);
