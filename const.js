const constants = {
    HOST: '89.104.68.101', //адресс приложения
    PORT:8000, //порт приложения
    MONGO_URL:'mongodb://Taliban:TOLIKA1200@89.104.68.101:27020/MyBase?authSource=admin&readPreference=primary&ssl=false',
    SECRET_KEY: 'SecretKey', // Секретный ключ сессии
    //https://yandex.ru/support/mail/mail-clients/others.html
    MAIL_HOST: 'smtp.yandex.ru', 
    MAIL_PORT: 465,
    MAIL_LOGIN: 'irbis-tolik@yandex.ru',
    MAIL_PWD: 'aqernossqykbaopf'
}

export { constants }

// TO DO Реализовать авторизацию по Гугл https://www.passportjs.org/packages/passport-google-oauth/
// TO DO Реализовать авторизацию по ВК https://www.passportjs.org/packages/passport-vkontakte/
// TO DO Реализовать авторизацию по Mail.ru https://www.passportjs.org/packages/passport-mail/
// TO DO Реализовать авторизацию по Одноклассники https://www.passportjs.org/packages/passport-odnoklassniki/
// TO DO Реализовать авторизацию по Яндексу https://www.passportjs.org/packages/passport-yandex/
// TO DO Реализовать авторизацию по Телеге https://www.passportjs.org/packages/passport-telegram/
// TO DO Реализовать авторизацию по Запомини меня https://www.passportjs.org/packages/passport-remember-me
// TO DO Настраиваем отправку письма при регистрации через логин и пароль
// TO DO При любой регистрации в личном кабинете подтверждение почты
// TO DO Отдельно страница с личными данными и настройкой запросов
// TO DO Наладить группировку данных по совпадениям по информации с сайта
// TO DO Наладить единое форматирование
// TO DO Наладить группировку по данным после форматирования
// TO DO Настроить вывод информации в табличном виде
// TO DO Настроить вывод информации в файл
// TO DO Настроить хранение файла
// TO DO Настроить отправку файла


