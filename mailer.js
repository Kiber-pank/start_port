import nodemailer from 'nodemailer';
import {constants} from './const.js';
import ejs from 'ejs';

export function sendMail(data) {
  let data_letter = {
    name: data.user.name,
    email_confirmation: `http://${constants.HOST}/user/email_confirmation/${data.user.id}/${data.user.e_mail}`,
    email_unsubscribe: `http://${constants.HOST}/user/unsubscribe/${data.user.id}`,
    email_unblocking: `http://${constants.HOST}/user/resetpwd`
  }
  ejs.renderFile(`./mail_templates/${data.type}.ejs`, data_letter, function (err, letter) {
    if (err) {
      console.log(err);
    } else {
      const transporter = nodemailer.createTransport({
        host: constants.MAIL_HOST,
        port: constants.MAIL_PORT,
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
          to: data.user.e_mail, // list of receivers
          subject: "Подтверждение Email", // Subject line
          //text: "Hello world?", // plain text body
          html: letter, // html body
        });

        console.log("Message sent: %s", info.messageId);
        // Message sent: <d786aa62-4e0a-070a-47ed-0b0666549519@ethereal.email>
      }

      main().catch(console.error);
    }
  });

}
