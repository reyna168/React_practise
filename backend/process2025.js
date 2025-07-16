// const pid = process.pid;
// console.log(`Process ID: ${pid}`); 
// process.on('SIGHUP', () => console.log('Received: SIGHUP')); 
// process.on('SIGINT', () => console.log('Received: SIGINT')); 
// setTimeout(() => {}, 100000); // keep process alive 
// setTimeout((function() { 
//    return process.kill(pid, 'SIGINT'); //after 5 sec
// }), 5000);


const processEnvKeys = Object.keys(process.env);

processEnvKeys.forEach((key) => {
   console.log(`${key}: ${process.env[key]}`);
});


