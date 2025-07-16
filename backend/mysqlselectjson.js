var mysql = require('mysql');
var con = mysql.createConnection({
   host: "localhost",
   user: "root",
   password: "",
   database: "mydb"
});

var qry =`SELECT name, salary, salary*0.05 as tax FROM employee;`;
con.connect(function (err) {
   if (err) throw err;
   console.log("Connected!");
   con.query(qry, function (err, results) {
      if (err) throw err;
      console.log(JSON.stringify(results));
   });
   con.end();
});