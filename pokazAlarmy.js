const { Client, logger } = require("camunda-external-task-client-js");
const fs = require("fs");
const express = require('express')
const bodyParser = require("body-parser");
const cors = require('cors'); // trzeba zainstalować pakiet, żeby POST działało z angularem
const app = express()
const port = 3000
const http = require('http');
const querystring = require('querystring');

const config = { baseUrl: "http://localhost:8080/engine-rest", use: logger, asyncResponseTimeout:10000};
const client = new Client(config);
console.log('Jest ok')

app.use(cors()); // użycie dla wszystkich funkcji w express
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

fs.readFile('ustawieniaZ.json', function(err, data) {
    ip = JSON.parse(data).ip;
    console.log("Pobrałem IP: %s", ip);
});

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

function PostCode(p, codestring) {
  // Build the post string from an object
  // var post_data = querystring.stringify(codestring);
  var post_data = codestring;

  // An object of options to indicate where to post to
  var post_options = {
      // host: '192.168.0.15',
      // host: '192.168.43.176',
      host: ip,
      port: '80',
      path: p,
      method: 'POST',
      headers: {
          'Content-Type': 'application/json',
          'Content-Length': Buffer.byteLength(post_data)
      }
  };

  // Set up the request
  var post_req = http.request(post_options, function(res) {
      res.setEncoding('utf8');
      res.on('data', function (chunk) {
          console.log('Response: ' + chunk);
      });
  });

  // post the data
  post_req.write(post_data);
  post_req.end();

}

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
        console.log("Błąd otwierania parametrow");
        console.error(e);
    }

})

app.post('/zmianaUstawienia', (request, res) => {
    console.log ('przyszła zmiana ustawienia');
    try {
        fs.writeFileSync("ustawieniaZ.json", '{\n"ip":' + JSON.stringify(request.body.ip, null, 2)+'\n}');
    } catch(err) {
        return console.error(err);
    }
    res.end('{"status": "OK"}');
    PostCode('/zapiszUstawieniaZ', JSON.stringify(request.body, null, 2));
});

app.post('/zmianaParametrow', (request, res) => {
    console.log ('przyszła zmiana parametrów');
    try {
        fs.writeFileSync("parametry.json", JSON.stringify(request.body, null, 2));
    } catch(err) {
        return console.error(err);
    }
    console.log("parametry.json został zapisany!");
    res.end('{"status": "OK"}');
    PostCode('/zapiszParametryCz', JSON.stringify(request.body, null, 2));
});

app.post('/zmianaKalendarza', (request, res) => {
    console.log ('przyszła zmiana kalendarza');
    try {
        fs.writeFileSync("kalendarz.json", JSON.stringify(request.body, null, 2));
    } catch(err) {
        return console.error(err);
    }
    console.log("kalendarz.json został zapisany!");
    res.end('{"status": "OK"}');
    PostCode('/zapiszKalendarz', JSON.stringify(request.body, null, 2));
})

app.post('/zmianaKomentarze', (request, res) => {
    console.log ('przyszła zmiana komentarzy');
    try {
        fs.writeFileSync("komentarze.json", JSON.stringify(request.body, null, 2));
    } catch(err) {
        return console.error(err);
    }
    console.log("komentarze.json został zapisany!");
    res.end('{"status": "OK"}');
    PostCode('/zapiszKomentarze', JSON.stringify(request.body, null, 2));
})

app.listen(port, (err) => {
    if (err) {
      return console.log('serwer RESTFul został zatrzymany', err)
    }
    
    console.log(`serwer jest uruchomiony na porcie ${port}`)
})
