# Prognoza_Podlewania
prediction of watering plant based on Camunda and node.js

Project wymaga silnika BPNM Camunda i środowiska node.js w którym są napisane mikroserwisy. 
W celu połaczenia Camunda z node.js wykorzystywana jest biblioteka [camunda-external-task-client-js](https://github.com/camunda/camunda-external-task-client-js)

# Struktura mikroserviców
Wszystkie microserwisy są w katalogu głównym, ich nazwy są bezpośrednio powiązane z czynnosciami na diagramach BPMN:

```
...
const { Client, logger } = require("camunda-external-task-client-js");
const { Variables } = require("camunda-external-task-client-js");
const config = { baseUrl: "http://localhost:8080/engine-rest", use: logger, asyncResponseTimeout:10000};
const client = new Client(config);
...
https.get('https://api.openweathermap.org/data/2.5/forecast?q=Warsaw,pl&APPID=6e4f748efd51cdf7bdc15e6c9710fda8', (resp) => {
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
