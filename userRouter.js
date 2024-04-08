import express from 'express';
var router = express.Router();
import passport from 'passport';

router
    .post('/login', passport.authenticate('local', { failureRedirect: '/user/login' }),
    function(req, res) {
      res.redirect('/');
    })
    .get('/login', function(req, res) {
        // Всегда редирект на главную для запуска паспорта
        return res.render('pages/login', { message: "message" })
    })
    //.post('/signup', passport.authenticate('signin', { failureRedirect: '/user/login' }),
    //function(req, res) {
    //  res.redirect('/');
    //})

    .post('/signup', passport.authenticate('signup', { failureRedirect: '/user/login' }),
    function(req, res) {
      res.redirect('/');
    })
    
    .get('/signup', function(req, res) {
        // Всегда редирект на главную для запуска паспорта
        return res.render('pages/registration', { message: "message" })
    })
    .get('/logout', function(req, res, next) {
        req.logout(function(err) {
          if (err) { return next(err); }
          res.redirect('/user/login');
        });
      })

export default router;