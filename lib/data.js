/*
*  A Library for storing and retreiving data
**/

// Dependencies
const fs = require('fs');
const path = require('path');
const helpers  = require('./helpers');


// Container for the module (to be exported)
let lib = {}

// Base directory of the data folder
lib.baseDir = path.join(__dirname,'/../.data/');
// Write data to a file

lib.create = (dir,file,data,callback)=>{
   fs.open(lib.baseDir+dir+'/'+file+'.json','wx',(err,fileDesriptor)=>{
       if(!err && fileDesriptor){
         // Convert data to string
         var stringData = JSON.stringify(data);
         // Write to file and close it

         fs.writeFile(fileDesriptor,stringData,(err)=>{
           if(!err){
             fs.close(fileDesriptor,(err)=>{
               if(!err){
                 callback(false);
               }else{
                 callback('Error Closing the file');
               }
             })
           }else{
             callback('Error Writting to a file');
           }
         })
       }else{
         callback('Could not create a new file, it may already exist');
       }
   });
}

// Read data from a files
lib.read = (dir,file,callback)=>{
  fs.readFile(lib.baseDir+dir+'/'+file+'.json','utf-8',(err,data)=>{
    if(!err && data){
        var parsedData = helpers.parseJsonToObject(data);
        callback(false,parsedData);
    }else{
      callback(err,data);
    }

  });
}

// Update data inside a file

lib.update = (dir,file,data,callback)=>{
  // Open the file for Writting
  fs.open(lib.baseDir+dir+'/'+file+'.json','r+',(err,fileDesriptor)=>{
    if(!err,fileDesriptor){



 // Convert data to string
    var stringData = JSON.stringify(data);
// truncate the files
    fs.truncate(fileDesriptor,(err)=>{

      if(!err){
       // writing to the file and close
       fs.writeFile(fileDesriptor,stringData,(err)=>{
         if(!err){
           fs.close(fileDesriptor,err=>{
             if(!err){
               callback(false);
             }else{
               callback('Error closing the file');
             }
           })
         }else{

         }
       });
      }else{
        callback('Error truncating file')
      }
    });




    }else{
      callback('Could not open a file for updating, it may not exist')
    }
  });
}

// Delete a files
lib.delete = (dir,file,callback)=>{
   // Umlink the files
   fs.unlink(lib.baseDir+dir+'/'+file+'.json',(err)=>{
      if(!err){
        callback(false)
      }else{
        callback('Error deleting the file');
      }
   });
}

// List all the checks created in the checks coillection

lib.listfiles = (dir, callback) =>{
  // Look up for the Files
  fs.readdir(lib.baseDir+dir,(err,list)=>{
    if(!err && list && list.length > 0){
        let trimmeFileNames = [];
        list.forEach(item=>{ trimmeFileNames.push(item.replace('.json',''))})
       callback(false,trimmeFileNames);
     }else{
       callback(err,list);
     }
  });
};
module.exports = lib;
