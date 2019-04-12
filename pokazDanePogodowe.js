const { Client, logger } = require("camunda-external-task-client-js");
const { Variables } = require("camunda-external-task-client-js");

const config = { baseUrl: "http://localhost:8080/engine-rest", use: logger, asyncResponseTimeout:10000};
const client = new Client(config);
console.log('Jest ok')

client.subscribe("pokazDanePogodowe", async function({ task, taskService }) { // nazwa musi być taka jak w aktywności pole Topic
    const zmiennaJSON = task.variables.getAllTyped();
    tablica = [];
    this.tablica = zmiennaJSON['danePogodowe']['value']['list']

    this.tablica.forEach(element => {
         let t = element['main']['temp'] - 272.15; // wyciąganie temperatury z JSON
         console.log('Data: ' + element['dt_txt'] + ' temp: ' + t);

    });
    console.log("Koniec danych pogodowych");

    await taskService.complete(task);
    console.log(logger.success("Komunikat z utworzJSON poszedł!"));
});