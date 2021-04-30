const mongoose = require('mongoose');
const uniqueValidator = require('mongoose-unique-validator');

const userShema = mongoose.Schema({
    userId: { type: String, require: true, unique: true },
    email: { type: String, require: true },
    password: { type: String, require: true },
});


userShema.plugin(uniqueValidator);
module.exports = mongoose.model('User', userShema);