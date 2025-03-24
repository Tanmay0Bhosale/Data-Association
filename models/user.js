const mongoose = require('mogoose');

mongoose.connect('mongodb://localhost:27017/dataAssociation');

const userSchema = mongoose.Schema({
     username: String,
     email : String,
     age : Number,
     posts :Array
})

module.exports = mongoose.model('user' , userSchema); 