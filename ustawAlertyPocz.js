const { Client, logger } = require("camunda-external-task-client-js");
const { Variables } = require("camunda-external-task-client-js");
const plik = require("fs");

const config = { baseUrl: "http://localhost:8080/engine-rest", use: logger, asyncResponseTimeout:10000};
const client = new Client(config);
console.log('Jest ok')

client.subscribe("ustawAlertyPocz", async function({ task, taskService }) { // nazwa musi być taka jak w aktywności pole Topic
    const zmiennaJSON = task.variables.getAllTyped();
    alert = [];
    tablica = [];
    this.tablica = zmiennaJSON['danePogodowe']['value']['list'];
    if (this.tablica == null){
        console.log("Błąd otwierania danych pogodowych");
        await taskService.handleBpmnError(task, "bladODP");
        return;  
    }
    this.tablica.forEach(element => {
        alert.push({
            naglowek:"", 
            opis:"",
            status:true, 
            klucz:"",
            data: element['dt_txt']
        });  
    });

    const dP = new Variables();
    dP.set("alert", alert);
    await taskService.complete(task, dP);
    console.log(logger.success("Komunikat z ustawAlertyPocz poszedł!"));
});