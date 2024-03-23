import mongoose from 'mongoose';
import { constants } from './const.js'

var url = constants.MONGO_URL;
var options = {
    autoIndex: true,
    connectTimeoutMS: 10000,
    socketTimeoutMS: 45000
}

mongoose.connect(url, options).then(
    () => { console.log('БД подключена')/** ready to use. The `mongoose.connect()` promise resolves to mongoose instance. */ },
    err => { console.log(err)/** handle initial connection error */ }
  );