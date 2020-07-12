const io = require('socket.io-client');
const os = require('os-utils'); //https://github.com/oscmejia/os-utils
const socket = io.connect("ws://localhost:8888");
// const socket = io.connect("wss://localhost", {rejectUnauthorized: false});
const password = "ghjkjhgt7y8uijk"
const server_name="qefef2"
console.log(os.loadavg(1),
os.loadavg(5),
os.loadavg(15))
 
socket.on('connect', function(){
    console.log("connected")
    socket.emit('connect_server',[password,server_name]);
});
socket.on('get_data', function(pass){
    if(pass===password){
        os.cpuUsage( function(cpu_usage) {
            socket.emit('data_from_server',{server_name:server_name,measurements:[os.loadavg(1),os.loadavg(5),os.loadavg(15),{memory:1-os.freememPercentage()},{cpu:cpu_usage}],password:password});
        } )  
    }
});
