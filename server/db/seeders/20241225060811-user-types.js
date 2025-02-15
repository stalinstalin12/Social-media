'use strict';


module.exports = {
  up: (models, mongoose) => {
    
      return models.user_types.insertMany([
        {
          _id : "676ba1a1fd30e9f16f59769a",
          user_type : "admin"
        },
        {
          _id : "676ba1c1fd30e9f16f59769b",
          user_type : 'user'
        }
       
      ]).then(res => {
     
      console.log(res.insertedCount);
    });
    
  },

  down: (models, mongoose) => {
   
    return models.user_types.deleteMany({
      _id: {
        $in: [
          "676ba1a1fd30e9f16f59769a",
          "676ba1c1fd30e9f16f59769b"
          
        ]
      }
    }).then(res => {
      // Prints "1"
      console.log(res.deletedCount);
      });
  }
};