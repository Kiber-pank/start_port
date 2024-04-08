import { Strategy as LocalStrategy } from 'passport-local'
import { User } from './models/User.js';

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
      console.log(username);
      console.log(password);
      await User.findOne({ e_mail: username })
        .then(user => {
          if (!user) {
            return cb(null, false, { message: 'Неправильно введен логин или пароль' });
          } else {
            // Проверяем пароль
            if (user.validPassword(password)) {
              console.log(`Пользователь ${user.id} выполнил вход`);
              return cb(null, user);
            } else {
              console.log('Неправильно введен пароль!');
              return cb(null, false, { message: 'Неправильно введен логин или пароль' });
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
      console.log("username", username);
      console.log("password", password);
      var findOrCreateUser = async function () {
        // поиск пользователя в Mongo с помощью предоставленного E-mail пользователя
        await User.findOne({ e_mail: username })
          .then(user => {
            if (user) {
              console.log(`Пользователь с таким уже существует`);
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
                    console.log(`Зарегистрирован пользователь`, newUser.id);
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
