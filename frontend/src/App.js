import React from 'react';
import './App.css';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';

import socket_io_client from "socket.io-client";
const ENDPOINT = "http://localhost:8888";



function App() {
  const history_length = 30
  const [servers_data, setServersData] = React.useState(0);
  const [online, setOnline] = React.useState({});
  function setOnline_wrapper(server_name, value) {
    setOnline((online) => {
      online[server_name] = value
      return JSON.parse(JSON.stringify(online))
    })
  }
  React.useEffect(() => {
    const socket = socket_io_client(ENDPOINT);
    socket.emit("connect_client")
    socket.on("initial_history_data", data => {
      console.log(data)
      setServersData(data.history);
      setOnline(data.online)
    });
    socket.on("update_history_data", update_data => {
      console.log(update_data)
      const server_name = update_data.server_name
      setServersData((servers_data) => {
        if (servers_data[server_name]) {
          setOnline_wrapper(server_name, true)
          if (servers_data[server_name].cpu_usage.length === history_length) {
            servers_data[server_name].cpu_usage.shift()
          }
          if (servers_data[server_name].memory_usage.length === history_length) {
            servers_data[server_name].memory_usage.shift()
          }
          servers_data[server_name].avg_load[0] = update_data.data[0]
          servers_data[server_name].avg_load[1] = update_data.data[1]
          servers_data[server_name].avg_load[2] = update_data.data[2]
          servers_data[server_name].memory_usage.push(update_data.data[3])
          servers_data[server_name].cpu_usage.push(update_data.data[4])
          return JSON.parse(JSON.stringify(servers_data))
        }
        return servers_data
      })

    });
    socket.on("offline", server_name => {
      setOnline_wrapper(server_name, false)
    })
  }, []);

  let components = Object.keys(servers_data).map((el) => {
    return (<ServerComponent key={el} name={el}
      online={online[el]} cpu_usage={servers_data[el].cpu_usage}
      memory_usage={servers_data[el].memory_usage} avg_load={servers_data[el].avg_load} />)
  })

  return (
    <div className="App">
      {servers_data !== 0 ?
        (components)
        : null}
    </div>
  );
}

function ServerComponent(props) {
  return (
    <div>
      <h2>Server {props.name}: {props.online ? "Online" : "Offline"}</h2>
      <h3>CPU usage: {props.cpu_usage[props.cpu_usage.length - 1]?.cpu.toFixed(4)}</h3>
      <h3>Memory usage: {props.memory_usage[props.memory_usage.length - 1]?.memory.toFixed(4)}</h3>
      <h3>avg load (1,5,15): {props.avg_load[0]?.toFixed(4)} {props.avg_load[1]?.toFixed(4)} {props.avg_load[2]?.toFixed(4)}</h3>
      <LineChart width={300} height={200} data={props.cpu_usage}
      >
        <XAxis />
        <YAxis />
        <CartesianGrid strokeDasharray="3 3" />
        <Tooltip />
        <Legend />
        <Line type="monotone" dataKey="cpu" dot={false} stroke="#82ca9d" />
      </LineChart>
      <LineChart width={300} height={200} data={props.memory_usage}
      >
        <XAxis />
        <YAxis />
        <CartesianGrid strokeDasharray="3 3" />
        <Tooltip />
        <Legend />
        <Line type="monotone" dataKey="memory" dot={false} stroke="#00f7ff" />
      </LineChart>
    </div>
  )
}
export default App;
