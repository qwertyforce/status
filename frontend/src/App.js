import React from 'react';
import logo from './logo.svg';
import './App.css';
import {LineChart,Line, Bar, XAxis, YAxis, CartesianGrid, Tooltip,Legend, ResponsiveContainer} from 'recharts';

import socket_io_client from "socket.io-client";
const ENDPOINT = "http://127.0.0.1:8888";

 
function App() {
  const history_length=30
  const [servers_data, setServersData] = React.useState(0);
 
  
  const [offline, setOffline] = React.useState({});
  React.useEffect(() => {
    const socket = socket_io_client(ENDPOINT);
    socket.emit("connect_client")
    socket.on("initial_history_data", data => {
      console.log(data)
      setServersData(data);
    });
    socket.on("update_history_data", update_data => {
       
      // setServersData({qef:{cpu_usage:[{cpu:1}]}})
      const server_name=update_data.server_name
      setServersData((servers_data)=>{
        console.log(server_name)
        console.log(servers_data[server_name])
        if(servers_data[server_name].cpu_usage.length===history_length){
          servers_data[server_name].cpu_usage.shift()
      }
      if(servers_data[server_name].memory_usage.length===history_length){
        servers_data[server_name].memory_usage.shift()
      }
      servers_data[server_name].avg_load[0]=update_data.data[0]
      servers_data[server_name].avg_load[1]=update_data.data[1]
      servers_data[server_name].avg_load[2]=update_data.data[2]
      servers_data[server_name].memory_usage.push(update_data.data[3])
      servers_data[server_name].cpu_usage.push(update_data.data[4])
        console.log(servers_data)
      
        return JSON.parse(JSON.stringify(servers_data)) 
      })
     
    });
    socket.on("offline", server_name => {
      console.log("offline")
      setOffline((offline)=>{
        offline[server_name]=true
        return offline
      })

    })
  }, []);

  const data = [
    {
      name: 'Page A', uv: 4000
    },
    {
      name: 'Page B', uv: 3000
    },
    {
      name: 'Page C', uv: 2000
    },
    {
      name: 'Page D', uv: 2780
    },
    {
      name: 'Page E', uv: 1890
    },
    {
      name: 'Page F', uv: 2390
    },
    {
      name: 'Page G', uv: 3490
    },
  ];
  console.log(2)
//   function get_last_measurment(server_name){

//   }
// //   const listItems = Object.keys(servers_data).map((server_name) =>
// //   <li key={server_name.toString()}>
// //       <div>
// //          <h2>Server {server_name}</h2>
// // <h3>{(offline[server_name]?"Online":"Offline")}</h3>
// // <h3>CPU usage: {servers_data[server_name]}</h3>
// //          <h3>Memory usage: </h3>
// //          <h3>avg load (5,10,15): </h3>
// //        </div>
// //   </li>
// // );
 
  return (
    <div className="App">
      {servers_data!==0?
        
         (<div>
           <div><h1>Status</h1></div>
         <div>
         <h2>Server 1</h2>
         <h3>Online</h3>
         <h3>CPU usage: </h3>
         <h3>Memory usage: </h3>
         <h3>avg load (5,10,15): </h3>
       </div>
       <div>
         <h2>Server 2</h2>
         <h3>Online</h3>
         <h3>CPU usage: </h3>
         <h3>Memory usage: </h3>
         <h3>avg load (5,10,15): </h3>
       </div>
       <div>
         <h2>Server 3</h2>
         <h3>Online</h3>
         <h3>CPU usage: </h3>
         <h3>Memory usage: </h3>
         <h3>avg load (5,10,15): </h3>
       </div>
         </div>
         )
      :null}
      
   
      {/* <header className="App-header">
        <img src={logo} className="App-logo" alt="logo" />
        <p>
          Edit <code>src/App.js</code> and save to reload.
        </p>
        <a
          className="App-link"
          href="https://reactjs.org"
          target="_blank"
          rel="noopener noreferrer"
        >
          Learn React
        </a>
      </header> */}
     
      <LineChart width={300} height={200} data={servers_data['qef']?.cpu_usage}
            margin={{top: 5, right: 30, left: 20, bottom: 5}}>
       <XAxis/>
       <YAxis />
       <CartesianGrid strokeDasharray="3 3"/>
       <Tooltip/>
       <Legend />
       <Line type="monotone" dataKey="cpu"  stroke="#82ca9d" />
      </LineChart>

      {/* <LineChart width={300} height={200} data={data}
            margin={{top: 5, right: 30, left: 20, bottom: 5}}>
       <XAxis dataKey="name"/>
       <YAxis/>
       <CartesianGrid strokeDasharray="3 3"/>
       <Tooltip/>
       <Legend />
       <Line type="monotone" dataKey="uv" stroke="#82ca9d" />
      </LineChart> */}
    </div>
  );
}

export default App;
