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

client.subscribe("czyWilgotnosc", async function({ task, taskService }) { // nazwa musi być taka jak w aktywności pole Topic
    const zmiennaJSON = task.variables.getAllTyped();
    danePogodowe = [];
    alert = [];
    this.danePogodowe = zmiennaJSON['danePogodowe']['value']['list']; // pobiera tablice zmiennych pogodowych
    this.alert = JSON.parse(zmiennaJSON['alert']['value']); 
    // pobiera tablice alertów, potrzebny parse bo było stringify
    if (this.danePogodowe == null){ // błąd bladODP, gdy brak danych pogodowych 
        console.log("Błąd otwierania danych pogodowych");
        await taskService.handleBpmnError(task, "bladODP");
        return;   
    }
    const parametry = zmiennaJSON['parametry']['value'];
    if (parametry == null){ // błąd bladODP, gdy brak parametrów
        console.log("Błąd otwierania parametrów");
        await taskService.handleBpmnError(task, "bladODP");
        return;   
    }
    const min = parametry['temp_min'];
    const max = parametry['temp_max'];

    this.danePogodowe.forEach((element, i) => {
        let t = zaokragl(element['main']['temp'] - 272.15, 2); // wyciąganie temperatury C z JSON
        console.log('Data: ' + element['dt_txt'] + ' temp: ' + t);
        if (t > max) {
            this.alert[i].naglowek = "Zbyt wysoka temperatura!";
            this.alert[i].opis = this.alert[i].opis + "Temperatura (" + t + ") > Max(" + max + ")";
            this.alert[i].status = false;
            this.alert[i].klucz = this.alert[i].klucz + "t1";
            this.alert[i].data = element['dt_txt'];
        } else if (t < min) {
            this.alert[i].naglowek = "Zbyt niska temperatura!";
            this.alert[i].opis = this.alert[i].opis + "Temperatura (" + t + ") < Min(" + min + ")";
            this.alert[i].status = false;
            this.alert[i].klucz = this.alert[i].klucz + "t2";
            this.alert[i].data = element['dt_txt'];
        }
    });
    // console.log(this.tablica[0]['dt_txt']);
    const dP = new Variables();
    dP.set("alert", JSON.stringify(this.alert));
    await taskService.complete(task, dP);
    console.log(logger.success("Komunikat z czyWilgotnosc poszedł!"));
});