const { Client, logger } = require("camunda-external-task-client-js");
const { Variables } = require("camunda-external-task-client-js");
const plik = require("fs");

const config = { baseUrl: "http://localhost:8080/engine-rest", use: logger, asyncResponseTimeout:10000};
const client = new Client(config);
console.log('Jest ok')

client.subscribe("pobierzKalendarz", async function({ task, taskService }) { // nazwa musi być taka jak w aktywności pole Topic

    const zmiennaJSON = new Variables();

    obj = JSON.parse(plik.readFileSync('kalendarz.json', 'utf8'));

    zmiennaJSON.set("kalendarz", obj);
    console.log(zmiennaJSON.getAll());

    await taskService.complete(task, zmiennaJSON);
    console.log(logger.success("Komunikat z pobierzKalendarz poszedł!"));
});