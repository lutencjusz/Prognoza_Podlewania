const { Client, logger } = require("camunda-external-task-client-js");
const { Variables } = require("camunda-external-task-client-js");

const config = { baseUrl: "http://localhost:8080/engine-rest", use: logger, asyncResponseTimeout:10000};
const client = new Client(config);
console.log('Jest ok')

function zaokragl(n, k)
{
    const factor = Math.pow(10, k);
    return Math.round(n*factor)/factor;
}

client.subscribe("czyTemperatura", async function({ task, taskService }) { // nazwa musi być taka jak w aktywności pole Topic
    const zmiennaJSON = task.variables.getAllTyped();
    tablica = [];
    alert = [];
    this.tablica = zmiennaJSON['danePogodowe']['value']['list'];
    const parametry = zmiennaJSON['parametry']['value'];
    const min = parametry['temp_min'];
    const max = parametry['temp_max'];

    this.tablica.forEach(element => {
        let t = zaokragl(element['main']['temp'] - 272.15, 2); // wyciąganie temperatury z JSON
        console.log('Data: ' + element['dt_txt'] + ' temp: ' + t);
        if (t > max) {
            alert.push({
                naglowek:"Zbyt wysoka temperatura!", 
                opis:"Temperatura (" + t + ") > Max(" + max,
                status:false, 
                klucz:"t1",
                data: element['dt_txt']
            });
        } 
        if (t < min) {
            alert.push({
                naglowek:"Zbyt niska temperatura!", 
                opis:"Temperatura (" + t + ") < Min(" + min,
                status:false, 
                klucz:"t2",
                data: element['dt_txt']
            });
        }
    });
    // console.log(this.tablica[0]['dt_txt']);
    const dP = new Variables();
    dP.set("alert", JSON.stringify(alert));
    await taskService.complete(task, dP);
    console.log(logger.success("Komunikat z utworzJSON poszedł!"));
});