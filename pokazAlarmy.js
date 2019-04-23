const { Client, logger } = require("camunda-external-task-client-js");
const fs = require("fs");
const express = require('express')
const bodyParser = require("body-parser");
const cors = require('cors'); // trzeba zainstalować pakiet, żeby POST działało z angularem
const app = express()
const port = 3000

const config = { baseUrl: "http://localhost:8080/engine-rest", use: logger, asyncResponseTimeout:10000};
const client = new Client(config);
console.log('Jest ok')

app.use(cors()); // użycie dla wszystkich funkcji w express
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

client.subscribe("pokazAlarmy", async function({ task, taskService }) { // nazwa musi być taka jak w aktywności pole Topic
    const zmiennaJSON = task.variables.getAllTyped();
    alert = [];
    this.alert = zmiennaJSON['alert']['value'];
    if (this.alert == null){ // błąd bladODP, gdy brak danych pogodowych 
        console.log("Błąd otwierania alertów");
        await taskService.handleBpmnError(task, "bladPlik");
        return;   
    } else {
        fs.writeFileSync("alarmy.json", JSON.stringify(this.alert, null, 2), function(err) {
            if(err) {
                return console.log(err);
            }
            console.log("alarmy.json zostały zapisane!");
        }); 
        await taskService.complete(task);
        console.log(logger.success("pokazAlarmy został zakończony!"));
    }
});

fs.access('alarmy.json', fs.F_OK, (err) => { // sprawdzenie, czy plik istnieje
    if (err) {
      console.log ('pokazAlarmy: coś poszło nie tak z otwieraniem pliku alarmy.json');
      console.error(err)
      return
    }
    try{
        app.get('/', (request, res) => {
            fs.readFile('alarmy.json', function(err, data) {
                res.type('application/json'); // ustawienie nagłówka
                res.setHeader('Access-Control-Allow-Origin', '*');
                // ustawienie nagłówka niezbędne do RESTFul
                res.send(data);
                console.log("Przekazałem plik alarmy.json!");
            });
        })
    } catch (e) {
        console.log("Błąd otwierania alertów");
        console.error(e);    
    }
})

fs.access('parametry.json', fs.F_OK, (err) => { // sprawdzenie, czy plik istnieje
    if (err) {
          console.log ('pokazAlarmy: coś poszło nie tak z otwieraniem pliku parametry.json');
          console.error(err)
          return
    }

    try{
        app.get('/parametry/', (request, res) => {
            fs.readFile('parametry.json', function(err, data) {
                res.type('application/json'); // ustawienie nagłówka
                res.setHeader('Access-Control-Allow-Origin', '*');
                // ustawienie nagłówka niezbędne do RESTFul
                res.send(data);
                console.log("Przekazałem plik parametry.json!");
            });
        })
    } catch (e) {
        console.log("Błąd otwierania alertów");
        console.error(e);
    }

})

app.post('/zmianaParametrow', (request, res) => {
    console.log ('przyszła zmiana parametrów');
    try {
        fs.writeFileSync("test.json", JSON.stringify(request.body, null, 2));
    } catch(err) {
        return console.error(err);
    }
    console.log("test.json został zapisany!");
    res.end('{"status": "OK"}');
});

app.post('/zmianaKalendarza', (request, res) => {
    console.log ('przyszła zmiana kalendarza');
    try {
        fs.writeFileSync("testK.json", JSON.stringify(request.body, null, 2));
    } catch(err) {
        return console.error(err);
    }
    console.log("testK.json został zapisany!");
    res.end('{"status": "OK"}');
})

app.listen(port, (err) => {
    if (err) {
      return console.log('serwer RESTFul został zatrzymany', err)
    }
    
    console.log(`serwer jest uruchomiony na porcie ${port}`)
})
