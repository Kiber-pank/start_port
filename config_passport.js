import { Strategy as LocalStrategy } from 'passport-local'
import { User } from './models/User.js';
import { sendMail } from './mailer.js'

export default function (passport) {
  // Серриализация пользователя
  passport.serializeUser(function (user, cb) {
    console.log("serialise");
    process.nextTick(function () {
      cb(null, { id: user.id, username: user.username });
    });
  });

  // Десерриализация пользователя
  passport.deserializeUser(function (user, cb) {
    console.log("deserialise");
    process.nextTick(function () {
      return cb(null, user);
    });
  });

  // Вход пользователя
  passport.use('local', new LocalStrategy({
    // Переписываем переменные из того что пришло
    usernameField: 'e_mail',
    passwordField: 'pwd',
    passReqToCallback: true
  },
    async function (req, username, password, cb) {
      await User.findOne({ e_mail: username })
        .then(user => {
          if (!user) {
            return cb(null, false, { message: 'Неправильно введен логин или пароль' });
          } else {
            if (user.login_err < 3) {
              // Проверяем пароль
              if (user.validPassword(password)) {
                return cb(null, user);
              } else {
                user.$inc('login_err', 1);
                user.save()
                return cb(null, false, { message: 'Неправильно введен логин или пароль' });
              }
            } else {
              user.salt = ""
              user.hash = ""
              user.save()
              sendMail({
                type:'email_blocked',
                user
              })
              return cb(null, false, { message: 'Неправильный пароль введен более 3 раз! Аккаунт заблокирован, инструкция по замене пароля выслана на почту!' });
            }
          }
        },
          error => {
            return cb(error);
          })
    }
  ));

  // Регистрация пользователя
  passport.use('signup', new LocalStrategy({
    // Переписываем переменные из того что пришло
    passReqToCallback: true,
    usernameField: 'e_mail',
    passwordField: 'pwd',
    passReqToCallback: true
  },
    function (req, username, password, cb) {
      var findOrCreateUser = async function () {
        // поиск пользователя в Mongo с помощью предоставленного E-mail пользователя
        await User.findOne({ e_mail: username })
          .then(user => {
            if (user) {
              return cb(null, false, req.flash('message', `Пользователь с таким E-mail уже существует`));
            } else {
              // если пользователя с таки адресом электронной почты
              // в базе не существует, создать пользователя
              let newUser = new User();
              // установка локальных прав доступа пользователя
              newUser.name = req.body.name;
              newUser.e_mail = username;
              newUser.setPassword(password);
              // сохранения пользователя
              newUser.save()
                .then(user => {
                  if (!user) {
                    return cb(null, false, { message: 'Не сохранился пользователь' });
                  } else {
                    sendMail({
                      type:'email_confirmation',
                      user: newUser
                    })
                    return cb(null, newUser);
                  }
                },
                  error => {
                    return cb(error);
                  })
            }
          },
            error => {
              return cb(error);
            })

      };
      // Отложить исполнение findOrCreateUser и выполнить
      // метод на следующем этапе цикла события
      process.nextTick(findOrCreateUser);
    }));
}
