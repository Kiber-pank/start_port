// Framework Express
import express from 'express';
const app = express();

//Файл с кнстатнами взамен process.ENV
import { constants } from './const.js';

//Доступ к файлам страниц 
import { fileURLToPath } from 'url';
import path from 'path';
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// connect MongoDB
import {} from "./connect_mongo.js";

import usersRouter from "./userRouter.js";

//------------------------------------------------------------------------------------
// Подключаем паспорт

import session from 'express-session';
import passport from 'passport';
import cookieParser from 'cookie-parser';
import flash from 'connect-flash';
import {} from './config_passport.js';


//import mongoose from 'mongoose';
//import cookieParser from 'cookie-parser';
//import bodyParser from 'body-parser';

// Проверка на аутентификацию
const auth = function(req, res, next) {
  if (req.isAuthenticated()) {
      next();
  } else {
      console.log("Пользователь не аутентифицирован");
      return res.redirect('/login_register');
  }
}

app
  .use(express.static(path.join(__dirname, 'static')))
  .set('views', path.join(__dirname, 'views'))
  .set('view engine', 'ejs')

  //Запускаем паспорт
  .use(express.json())
  .use(express.urlencoded({ extended: false }))
  .use(cookieParser())
  .use(flash())

  //Сессия
  .use(
    session({
        secret: constants.SECRET_KEY,
        resave: false,
        saveUninitialized: false
    })
  )

  //Запуск файла конфигурации
  .use(passport.initialize())
  .use(passport.session())

  //Навигация
  .use('/user', usersRouter) // Работа с пользолвателем Логин, Регистрация, Выход

  .get('/', auth, function(req, res) {
    console.log("Index page");
    res.render('pages/index', { message: "message" });
  })

  .listen(constants.PORT, () => console.log(`Listening on ${constants.PORT}`))