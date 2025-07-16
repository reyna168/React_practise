var mysql = require('mysql');
var con = mysql.createConnection({
   host: "localhost",
   user: "root",
   password: "",
   database: "mydb"
});

var qry =`
   UPDATE employees
      INNER JOIN
   merits ON employees.performance = merits.performance 
SET 
   salary = salary + salary * percentage;
   `;
con.connect(function (err) {
   if (err) throw err;
   console.log("Connected!");

   con.query(qry, nm, function(err) {
      if (err) throw err;
      con.query(qry,nm, function (err, results) {
         if (err) throw err;
         console.log(results);
      });
   });
});