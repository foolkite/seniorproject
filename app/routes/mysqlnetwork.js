var mysql = require('mysql');
var fs = require('fs');

var connection = mysql.createConnection({
    host     : 'localhost',
    user     : 'root',
    password : '',
    database : 'network'
});


module.exports = function(app){

    app.post('/mysql/network/filebug', function(req, res){
        connection.connect();

        connection.query('SELECT * from filebug', function(err, rows, fields) {
            if(err){
                throw err;
                res.send({'error':err.message});
            }else{
                var data = JSON.stringify(rows);
                fs.writeFile('app/models/filebug.json', data, function(err){
                    if(err){
                        throw err;
                        res.send({'error':err.message});
                    }else{
                        res.send({
                            'success': true,
                            'filebug': rows
                        });
                    }
                })
            }
        });
        if(connection) connection.end();

    });

    app.post('/mysql/wordpress/:table', function(req, res){

        var connection = mysql.createConnection({
            host     : 'localhost',
            user     : 'root',
            password : '',
            database : 'wordpress'
        });
        connection.connect();

        connection.query('SELECT * from '+req.params.table, function(err, rows, fields) {
            if(err){
                throw err;
                res.send({'error':err.message});
            }else{
                var data = JSON.stringify(rows);
                fs.writeFile('app/models/'+req.params.table+'.json', data, function(err){
                    if(err){
                        throw err;
                        res.send({'error':err.message});
                    }else{
                        res.send({
                            'success': true
                        });
                    }
                })
            }
        });
        connection.end();

    });

    app.post('/mysql/network/:table', function(req, res){

        var connection = mysql.createConnection({
            host     : 'localhost',
            user     : 'root',
            password : '',
            database : 'network'
        });
        connection.connect();

        connection.query('SELECT * from '+req.params.table, function(err, rows, fields) {
            if(err){
                throw err;
                res.send({'error':err.message});
            }else{
                var data = JSON.stringify(rows);
                fs.writeFile('app/models/'+req.params.table+'.json', data, function(err){
                    if(err){
                        throw err;
                        res.send({'error':err.message});
                    }else{
                        res.send({
                            'success': true
                        });
                    }
                })
            }
        });
        connection.end();

    });

    app.post('/mysql/read/test', function(req, res){
        fs.readFile('app/models/filebug.json', 'utf-8',function(err, data){
            console.log(JSON.parse(data)[0]);
            res.send({'data':JSON.parse(data)});
        });
    });

    app.get('/graph', function(req, res){
        res.render('graph');
    });


}