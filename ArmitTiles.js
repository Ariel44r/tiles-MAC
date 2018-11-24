const readLine = require('readline'),
      pathVar = require('./path.js'),
      readDir = require('./readDir.js'),
      overlay = require('./overlay.js'),
      sqlite = require('./sqlite.js'),
      path = require('./path.js'),
      fs = require('fs'),
      utils = require('./Utils.js'),
      rl = readLine.createInterface({
        input: process.stdin,
        output: process.stdout,
        prompt: 'ArmitMerge > '
      });

var mainCounter = 0;
var sqlRepeat = [];

sqlite.createDBandTable();

rl.on('line', (line) => {
    switch (line.trim()) {
      case 'path':
        pathF();
        break;
      
      case 'migrate':
        migrateLevel();
        break;

      case 'groupped paths':
        getGrouppedPaths()
        break;

      case 'merge':
        getRepeatPaths();
        break;

      case 'onlyone':
        onlyOneDir();
        break;

      case 'move snippet':
        moveSnippet();
        break;

      case 'clear':
        console.clear();
        break;

      case 'exit':
        console.log('Have a nice Day!');
        process.exit(0);

      default:
        console.log(`Say what? I might have heard '${line.trim()}'`);
        break;

    }
    rl.prompt();
  }).on('close', () => {
    console.log('Have a great day!');
    process.exit(0);

  });


  //PATH
  function pathF() {
    rl.question('Please enter the root directory path: ', (rootPath) => {
      console.clear();
      readDir.readDir(rootPath);
      rl.prompt();

    });
  }

  //MIGRATEDB
  function migrateLevel() {
    const queryMigrate = `select * from pathTiles where level_zoom = ${utils.levelZoom};`
    sqlite.query(queryMigrate, (level16Paths) => {
      insertIntoLevelDB(level16Paths);

    })
  }

  function insertIntoLevelDB(sqlObjectSnippet){
    var maxValue = 150000;
    if(sqlObjectSnippet.length > maxValue){
      var integer = Math.floor(sqlObjectSnippet.length/maxValue);
      for(var h=0; h<integer; h++){
        var sqlRepeatSplit = [];
        for(var i=0;i<maxValue;i++){
          sqlRepeatSplit.push(sqlObjectSnippet[i + h*maxValue]);

        }
        sqlite.insertRecordRepeat(sqlRepeatSplit,utils.table);

      }
      var integeer2 = sqlObjectSnippet.length - integer*maxValue;
      var initVal = sqlObjectSnippet.length - integeer2;
      sqlRepeatSplit = [];
      for(var j=initVal;j<sqlObjectSnippet.length;j++){
        sqlRepeatSplit.push(sqlObjectSnippet[j]);

      }
      sqlite.insertRecordRepeat(sqlRepeatSplit,utils.table);

    } else{
      sqlite.insertRecordRepeat(sqlObjectSnippet,utils.table);

    }
  }

  //GROUPPEDPATHS
  function getGrouppedPaths() {
    var querygrouppedPathsQuery = `select *, count(*) from ${utils.table} group by file_name, level_zoom, dir_1 having count(*) > 1;`;
    sqlite.query(querygrouppedPathsQuery, (grouppedPaths) => {
      lenghtOfRepeatPaths = grouppedPaths.length
      console.log(`${grouppedPaths.length} tiles groupped`);
      getGrouppedPathsRec(grouppedPaths);

    });
  }
  
  function getGrouppedPathsRec(grouppedPathsR) {
    var path = grouppedPathsR[0];
    var pathsOfGroupQuery = `select * from ${utils.table} where level_zoom=${path.level_zoom} and dir_1=${path.dir_1} and file_name=${path.file_name}; `;
    sqlite.query(pathsOfGroupQuery, (pathsOfGroup) => {
      console.log(`\n\n ${pathsOfGroup.length} paths of group, TABLE: ${utils.table}`);
      insertSQLObjectsGroupped(path, pathsOfGroup)
      var index = pathsOfGroup.indexOf(path)
      grouppedPathsR.splice(0,1); 
      console.log(`groupped paths: ${grouppedPathsR.length}`);
      if(grouppedPathsR.length > 0){
        getGrouppedPathsRec(grouppedPathsR);
        index++;
        
      }
    })
  }
  
  function insertSQLObjectsGroupped(grouppedPath, sqlOGrouppedbjects){
    mainCounter++;
    console.log((`MAIN PROGRESS: ${100*mainCounter/lenghtOfRepeatPaths}%`))
    sqlite.randomStringVal((rndmString) =>{
      grouppedPath.repeat = rndmString;
      for(var i=0;i<sqlOGrouppedbjects.length;i++){
        var sqlObjectN = sqlOGrouppedbjects[i]
        if(grouppedPath != sqlObjectN && grouppedPath.level_zoom == sqlOGrouppedbjects[i].level_zoom && grouppedPath.dir_1 == sqlOGrouppedbjects[i].dir_1 && grouppedPath.file_name == sqlOGrouppedbjects[i].file_name){
          sqlOGrouppedbjects[i].repeat = rndmString;
  
          process.stdout.write(`\r progress: ${100*i/sqlOGrouppedbjects.length}%`)
          sqlRepeat.push(sqlOGrouppedbjects[i]);
          console.log(`\rcounter: ${sqlRepeat.length}, randomString: ${rndmString}`)
          console.log(path.getFullPath(sqlObjectN))
          if (i == sqlOGrouppedbjects.length-1) {
            insertSnippetSQLSecondDB(sqlRepeat)
            sqlRepeat = []
  
          }
        } else {
          process.stdout.write(`\rcounterNotChange: ${sqlRepeat.length}, randomString: ${rndmString}`);

        }
      }
    });
  }

  function insertSnippetSQLSecondDB(sqlObjectSnippet){
    var maxValue = 150000;
    if(sqlRepeat.length > maxValue){
      var integer = Math.floor(sqlRepeat.length/maxValue);
      for(var h=0; h<integer; h++){
        var sqlRepeatSplit = [];
        for(var i=0;i<maxValue;i++){
          sqlRepeatSplit.push(sqlRepeat[i + h*maxValue]);
        }
        sqlite.insertRecordRepeat(sqlRepeatSplit,`${utils.tableInsert}`);
      }
      var integeer2 = sqlRepeat.length - integer*maxValue;
      var initVal = sqlRepeat.length - integeer2;
      sqlRepeatSplit = [];
      for(var j=initVal;j<sqlRepeat.length;j++){
        sqlRepeatSplit.push(sqlRepeat[j]);
      }
      sqlite.insertRecordRepeat(sqlRepeatSplit,`${utils.tableInsert}`);
    } else{
      sqlite.insertRecordRepeat(sqlObjectSnippet,`${utils.tableInsert}`);
    }
  }

  //MERGE
  function getRepeatPaths(){
    const queryRepeatPaths = `select *, rowid from ${utils.tableInsert};`;
    sqlite.query(queryRepeatPaths, (rowsRepeat) => {
      sqlObjectsRepeat = rowsRepeat;
      const queryRepeatDistinct = `select distinct repeat from ${utils.tableInsert};`;
      sqlite.query(queryRepeatDistinct, (repeatDistinct) => {
        for(var i=0; i<repeatDistinct.length; i++){
          overlay.overlayRec(getObjectsWithID(repeatDistinct[i]));
          //console.log(`[ Progress: ${100*i/repeatDistinct.length} % ]\n`);
          process.stdout.write(`\r[ Progress: ${100*i/repeatDistinct.length} % ]`);
        }  
      });
      rl.prompt();
    });
  }

  function getObjectsWithID(rowRepeat){
    if(sqlObjectsRepeat.length != 0){
      var repeatItems = [];
      for(var i=0;i<sqlObjectsRepeat.length;i++){
        if(sqlObjectsRepeat[i].repeat == rowRepeat.repeat){
          repeatItems.push(sqlObjectsRepeat[i]);
        }
      }
      return repeatItems;
    }
  }

  //ONLYONEDIRECTORY
  var alreadyExists = [];

function onlyOneDir() {
  var finalPath = utils.finalPath;
  console.log('getting paths OnlyOneDirectory!\n');
  var counterProgress = 0;
  const query = `select *, count(*) from pathTiles group by file_name, level_zoom, dir_1 having count(*) = 1;`;
  //const query = `select *, count(*) from pathTiles group by file_name, level_zoom, dir_1 having count(*) = 1 and level_zoom=13;`
  sqlite.query(query, (objects) => {
    objects.forEach(sqliteObject => {
      counterProgress++;
      if(sqliteObject.cuadrant != ''){
        if(!fs.existsSync(`${finalPath}/${sqliteObject.level_zoom}/${sqliteObject.dir_1}`)){
          fs.mkdirSync(`${finalPath}/${sqliteObject.level_zoom}/${sqliteObject.dir_1}`, 0o777)
        }
        const path_1 = `${path.getFullPath(sqliteObject)}`;
        const path_2 = `${finalPath}/${sqliteObject.level_zoom}/${sqliteObject.dir_1}/${sqliteObject.file_name}.png`;
        var pathArray = [path_1, path_2];
        moveFile(pathArray);
        console.log(`[ progress: ${100*counterProgress/objects.length} % ]`);
      }
    })
    alreadyExists.forEach(element => {
      console.log(`already exists: ${element}`);
    });
    console.log(`already exits: contain ${alreadyExists.length} elements`);
  });
}

function moveFile(pathArray){
  //unlinkFile(pathArray[1]);
  if(fs.existsSync(pathArray[0])){
    if(!fs.existsSync(pathArray[1])){
      fs.renameSync(pathArray[0], pathArray[1]);
      console.log('move file: success! :D');
      console.log(`source: ${pathArray[0]}`);
      console.log(`target: ${pathArray[1]}`);
      //callback(true);
    } else{
      alreadyExists.push(pathArray[1]);
    }
  }
}

function moveSnippet() {
  var finalPath = utils.pathOfPatch;
  console.log('move snippet of tiles!\n');
  var counterProgress = 0;
  const query = `select * from pathTiles where CAST(file_name as int)>=10000;`;
  sqlite.query(query, (objects) => {
    objects.forEach(sqliteObject => {
      counterProgress++;
      if(sqliteObject.cuadrant != ''){
        if(!fs.existsSync(`${finalPath}/${sqliteObject.level_zoom}/${sqliteObject.dir_1}`)){
          fs.mkdirSync(`${finalPath}/${sqliteObject.level_zoom}/${sqliteObject.dir_1}`, 0o777)
        }
        const path_1 = `${path.getFullPath(sqliteObject)}`;
        const path_2 = `${finalPath}/${sqliteObject.level_zoom}/${sqliteObject.dir_1}/${sqliteObject.file_name}.png`;
        var pathArray = [path_1, path_2];
        moveFile(pathArray);
        console.log(`[ progress: ${100*counterProgress/objects.length} % ]`);

      }
    })
  });
<<<<<<< HEAD
}
=======
}
>>>>>>> 3f51cfb901788463b060e281d00612843abc6e01
