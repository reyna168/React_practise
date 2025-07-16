const fs = require('fs');


// Open a file for writing
const fd = fs.open('input.txt', 'w', (err, fd) => {
   if (err) {
      console.log(err);
      return;
   }

   // Write some data to the file
   var data = `Tutorials Point is giving self learning content
   to teach the world in simple and easy way!!!!!
   `;

   fs.write(fd, data, (err) => {
      if (err) {
         console.log(err);
         return;
      }

      // Close the file
      fs.close(fd, (err) => {
         if (err) {
            console.log(err);
            return;
         }

         console.log('The file was written successfully!');
      });
   });
});
