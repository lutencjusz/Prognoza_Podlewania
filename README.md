# Prognoza_Podlewania
prediction of the irrigation system based on Camunda and node.js


The project requires a Camunda BPNM engine and a node.js environment in which micro services are written. To connect Camunda with node.js, the library [camunda-external-task-client-js] (https://github.com/camunda/camunda-external-task-client-js) library is used.

# Structure of micro-services
All micro services are located in the directory Prognoza_Podlewania, their names are directly linked to the activities in the BPMN diagrams:

# Standard interfaces of micro-services
```
...
const { Client, logger } = require("camunda-external-task-client-js");
const { Variables } = require("camunda-external-task-client-js");
const config = { baseUrl: "http://localhost:8080/engine-rest", use: logger, asyncResponseTimeout:10000};
const client = new Client(config);
...
https.get('https://api.openweathermap.org/data/2.5/forecast?q=Warsaw,pl&APPID=<your key>', (resp) => {
...
  resp.on('data', (chunk) => {
    data += chunk;
  });

  resp.on('end', () => {
    ...
    client.subscribe("pobierzPrognozePogody", async function({ task, taskService }) { // nazwa musi być taka jak w aktywności pole Topic
      ... // your code to perform in case of the token from BPMN is arrived  
    });
  });

}).on("error", (err) => {
  console.log("Error: " + err.message);
});
```
