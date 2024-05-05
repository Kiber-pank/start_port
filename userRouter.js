import express from 'express';
var router = express.Router();
import passport from 'passport';
import { User } from './models/User.js';
import { sendMail } from './mailer.js';
import { constants } from './const.js';
import jwt from 'jsonwebtoken';
const { sign, verify } = jwt;

//------Есть
const e_mail_confirmation = async function (req, res, next) {
  console.log("Start e_mail_confirmation")
  await User.findOne({ e_mail: req.body.e_mail })
    .select('e_mail_confirmation e_mail')
    .then(user => {
      console.log("e_mail_confirmation user ", user);
      if (!user) {
        return res.render('pages/login', { err_message: "Пользователь с таким E-mail не зарегистрирован" });
      } else {
        if (user.e_mail_confirmation) {
          console.log("E_mail_confirmation seccess go to passport login");
          next();
        } else {
          console.log("E_mail_confirmation error go to email_confirmation_page");
          res.cookie('e_mail', user.e_mail);
          return res.redirect('/user/email_confirmation_page');
        }
      }
    },
      error => {
        return cb(error);
      })
}

router
  //------Есть
  .get('/login', function (req, res) {
    return res.render('pages/login', { err_message: req.flash('err_message') });
  })
  //------Есть
  .post('/login', e_mail_confirmation, passport.authenticate('local', { failureRedirect: '/user/login' }),
    function (req, res) {
      res.redirect('/dashboard');
    })
  //-----Есть
  .post('/signup', passport.authenticate('signup', { failureRedirect: '/user/login' }),
    function (req, res) {
      res.redirect('/dashboard');
    })
  //-----Есть
  .get('/signup', function (req, res) {
    // Всегда редирект на главную для запуска паспорта
    return res.render('pages/registration', { err_message: req.flash("err_message") })
  })
  //-----Есть
  .get('/logout', function (req, res, next) {
    req.logout(function (err) {
      if (err) { return next(err); }
      res.redirect('/user/login');
    });
  })
  //----Есть
  .get('/email_confirmation/:email/:token', function (req, res, next) {
    jwt.verify(req.params.token, constants.JWT_SECRET, async (err, decoded) => {
      if (err) {
        req.flash('err_message', `Ошибка обработки ключа! `)
        if (err.message == 'jwt expired') {
          req.flash('err_message', `Ключ просрочен, отправлено повторное письмо`)
          var token = sign({
            email: req.params.email
          },
            constants.JWT_SECRET,
            {
              expiresIn: '30m'
            }
          )
          sendMail({
            type: 'email_confirmation',
            user:{
              e_mail: req.params.email
            },
            token
          })
        }
        return res.redirect('/user/email_confirmation_page');
      } else {
        console.log('jwt success');
        await User.findOne({ e_mail: req.params.email })
          .then(async(user) => {
            if (!user) {
              req.flash('err_message', "Пользователь не найден");
              return res.redirect('/user/login');
            } else {
              user.$set('e_mail_confirmation', true);
              user.$set('login_err', 0);
              console.log("user: ", user);
              await user.save()
                .then(
                  res=>console.log("res save: ", res),
                  err=>console.log(err)
                );
              req.flash('err_message', `Почта успешно подтверждена, войдите в аккаунт`);
              res.redirect('/dashboard');
            }
          },
            error => {
              return next(error);
            })
      }
    })
  })

/*   .post('/email_confirmation', async function (req, res, next) {
    await User.findOne({ e_mail: req.body.e_mail })
      .then(user => {
        if (!user) {
          return next(null);
        } else {
          user.$set('e_mail_confirmation', true);
          user.$set('login_err', 0);
          user.save();
          res.redirect('/dashboard');
        }
      },
        error => {
          return next(error);
        })
  })
 */
  .get('/resetpwd', function (req, res, next) {
    return res.render('pages/resetpwd', { err_message: req.flash("err_message")});
  })

  .post('/resetpwd', async function (req, res, next) {
    await User.findOne({ e_mail: req.body.e_mail })
      .then(user => {
        if (!user) {
          return next(null);
        } else {
          user.setPassword(req.body.pwd);
          user.$set('e_mail_confirmation', false);
          user.save()
            .then(savedUser => {
              if (!savedUser) {
                return next(null);
              } else {
                var token = sign({
                  email: savedUser.e_mail
                },
                  constants.JWT_SECRET,
                  {
                    expiresIn: '10m'
                  }
                )

                sendMail({
                  type: 'email_confirmation',
                  email: savedUser.e_mail,
                  token
                })
                res.cookie('e_mail', savedUser.e_mail);
                return res.redirect('/user/email_confirmation_page');
              }
            },
              error => {
                return next(error);
              })
        }
      },
        error => {
          return next(error);
        })
  })

  .get('/email_confirmation_page', function (req, res, next) {
    if (req.cookies.e_mail) {
      var token = sign({
        e_mail: req.cookies.e_mail
      },
        constants.JWT_SECRET,
        {
          expiresIn: '10m'
        }
      )

      sendMail({
        type: 'email_confirmation',
        user: {
          e_mail: req.cookies.e_mail
        },
        token
      })
    }
    return res.render('pages/email_confirmation', { err_message: req.flash('err_message'),
                                                    e_mail:req.cookies.e_mail})
  })
export default router;
