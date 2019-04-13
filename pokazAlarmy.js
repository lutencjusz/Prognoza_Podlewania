const { Client, logger } = require("camunda-external-task-client-js");
const { Variables } = require("camunda-external-task-client-js");
const plik = require("fs");
const express = require('express')
const app = express()
const port = 3000

const config = { baseUrl: "http://localhost:8080/engine-rest", use: logger, asyncResponseTimeout:10000};
const client = new Client(config);
console.log('Jest ok')

client.subscribe("pokazAlarmy", async function({ task, taskService }) { // nazwa musi być taka jak w aktywności pole Topic
    const zmiennaJSON = task.variables.getAllTyped();
    alert = [];
    this.alert = zmiennaJSON['alert']['value'];
    if (this.alert == null){ // błąd bladODP, gdy brak danych pogodowych 
        console.log("Błąd otwierania alertów");
        await taskService.handleBpmnError(task, "bladPlik");
        return;   
    } else {
        // let t = JSON.stringify(this.alert)
        plik.writeFileSync("alarmy.json", JSON.stringify(this.alert, null, 2), function(err) {
            if(err) {
                return console.log(err);
            }
            console.log("alarmy.json zostały zapisane!");
        }); 
        await taskService.complete(task);
        console.log(logger.success("pokazAlarmy został zakończony!"));
    }
});

// http.createServer(function (req, res) {
//    plik.readFile('alarmy.json', function(err, data) {
//        res.header("Access-Control-Allow-Origin", "*");
//        res.writeHead(200, {'Content-Type': 'application/json'});
//        res.write(data);
 //       res.end();
//        console.log("Przekazałem plik alarmy.json!")
//    });
//}).listen(8079);

app.get('/', (request, res) => {
    plik.readFile('alarmy.json', function(err, data) {
 //       res.header("Access-Control-Allow-Origin", "*");
//        res.writeHead(200, {'Content-Type': 'application/json'});
//        res.write(data);
 //       res.end();
        res.type('application/json');
        res.setHeader('Access-Control-Allow-Origin', '*');      
        res.send(data);
        console.log("Przekazałem plik alarmy.json!");
    });
})
  
app.listen(port, (err) => {
  if (err) {
    return console.log('something bad happened', err)
  }
  
  console.log(`serwer jest uruchomiony na porcie ${port}`)
})