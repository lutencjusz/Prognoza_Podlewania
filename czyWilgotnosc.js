const { Client, logger } = require("camunda-external-task-client-js");
const { Variables } = require("camunda-external-task-client-js");

const config = { baseUrl: "http://localhost:8080/engine-rest", use: logger, asyncResponseTimeout:10000};
const client = new Client(config);
let czyUruchomicK1 = true;
console.log('Jest ok')

client.subscribe("czyWilgotnosc", async function({ task, taskService }) { // nazwa musi być taka jak w aktywności pole Topic
    const zmiennaJSON = task.variables.getAllTyped();
    danePogodowe = [];
    alert = [];
    this.danePogodowe = zmiennaJSON['danePogodowe']['value']['list']; // pobiera tablice zmiennych pogodowych
    this.alert = zmiennaJSON['alert']['value']; 
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
    const max = parametry['humidityMax'];
    const min = parametry['humidityMin'];
    const opt = parametry['humidityOpt'];

    this.danePogodowe.forEach((element, i) => {
        let w = element['main']['humidity']; // wyciąganie wilgotności z JSON
        this.alert[i].wilgotnosc = w;
        console.log('Data: ' + element['dt_txt'] + ' wilgotność: ' + w);
        if (w > max) {
            this.alert[i].naglowek = "Zbyt wysoka wilgotność!";
            this.alert[i].opis = this.alert[i].opis + "Wilgotność (" + w + ") > Max(" + max + ")";
            this.alert[i].status = false;
            this.alert[i].klucz = this.alert[i].klucz + "w1";
            this.alert[i].data = element['dt_txt'];
            this.alert[i].czyUruchomicK1 = false;
        } else if (w < min) {
            this.alert[i].naglowek = "Zbyt niska wilgotność!";
            this.alert[i].opis = this.alert[i].opis + "Wilgotność (" + w + ") < Min(" + min + ")";
            this.alert[i].status = false;
            this.alert[i].klucz = this.alert[i].klucz + "w2";
            this.alert[i].data = element['dt_txt'];
            this.alert[i].czyUruchomicK1 = true;
        } else if (w > opt){
            if (this.alert[i].naglowek == ''){
                this.alert[i].naglowek = "Wilgotność większa od optymalnej!"; 
            }
            this.alert[i].opis = this.alert[i].opis + "Wilgotność (" + w + ") > Opt(" + opt + "). Nie uruchamiam pompki rano!";
            this.alert[i].status = false;
            this.alert[i].klucz = this.alert[i].klucz + "w3";
            this.alert[i].data = element['dt_txt'];
            this.alert[i].czyUruchomicK1 = false;
        }
    });
    // console.log(this.tablica[0]['dt_txt']);
    const dP = new Variables();
    dP.set("alert", this.alert);
    await taskService.complete(task, dP);
    console.log(logger.success("Komunikat z czyWilgotnosc poszedł!"));
});