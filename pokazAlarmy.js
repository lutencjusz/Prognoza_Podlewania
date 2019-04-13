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

plik.access('alarmy.json', plik.F_OK, (err) => { // sprawdzenie, czy plik istnieje
    if (err) {
      console.log ('pokazAlarmy: coś poszło nie tak z otwieraniem pliku alarmy.json');
      console.error(err)
      return
    }
    app.get('/', (request, res) => {
        plik.readFile('alarmy.json', function(err, data) {
            res.type('application/json'); // ustawienie nagłówka
            res.setHeader('Access-Control-Allow-Origin', '*');
            // ustawienie nagłówka niezbędne do RESTFul
            res.send(data);
            console.log("Przekazałem plik alarmy.json!");
        });
    })
      
    app.listen(port, (err) => {
      if (err) {
        return console.log('serwer RESTFul został zatrzymany', err)
      }
      
      console.log(`serwer jest uruchomiony na porcie ${port}`)
    })

})

