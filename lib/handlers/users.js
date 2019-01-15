const _data   = require('../data');
const helpers = require('../helpers');
let handlers = {};

// users
handlers.users = (data,callback)=>{
  let acceptableMethods = ['post','get','put','delete'];
  const { method }  = data;
  if(acceptableMethods.indexOf(method) > -1){
      handlers._users[data.method](data,callback);
    }else{
      callback(405);
  }
};

handlers._users ={};

handlers._users.post = (data,callback)=>{
  // destruct name,email and address from the payload
  let { name, email,address,password } = data.payload;
  name = typeof(name) =='string' && name.trim().length > 0? name.trim():false;
  email = typeof(email) =='string' && email.trim().length > 0? email.trim():false;
  address = typeof(address) =='string' && address.trim().length > 0? address.trim():false;
  password = typeof(password) =='string' && password.trim().length > 0? password.trim():false;
  // validate required fields
  if(name && email && address && password) {
   // Look up the user from the collection

   _data.read('users',email,(err,userData)=>{
      if(err){
        password = helpers.hash(password);
        if(password){
          let userObject = {name,email,address,password};
        // Create a user file in the disk
        // email is used to uniquely create user files
        _data.create('users',email,userObject,(err)=>{
           if(!err){
             callback(200);
           }else{
             callback(500,{'Error':'Could not create a user to the collection'});
           }
        });}
      } else{
        callback(403,{'Error':'user with the provided email already exist'})
      }
   });

  }else{
    callback(400,{'Error':'Missing required fields'});
  }
}

handlers._users.get = (data,callback)=>{
  var email = typeof(data.queryStringObject.email) == 'string' ?data.queryStringObject.email.trim():false;
   if(email){
      _data.read('users',email,(err,userData)=>{
        if(!err && userData){
          delete userData.password;
          callback(200,userData);
        }else{
          callback(403,{'Error':'Could not find the specified user from the collection'});
        }
      });
   }

}

// Updating user data in the collection in the disk
handlers._users.put = (data,callback)=>{
  // destruct fields from the payload
  let { name, email,address,password } = data.payload;
    // Required fields email

  email = typeof(email) =='string' && email.trim().length > 0? email.trim():false;

  // Optional fields name,password, physical address
  name = typeof(name) =='string' && name.trim().length > 0? name.trim():false;
  address = typeof(address) =='string' && address.trim().length > 0? address.trim():false;
  password = typeof(password) =='string' && password.trim().length > 0? password.trim():false;

  // valida the required field

          if(email){

            // check for Optional fields
               if(name || address || password){
                 // look up for the specified user from the coillection
                 _data.read('users',email,(err, userData)=>{
                      if(!err && userData){
                          if(name) userData.name=name;
                          if(address) userData.address= address;
                          if(password) userData.password=helpers.hash(password);

                          // update user with updated Content
                          _data.update('users',email,userData,err=>{
                            if(!err){
                              callback(200);
                               }else{
                              callback(500,{'Error':'Could not update the users data'});
                            }
                          });
                      }else{
                        callback(403,{'Error':'Could not find the user from the collectio '});
                      }
                 });
               }
          }else{
            callback(400,{'Error':'Missing required field'});
          }
}

// Deleting user from the collection in the disk

handlers._users.delete = (data,callback)=>{
    // Required field email
    // Optional field none
    var email = typeof(data.queryStringObject.email) == 'string' ?data.queryStringObject.email.trim():false;
    if(email){
      // Look up for the user from the collection in the disk
      _data.read('users',email,(err,userData)=>{
        if(!err && userData){
          _data.delete('users',email,(err)=>{
            if(!err){
              callback(200);
            }else{
              callback(500,{'Error':'could not delete user from the collection'});
            }
          });
        }else{
          callback(400,{'Error':'User does not exist in the disk'});
        }
      });
    }

}

// Export module

module.exports = handlers;
