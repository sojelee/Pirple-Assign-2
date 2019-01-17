/*
* API for logged in users to create orders from their carts
* author Joseph Myalla
* 17 Jan 2019
*/

//@TODO to create an order is, initial consideration to associate the cart id with the user token
const _data   = require('../data');
const fs = require('fs');
let handlers = {};

// tokens
handlers.orders = (data,callback)=>{
  let acceptableMethods = ['delete','get','post','put'];
  const { method }  = data;
  if(acceptableMethods.indexOf(method) > -1){
      handlers._orders[data.method](data,callback);
    }else{
      callback(405);
  }
};

handlers._orders = {};

// Reuest to create an order from the shopping carts
handlers._orders.post = (data,callback)=>{
   // Required fields cartid, uniqu user identifier email
   // Optional fields none

   // Valid token is required to view items
   let tokenId = typeof(data.headers.token)=='string'?data.headers.token:false;

   // Lookup for the token from the storage

   _data.read('tokens',tokenId,(err,tokenContent)=>{
        if(!err && tokenContent){
                // check if the tome has not expired and is of the required length
                if(tokenContent.tokenExpiry > Date.now()){
                  // grap item id and quantity from the payload

                  let { cartId } = data.payload;
                  // validate itemId and quantity
                  if(cartId){
                     // Proceed to update the order
                     // Create items json file with the email of the user as the name of the file
                     // update the file with the content of the specified order
               let orderFileName = tokenContent.email;

               _data.read('orders',orderFileName,(err,orderContents)=>{
                 //@TODO create a uniue order id
                  let orderObject = [{'cartId':cartId,'orderID':0,'emailSent':'0'}];
                     if(err){

                      _data.create('orders',orderFileName,orderObject, err=>{
                          if(!err){
                            callback(200);
                          }else{
                            callback(500,{'Error':'Error creating the order file for the specified user'});
                          }
                      });
                   }else{

                     // Read the specified order file
                     // get the contents and update with the new selected menu items data
                     _data.read('orders',orderFileName,(err,orderContents)=>{
                          if(!err && orderContents && orderContents.length>0){
                             // check if the item beling added to the cart exists, if it exists update the quantity only
                               let orderExists = orderContents.filter(order=>order.cartId == cartId);
                               if(orderExists.length>0){
                                 callback(200,{'message':'Order with this cart id '+cartId+' exists'});

                               }else{
                                // Add the 0th element to the catsContents content arry
                                orderContents.push(orderObject[0]);
                                //update the carts collection with new item selected
                                _data.update('orders',orderFileName,orderContents,err=>{
                                  if(!err){
                                    callback(200);
                                     }else{
                                    callback(500,{'Error':'Could not update the order'});
                                  }
                                });
                               }
                          }else{

                           // file exists but there is no data, create data
                             _data.update('orders',orderFileName,orderObject,err=>{
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
// Getting and displaying orders
// required fields email, unique orderid id saved with a during active session, token value used to create this id
// optional fields none
handlers._orders.get = (data,callback) => {
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
           _data.read('orders',email,(err,orderContents)=>{
              if(!err && orderContents && orderContents.length >0){
                callback(200,orderContents)
                }else{
                  callback(400,{'Error':'Error reading orders from the collection'});
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
// Reuest to delete order from the collection in the disk
handlers._orders.delete = (data,callback)=>{
   callback(200,{'message':'delete order'});
};

// Reuest to update existing order
handlers._orders.put = (data,callback)=>{
   callback(200,{'message':'updating order'});
};


// export order modules

module.exports = handlers;
