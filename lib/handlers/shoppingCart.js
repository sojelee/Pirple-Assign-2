/*
* API for logged in users to add items to their shopping cart
* author Joseph Myalla
*/

//@TODO to create a cart, initial consideration to associate the cart id with the user token
const _data   = require('../data');
const fs = require('fs');
let handlers = {};

// tokens
handlers.shoppingcart = (data,callback)=>{
  let acceptableMethods = ['delete','get','post','put'];
  const { method }  = data;
  if(acceptableMethods.indexOf(method) > -1){
      handlers._shoppingcart[method](data,callback);
    }else{
      callback(405);
  }
};

handlers._shoppingcart = {};

// Reuest to fill menu items to the shopping cart
handlers._shoppingcart.post = (data,callback)=>{
   // Required fields itemid and quantity
   // Optional fields none

   // Valid token is required to view items
   let tokenId = typeof(data.headers.token)=='string'?data.headers.token:false;

   // Lookup for the token from the storage

   _data.read('tokens',tokenId,(err,tokenContent)=>{
        if(!err && tokenContent){
                // check if the tome has not expired and is of the required length
                if(tokenContent.tokenExpiry > Date.now()){
                  // grap item id and quantity from the payload

                  let { itemId, quantity } = data.payload;
                  // validate itemId and quantity
                  if(itemId && quantity){
                     // Proceed to update the cart
                     // Create items json file with the email of the user as the name of the file
                     // update the file with the content of the selected item
               let shoppingCartFileName = tokenContent.email;

               _data.read('shoppingcart',shoppingCartFileName,(err,catsContents)=>{
                  let shoppingCartObject = [{'itemId':itemId,'quantity':quantity}];
                     if(err){

                      _data.create('shoppingcart',shoppingCartFileName,shoppingCartObject, err=>{
                          if(!err){
                            callback(200);
                          }else{
                            callback(500,{'Error':'Error creating the shoppingcart file for the specified user'});
                          }
                      });
                   }else{

                     // Read the specified shoppingcart file
                     // get the contents and update with the new selected menu items data
                     _data.read('shoppingcart',shoppingCartFileName,(err,catsContents)=>{
                          if(!err && catsContents && catsContents.length>0){
                             // check if the item beling added to the cart exists, if it exists update the quantity only
                               let itemExists = catsContents.filter(item=>item.itemId == itemId);
                               if(itemExists.length>0){
                                 // payload with an existing item id, will only update the quantity of the existing menut item object
                                   let tartgetItemIndex = catsContents.findIndex(i=>i.itemId===itemId);
                                   catsContents[tartgetItemIndex].quantity +=quantity;

                                   // update the shoppingcart
                                   _data.update('shoppingcart',shoppingCartFileName,catsContents,err=>{
                                     if(!err){
                                       callback(200);
                                        }else{
                                       callback(500,{'Error':'Could not update the shopping cart'});
                                     }
                                   });

                               }else{
                                // Add the 0th element to the catsContents content arry
                                catsContents.push(shoppingCartObject[0]);
                                //update the carts collection with new item selected
                                _data.update('shoppingcart',shoppingCartFileName,catsContents,err=>{
                                  if(!err){
                                    callback(200);
                                     }else{
                                    callback(500,{'Error':'Could not update the shopping cart'});
                                  }
                                });
                               }
                          }else{

                           // file exists but there is no data, create data
                             _data.update('shoppingcart',shoppingCartFileName,shoppingCartObject,err=>{
                               if(!err){
                                 callback(200);
                                  }else{
                                 callback(500,{'Error':'Could not update the shopping cart'});
                               }
                             });
                          }
                     });


                     }

               });
                  }else{

                    callback(400,{'Error':'Missing required fields'});
                  }

                }else{
                        callback(403,{'Error':'The specified token has expired, please login again to create a new token'});
                }
       }else{
           callback(400,{'Error':'error reading token from the disk or token is not created'});
       }
   });

};
// Getting and displaying shopping cart items
// required fields email, unique cart id saved with a during active session, token value used to create this id
// optional fields none
handlers._shoppingcart.get = (data,callback) => {
// get the email from the query string
var email = typeof(data.queryStringObject.email) == 'string' ?data.queryStringObject.email.trim():false;
// Valid token is required to view items
let tokenId = typeof(data.headers.token)=='string'?data.headers.token:false;

  if(email){
    // look up for the token from the disk
  _data.read('tokens',tokenId,(err, tokenContent)=>{
     if(!err && tokenContent){
    // check if the token has not expired and is of the required length
       if(tokenContent.tokenExpiry > Date.now()){
           _data.read('shoppingcart',email,(err,cartsContents)=>{
              if(!err && cartsContents &&cartsContents.length >0){
                callback(200,cartsContents)
                }else{
                  callback(400,{'Error':'Error reading cart items from the collection'});
                }
           });
       }else{
         callback(403,{'Error':'The specified token has expired, please login again to create a new token'});
       }
     }else{
         callback(400,{'Error':'error reading token from the disk or token is not created'});
     }
  });
  }else{
    callback(400,{'Error':'Missing required fields'});
  }
}

// Reuest to delete menu items to the shopping cart
handlers._shoppingcart.delete = (data,callback)=>{
   callback(200,{'message':'delete item from the cart'});
};

// Reuest to update existing item in the shopping cart
handlers._shoppingcart.put = (data,callback)=>{
   callback(200,{'message':'updating cart'});
};


// export order modules

module.exports = handlers;
