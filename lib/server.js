/*
* Server for starting http server
*
*/

// Dependencies

const http          = require('http');
const path          = require('path');
const urL           = require('url');
const StringDecoder = require('string_decoder').StringDecoder;

const config  = require('./config');
const handlerUsers = require('./handlers/users');
const handlerTokens = require('./handlers/tokens');
const handlerLogin = require('./handlers/auth');
const handlerMenuItems = require('./handlers/menuitems');
const handlerCart      = require('./handlers/shoppingcart');
const handlerOrder     = require('./handlers/orders');
const helpers = require('./helpers');

const httpServer = http.createServer((req,res)=>{
      universalHttp(req,res);
});


let server = {};

// Create a unified server function
const universalHttp = (req,res)=>{
   let parsedUrl         = urL.parse(req.url,true);
   let method            = req.method.toLowerCase();
   let path              = parsedUrl.pathname;
   let headers           = req.headers;
   let trimmedPath       = path.replace(/^\/+|\/+$/g,'');
   let queryStringObject = parsedUrl.query;
   let decoder           = new StringDecoder('utf8');
   let buffer            = '';

   req.on('data', (data)=>{ buffer += decoder.write(data)});

   req.on('end',()=>{
      buffer += decoder.end();

      let payload = helpers.parseJsonToObject(buffer);

      let data = {
                   trimmedPath,
                   queryStringObject,
                   payload,
                   headers,
                   method,
          }

      let chosenHandler = typeof(routerHandler[trimmedPath]) !== 'undefined'? routerHandler[trimmedPath]:(data,callback)=>{
  callback(404);
};

      chosenHandler(data,(statusCode,payload)=>{
        statusCode = typeof(statusCode) =='number'?statusCode:200;
        payload = typeof(payload) =='object'?payload:{};
        let payloadString = JSON.stringify(payload);
        res.setHeader('Content-Type','application/json');
        res.writeHead(statusCode);
        res.end(payloadString);
      });
   });
}


// Containers for router handlers

const routerHandler = {
  'users':handlerUsers.users,
  'tokens':handlerTokens.tokens,
  'login':handlerLogin.login,
  'menuitems':handlerMenuItems.menuitems,
  'shoppingcart':handlerCart.shoppingcart,
  'orders':handlerOrder.orders,
}


// Create initialisation Script

const init = ()=>{
  // Create Http Server Instance
  httpServer.listen(config.httpPort,()=>console.log(`Server is running on port ${config.httpPort} on ${config.envName} environment`));
}

//
server.init = init;

// Export the server modules
module.exports = server;
