const fs = require('fs'),
      path = require('./path.js'),
      sqlite = require('./sqlite.js'),
      rl = require('./readLine.js');

function readPathDir(pathToRead,callback){
  fs.readdir(pathToRead, (err, files) => {
    if (files != null){
      callback(files);
    } else {
      console.log(err);
      rl.prompt();
    }
  });
}

exports.readDir = function(pathDir) {
  var ObjectCounter = 0;
  var jsonArray = [];
  path.mainPath(pathDir);//root_dir
  var lotes = readPathDirSync(pathDir);
  for(var i=0;i<lotes.length;i++){
    var pathToLote = pathDir + '/' + lotes[i];//lote
    if((fs.lstatSync(pathToLote).isDirectory()) && (lotes[i].charAt(0) != '.')){
      var cuadrants = readPathDirSync(pathToLote);
      for(var j=0; j<cuadrants.length;j++){
        var pathToCuadrant = pathToLote + '/' + cuadrants[j];//cuadrant
        if((fs.lstatSync(pathToCuadrant).isDirectory()) && (cuadrants[j].charAt(0) != '.')){
          var levels_zoom = readPathDirSync(pathToCuadrant);
          for(var k=0;k<levels_zoom.length;k++){
            var pathToLevel_Zoom = pathToCuadrant + '/' + levels_zoom[k];//level_zoom
            if((fs.lstatSync(pathToLevel_Zoom).isDirectory()) && (levels_zoom[k].charAt(0) != '.')){
              var dirs_1 = readPathDirSync(pathToLevel_Zoom);
              for(var l=0;l<dirs_1.length;l++){
                var pathToDir_1 = pathToLevel_Zoom + '/' + dirs_1[l];//dir_1
                if((fs.lstatSync(pathToLevel_Zoom).isDirectory()) && (dirs_1[l].charAt(0) != '.')){
                  var pngs = readPathDirSync(pathToDir_1);
                  for(var m=0;m<pngs.length;m++){
                    const fullPathObj = {
                      root_dir: pathDir,
                      lote: path.basename(pathToLote),
                      cuadrant: path.basename(pathToCuadrant),
                      level_zoom: path.basename(pathToLevel_Zoom),
                      dir_1: path.basename(pathToDir_1),
                      file_name: pngs[m].replace('.png',''),
                      repeat: 0,
                      repeat_flag: 0
                    }
                    //call SQLite method
                    if(ObjectCounter < 150000){
                      jsonArray.push(fullPathObj);
                      ObjectCounter++;
                    } else{
                      jsonArray.push(fullPathObj);
                      sqlite.insertRecord(jsonArray, 'pathTiles');
                      console.log(ObjectCounter);
                      console.log(jsonArray.length);
                      ObjectCounter = 0;
                      jsonArray = [];
                    }
                  }
                } 
              }
            }
          }
        }
      }
    }
  }
  sqlite.insertRecord(jsonArray, 'pathTiles');
  console.log('Array: ' + jsonArray.length);
}

function readPathDirSync(pathToRead){
  const files = fs.readdirSync(pathToRead);
  return files;
}
  