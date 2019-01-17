const _data   = require('../data');
const helpers = require('../helpers');
let handlers = {};

// tokens
handlers.login = (data,callback)=>{
  let acceptableMethods = ['post'];
  const { method }  = data;
  if(acceptableMethods.indexOf(method) > -1){
      handlers._login[method](data,callback);
    }else{
      callback(405);
  }
};

handlers._login = {};

handlers._login.post = (data,callback) => {
 // // required fields email and password
 //  // destruct email and password from the payload
 let { email,password } = data.payload;
 password = typeof(password) =='string' && password.trim().length > 0? password.trim():false;
 email = typeof(email) =='string' && email.trim().length > 0? email.trim():false;

 // validate required fields
 if(email && password) {

   // look up for the user from the coillection

   _data.read('users',email,(err, userData)=>{
     if(!err && userData){
        if(helpers.hash(password) == userData.password){
          // create a token
          let tokenId = helpers.createRandomString(20);
          // create a token expiry date/time
          let tokenExpiry = Date.now() + 1000*60*60;

         // create a token object

         let tokenObject = { email,tokenId,tokenExpiry };

          // store the token to the disk
          _data.create('tokens',tokenId,tokenObject, err =>{
            if(!err) {
              callback(200,tokenObject);
            }else{
               callback(500,{'Error':'Could not create a new token'});
             }
          });

        }else{
          callback(400,{'Error':'password did not match'});
        }

     }else{
       callback(403,{'Error':'could not find the specified user from the collection'});
     }
   });
 }else{
   callback(400,{'Error':'Missing required fields'});
 }

}

// export auth modules

module.exports = handlers;
