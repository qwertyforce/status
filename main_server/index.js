const server = require('http').createServer();
const io = require('socket.io')(server);
const servers = ["qef"]
const history = {}
const online = {}
const history_length=30
for (let server of servers) {
    history[server] = []
    online[server]=true
}
const server_port = 8888
const password = "ghjkjhgt7y8uijk"

io.on('connection', client => {
    client.on('disconnect', () => { console.log('client disconnected') });
    client.on('connect_server', (pass) => {
        if (pass === password) {
            client.join('servers')
        }
    });
    client.on('connect_client', () => { 
        client.emit('initial_history_data',history)
        client.join('clients')
     });

    client.on('data_from_server', (data) => {
        if (data.password === password) {
            console.log(data)
            const server_name=data.server_name
            online[server_name]=true
            if(history[server_name].length===history_length){
                history[server_name].shift()
            }
            history[server_name].push(data.measurements)
            const update={server_name:server_name,data:history[server_name][history[server_name].length-1]}
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
server.listen(server_port)
console.log(`Server started. Port ${server_port}`)