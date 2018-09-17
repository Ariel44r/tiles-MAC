select *, count(*) from pathTiles group by file_name, level_zoom, dir_1 having count(*) > 1;
update pathTiles set repeat_flag=1 where (file_name='112' and level_zoom='8' and dir_1='56') or (file_name='113' and level_zoom='8' and dir_1='56');
select * from pathTiles where repeat_flag=1;
update pathTiles set repeat_flag=0 where repeat_flag=1;
554823

// As of v8 5.0.71.32, the combination of rest param, template string
// and .apply(null, args) benchmarks consistently faster than using
// the spread operator when calling util.format.
Console.prototype.log = function log(...args) {
  write(this._ignoreErrors,
        this._stdout,
        util.format.apply(null, args),
        this._stdoutErrorHandler,
        this[kGroupIndent]);
};


update pathTilesLevel16 set repeat_flag =  cast(dir_1 as text) || cast(file_name as text) 
select * from pathTilesLevel16 as TT where TT.repeat_flag not in (select T.repeat_flag from pathTilesLevel16 as T inner join pathTilesRepeatLevel16 as R on T.dir_1 = R.dir_1 and T.file_name = R.file_name )
select *, rowid from (select * from pathTilesLevel16 as TT where TT.repeat_flag not in (select T.repeat_flag from pathTilesLevel16 as T inner join pathTilesRepeatLevel16 as R on T.dir_1 = R.dir_1 and T.file_name = R.file_name )) where cuadrant='11020545_1_2'




update ${utils.table} set repeat_flag =  cast(dir_1 as text) || cast(file_name as text) 
select * from ${utils.table} as TT where TT.repeat_flag not in (select T.repeat_flag from ${utils.table} as T inner join ${utils.tableInsert} as R on T.dir_1 = R.dir_1 and T.file_name = R.file_name )