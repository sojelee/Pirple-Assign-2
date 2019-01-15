const _data   = require('../data');
const helpers = require('../helpers');
let handlers = {};

// tokens
handlers.tokens = (data,callback)=>{
  let acceptableMethods = ['post','get','put','delete'];
  const { method }  = data;
  if(acceptableMethods.indexOf(method) > -1){
      handlers._tokens[data.method](data,callback);
    }else{
      callback(405);
  }
};

handlers._tokens ={};
// creating token and storing it to the system
handlers._tokens.post = (data,callback)=>{
  // destruct email and password from the payload
  let { email,password } = data.payload;
  email = typeof(email) =='string' && email.trim().length > 0? email.trim():false;
  password = typeof(password) =='string' && password.trim().length > 0? password.trim():false;

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

// Retrieving token from the system
handlers._tokens.get = (data,callback)=>{

}

// Updating token data in the collection in the disk
handlers._tokens.put = (data,callback)=>{

}

// Deleting token from the collection in the disk
handlers._tokens.delete = (data,callback)=>{
    // Required field email
    // Optional field none

}

// Verify if a give token id is currently valid for a given users
handlers._tokens.verifyToken = (tokenId,email,callback)=>{
  // Look up for the token
  if(tokenId){
    _data.read('tokens',tokenId,(err,tokenContent)=>{
      if(!err && tokenContent){
        if(tokenContent.email == email && tokenContent.tokenExpiry > Date.now()){
          callback(true);
        }else {
          callback(false);
        }
      }
    });

  }else{
    callback(false);
  }
}

// Export module

module.exports = handlers;
