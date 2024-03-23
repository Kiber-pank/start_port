import express from 'express';
var router = express.Router();
import passport from 'passport';


router
    .post('/login', function(req, res, next) {
        // Запускаем проверку входа
        passport.authenticate('local', function(err, user) {

            if (err) return next(err);
            // Если проблема редирект на главную страницу
            if (!user) {
                return res.redirect('/');
            }
            // Если проблем нет редирект на личную страницу
            req.logIn(user, function(err) {
                if (err) return next(err);
                console.log(`Пользователь ${user.id} направлен на свою страницу`);
                return res.redirect('/dashboard/');
            });
        })(req, res, next);
    })
    .get('/login', function(req, res) {
        // Всегда редирект на главную для запуска паспорта
        res.redirect('/');
    })
    .post('/signup',
        // В случае положительной проверки запускается регистрация
        passport.authenticate('signup', {
            successRedirect: '/dashboard',
            failureRedirect: '/',
            failureFlash: true
        })
    )
    .get('/logout', function(req, res) {
        console.log(`Пользователь ${req.user} вышел из учетной записи`);
        req.logout();
        res.redirect('/');
    })



export default router;