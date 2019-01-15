/*
* Helpers for various tasks
**/
// Dependencies
const crypto = require('crypto');
const config = require('./config');
const https = require('https');
const querystring = require('querystring');
// Container for all the Helpers
var helpers = {}

// Create a SHS256 handlers
helpers.hash = str => {
  if(typeof(str) == 'string' && str.length >0) {
    var hash = crypto.createHmac('sha256',config.hashingSecret).update(str).digest('hex');
    return hash;
  }else{
    return false
  }
};

// Parse the buffer to object

helpers.parseJsonToObject = (str) =>{
  try{
    let obj = JSON.parse(str);
    return obj;
  }catch(e){
    return {};
  }
}

// Create a random tokenId

helpers.createRandomString = strLength =>{
  strLength = typeof(strLength) == 'number' && strLength > 0 ?strLength :false;
  if(strLength){
     let possibleCharacters = 'abcdefghijklmnpoqrstuvwxyz0123456789';
     let str = '';

     for(i = 1; i <= strLength; i++){
       // get a random charater from possibleCharacters
      let randomCharacter = possibleCharacters.charAt(Math.floor(Math.random()* possibleCharacters.length));
       // append the random to a str
      str+=randomCharacter;
     }
     return str;
  }else{
    return false;
  }
}


module.exports = helpers;
