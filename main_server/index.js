const server = require('http').createServer();
// const fs=require('fs')
// const https  = require('https');
 
const server_port = 8888
const password = "ghjkjhgt7y8uijk"

// const server = https.createServer({
//     key: fs.readFileSync('privkey.pem'),
//     cert: fs.readFileSync('cert.pem')
// }]);

const io = require('socket.io')(server);
server.listen(server_port)
console.log(`Server started. Port ${server_port}`)
const history = {}
const online = {}
const history_length=30

io.on('connection', client => {
    client.on('disconnect', () => { console.log('client disconnected') });
    client.on('connect_server', (data) => {
        if (data[0] === password) {
            console.log("server connected")
            if(history[data[1]]===undefined&&online[data[1]]===undefined){
                history[data[1]]={cpu_usage:[],memory_usage:[],avg_load:[]}
                online[data[1]]=true
            }
            io.emit('initial_history_data',{online,history})
            client.join('servers')
        }
    });
    client.on('connect_client', () => { 
        client.emit('initial_history_data',{online,history})
        client.join('clients')
     });

    client.on('data_from_server', (data) => {
        if (data.password === password) {
            console.log(data)
            const server_name=data.server_name
            online[server_name]=true
            if(history[server_name].cpu_usage.length===history_length){
                history[server_name].cpu_usage.shift()
            }
            if(history[server_name].memory_usage.length===history_length){
                history[server_name].memory_usage.shift()
            }
            history[server_name].avg_load[0]=data.measurements[0]
            history[server_name].avg_load[1]=data.measurements[1]
            history[server_name].avg_load[2]=data.measurements[2]
            history[server_name].memory_usage.push(data.measurements[3])
            history[server_name].cpu_usage.push(data.measurements[4])
            const update={server_name:server_name,data:data.measurements}
            io.to("clients").emit('update_history_data', update);
        }
    });

})

function request_data() {
    for(let server_name in online){
        if(online[server_name]===false){
            io.to("clients").emit("offline",server_name)
        }
    }
    io.to("servers").emit('get_data', password);
    for(let server_name in online){
        online[server_name]=false
    }
}

setInterval(request_data, 1000 * 10) //every minute
