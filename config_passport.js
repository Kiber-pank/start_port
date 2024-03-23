import passport from 'passport';
import {Strategy} from 'passport-local';

import {mongoose} from 'mongoose';
import {User} from './models/User.js';


// Серриализация пользователя
passport.serializeUser(function(user, done) {
    done(null, user.id);
});

// Десерриализация пользователя
passport.deserializeUser(function(id, done) {
    User.findById(id, function(err, user) {
        if (err) return next(err);
        done(err, user);
    });
});

// Вход пользователя
passport.use(new Strategy({
        // Переписываем переменные из того что пришло
        usernameField: 'e_mail',
        passwordField: 'pass',
        passReqToCallback: true
    },
    function(req, username, password, done) {
        // Поиск пользователя по e-mail
        User.findOne({ e_mail: username }, function(err, user) {
            if (err) { return done(err); }
            // пПроверяем результат поиска
            if (!user) {
                console.log("Пользователь не обнаружен");
                return done(null, false, req.flash('message', 'Пользователь не найден'));
            } else {
                // Проверяем пароль
                if (user.validPassword(password)) {
                    console.log(`Пользователь ${user.id} выполнил вход`)
                    return done(null, user);
                } else {
                    console.log('Неправильно введен пароль!');
                    return done(null, false, req.flash('message', 'Неправильно введен пароль!'));
                }
            }
        });
    }
))

// Регистрация пользователя
passport.use('signup', new Strategy({
        // Переписываем переменные из того что пришло
        passReqToCallback: true,
        usernameField: 'e_mail',
        passwordField: 'pass',
        passReqToCallback: true
    },
    function(req, username, password, done) {
        findOrCreateUser = function() {
            // поиск пользователя в Mongo с помощью предоставленного E-mail пользователя
            User.findOne({ e_mail: username }, function(err, user) {
                // В случае любых ошибок - возврат
                if (err) {
                    console.log('Error in SignUp: ' + err);
                    return done(err);
                }
                // уже существует
                if (user) {
                    console.log(`Пользователь с таким уже существует`);
                    return done(null, false, req.flash('message', `Пользователь с таким E-mail уже существует`));
                } else {
                    // если пользователя с таки адресом электронной почты
                    // в базе не существует, создать пользователя
                    let newUser = new User();
                    // установка локальных прав доступа пользователя
                    newUser.name = req.body.name;
                    newUser.e_mail = username;
                    newUser.setPassword(password);
                    newUser.timeLine = req.body.timeLine * 60 * 1000;
                    let timeServer = Date.now();
                    let timeUser = new Date(timeServer - newUser.timeLine);
                    console.log('Время пользователя: ', timeUser);
                    // сохранения пользователя
                    newUser.save(function(err) {
                        if (err) {
                            console.log('Error in Saving user: ' + err);
                            throw err;
                        }
                        console.log(`Зарегистрирован пользователь`, newUser.id);
                        //mail.newUser(newUser);
                        return done(null, newUser);
                    });
                }
            });
        };
        // Отложить исполнение findOrCreateUser и выполнить 
        // метод на следующем этапе цикла события
        process.nextTick(findOrCreateUser);
    }));