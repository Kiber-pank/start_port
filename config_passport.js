import { Strategy as LocalStrategy } from 'passport-local'
import { User } from './models/User.js';
import { sendMail } from './mailer.js';
import { constants } from './const.js';
import jwt from 'jsonwebtoken';
const { sign, verify } = jwt;

export default function (passport) {
  // Серриализация пользователя
  passport.serializeUser(function (user, cb) {
    console.log(`Serialise`, user);
    process.nextTick(function () {
      cb(null, { id: user.id, name: user.name });
    });
  });

  // Десерриализация пользователя
  passport.deserializeUser(function (user, cb) {
    console.log(`Deserialise`, user);
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
      console.log(`Start login local stratagy: username:${username} password: ${password}`)
      await User.findOne({ e_mail: username })
        .then(user => {
          if (!user) {
            return cb(null, false, req.flash('err_message', `Пользователь с таким E-mail не зарегистрирован`));
          } else {
            if (user.login_err < 3) {
              // Проверяем пароль
              if (user.validPassword(password)) {
                return cb(null, user);
              } else {
                user.$inc('login_err', 1);
                user.save()
                console.log('password error');
                return cb(null, false, req.flash('err_message', `Неправильно введен логин или пароль осталось попыток до блокировки: ${3-user.login_err}`));
              }
            } else {
              user.$set('e_mail_confirmation', false);
              user.save()
              var token = sign({
                email: username
              },
                constants.JWT_SECRET,
                {
                  expiresIn: '30m'
                }
              )
              sendMail({
                type: 'email_blocked',
                user: {email: user.e_mail},
                token
              })
              return cb(null, false, req.flash('err_message', `Пароль 3 раза введен неправильно, аккаунт заблокирован, на Email направлено письмо для разблокировки`));
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
      console.log(`Start signup local stratagy: username:${username} password: ${password}`);
      var findOrCreateUser = async function () {
        // поиск пользователя в Mongo с помощью предоставленного E-mail пользователя
        await User.findOne({ e_mail: username })
          .then(user => {
            if (user) {
              console.log("Email incorrect");
              return cb(null, false, req.flash('err_message', `Пользователь с таким E-mail уже существует`));
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
                .then(savedUser => {
                  if (!savedUser) {
                    return cb(null, false, req.flash('err_message', `Ошибка при создании пользователя`));
                  } else {
                    var token = sign({
                      email: savedUser.e_mail
                    },
                      constants.JWT_SECRET,
                      {
                        expiresIn: '30m'
                      }
                    )
      
                    sendMail({
                      type: 'signup',
                      user: {
                        name: savedUser.name,
                        e_mail: savedUser.e_mail
                      },
                      token
                    })
                    console.log('Saved new user: ', savedUser);
                    return cb(null, savedUser);
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
