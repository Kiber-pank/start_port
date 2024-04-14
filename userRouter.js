import express from 'express';
var router = express.Router();
import passport from 'passport';
import { User } from './models/User.js';
import { sendMail } from './mailer.js'

router
  .post('/login', passport.authenticate('local', { failureRedirect: '/user/login' }),
    function (req, res) {
      res.redirect('/dasboard');
    })
  .get('/login', function (req, res) {
    // Всегда редирект на главную для запуска паспорта
    return res.render('pages/login', { message: "message" })
  })
  //.post('/signup', passport.authenticate('signin', { failureRedirect: '/user/login' }),
  //function(req, res) {
  //  res.redirect('/');
  //})

  .post('/signup', passport.authenticate('signup', { failureRedirect: '/user/login' }),
    function (req, res) {
      res.redirect('/');
    })

  .get('/signup', function (req, res) {
    // Всегда редирект на главную для запуска паспорта
    return res.render('pages/registration', { message: "message" })
  })
  .get('/logout', function (req, res, next) {
    req.logout(function (err) {
      if (err) { return next(err); }
      res.redirect('/user/login');
    });
  })
  .get('/email_confirmation/:id/:email', async function (req, res, next) {
    await User.findOne({ _id: req.params.id, e_mail: req.params.email })
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
  .get('/resetpwd', function (req, res, next) {
    return res.render('pages/resetpwd', { message: "message" });
  })
  .post('/resetpwd', async function (req, res, next) {
    await User.findOne({ e_mail: req.body.e_mail})
      .then(user => {
        if (!user) {
          return next(null);
        } else {
          user.setPassword(req.body.pwd);
          user.$set('e_mail_confirmation', false);
          user.save()
          .then(user => {
            if (!user) {
              return next(null);
            } else {
                sendMail({
                    type:'email_confirmation',
                    user
                  })
                res.redirect('/user/login');
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
  
export default router;
