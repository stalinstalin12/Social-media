'use strict';

const bcrypt = require("bcrypt");

module.exports = {
  up: (models, mongoose) => {

      let password = "admin123";
      let salt = bcrypt.genSaltSync(10);
      const hashed_pass = bcrypt.hashSync(password,salt);
    
      return models.users.insertMany([
        {  "name" : "admin",
          "email" : "admin@gmail.com",
          "password" : hashed_pass,
          "user_type" : "676ba1a1fd30e9f16f59769a"
          
        }
        
      ]).then(res => {
      // Prints "1"
      console.log(res.insertedCount);
    });
  },

  down: (models, mongoose) => {
   
    return models.users.deleteMany({
      _id: "676ba1a1fd30e9f16f59769a"
    }).then(res => {
      // Prints "1"
      console.log(res.deletedCount);
      });
  }
};

