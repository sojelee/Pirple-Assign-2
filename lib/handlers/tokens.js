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

// Retrieving token from the system
handlers._tokens.get = (data,callback)=>{
// Required fields
const tokenId = typeof(data.queryStringObject.tokenId) == 'string' && data.queryStringObject.tokenId.trim().length == 20 ?data.queryStringObject.tokenId.trim():false;
    if(tokenId){
      // loou up for the token from the disk
      _data.read('tokens',tokenId,(err,tokenContent)=>{
          if(!err && tokenContent){
           callback(200,tokenContent);
          }else{
            callback(400,{'Error':'Failed getting token from the disk'});
          }
      })
    }else{
      callback(400,{'Error':'Missing required fields'});
    }
}

// Updating token data in the collection in the disk
handlers._tokens.put = (data,callback)=>{
  // get the email and tokenExtend from the payload using destructureing
  let { tokenId, tokenExtend } = data.payload;
  // Required fields tokenId and tokenExtend which is a boolean field,
  tokenId = typeof(tokenId) =='string' && tokenId.trim().length ==20? tokenId.trim():false;
  tokenExtend = typeof(tokenExtend) =='boolean' && tokenExtend == true?true:false

  if(tokenId && tokenExtend){
    // look up for the token from the coillection
    _data.read('tokens',tokenId,(err,tokenContent)=>{
        if(!err && tokenContent){
           // check if token expiry date/time is reached
           
           if(tokenContent.tokenExpiry > Date.now()){
             tokenContent.tokenExpiry = Date.now()+ 1000*60*60;
             // update token in the coillection
             _data.update('tokens',tokenId,tokenContent, err =>{
               if(!err){
                 callback(200);

               }else{
                 callback(500,{'Error':'Could not update the token expiration'});
               }
             });
           }else{
             callback(400,{'Erro':'Token has expired and cannot be extended'});
           }
        }else{
          callback(403,{'Error':'Could not find token from the collection'});
        }
    });
  }else{
    callback(400,{'Error':'Missing required fields'});
  }

}

// Deleting/destoru a token token from the collection in the disk
handlers._tokens.delete = (data,callback)=>{
    // Required field email
    // Optional field none

    const tokenId = typeof(data.queryStringObject.tokenId) == 'string' && data.queryStringObject.tokenId.trim().length == 20 ?data.queryStringObject.tokenId.trim():false;

    if(tokenId){
      // look up for the token from the disk
       _data.read('tokens',tokenId,(err, tokenConent)=>{
         if(!err && tokenConent){
           // destroy the token
           _data.delete('tokens',tokenId, err =>{
             if(!err){
               callback(200);
             }else{
               callback(500,{'Error':'Could not delete the specified token from the collection'});
             }
           })
         }else{
           callback(403,{'Error':'Could not find the specified token in the collection'});
         }
       })
    }else{
      callback(400,{'Error':'Missing required fields'});
    }

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
