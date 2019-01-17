const _data   = require('../data');
let handlers = {};

// tokens
handlers.menuitems = (data,callback)=>{
  let acceptableMethods = ['get'];
  const { method }  = data;
  if(acceptableMethods.indexOf(method) > -1){
      handlers._menuitems[method](data,callback);
    }else{
      callback(405);
  }
};

handlers._menuitems = {};

handlers._menuitems.get = (data,callback) => {
// required fields none
// optional fields none
// Valid token is required to view items
let tokenId = typeof(data.headers.token)=='string'?data.headers.token:false;

// look up for the token from the disk
  _data.read('tokens',tokenId,(err, tokenContent)=>{
     if(!err && tokenContent){

       let listofmenuitems = [];

       // check if the tome has not expired and is of the required length

       if(tokenContent.tokenExpiry > Date.now()){
           _data.read('menuitems','menuitems',(err,menuitemsContents)=>{
              if(!err && menuitemsContents){
                callback(200,menuitemsContents)
                }else{
                  callback(400,{'Error':'reading menu items from the disk'});
                }
           });
       }else{
         callback(403,{'Error':'The specified token has expired, please login again to create a new token'});
       }
     }else{
         callback(400,{'Error':'error reading token from the disk or token is not created'});
     }


  });
}

// export auth modules

module.exports = handlers;
