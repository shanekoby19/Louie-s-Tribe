var mongoose = require('mongoose');
var bcrypt = require('bcrypt');

var userSchema = new mongoose.Schema({
  fName: String,
  lName: String,
  password: String,
  email: String
});

userSchema.statics.authenticate = function(email, password, callback) {
  User.findOne({email: email})
    .exec(function (error, user) {
      if(error) {
        return callback(error);
      }
      else if( !user ) {
        var err = new Error('User not found');
        err.status = 401;
        return callback(err);
      }
      bcrypt.compare(password, user.password, function(error, result) {
        if(result === true) {
          return callback(null, user);
        }
        else {
          return callback();
        }
      })
    });
}

//Hash passwords
userSchema.pre('save', function(next) {
  var User = this;
  bcrypt.hash(User.password, 10, function(err, hash) {
    if(err) {
      return next(err);
    }
    User.password = hash;
    next();
  });
});

var User = mongoose.model('user', userSchema);
module.exports = User;
