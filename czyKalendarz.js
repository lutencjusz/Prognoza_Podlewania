const { Client, logger } = require("camunda-external-task-client-js");
const { Variables } = require("camunda-external-task-client-js");
const moment = require("moment");

const config = { baseUrl: "http://localhost:8080/engine-rest", use: logger, asyncResponseTimeout:10000};
const client = new Client(config);
console.log('Jest ok')

function kalendarzMinuty(s) {
    return moment(s, "HH:mm").minutes();
}

function kalendarzGodziny(s) {
    return moment(s, "HH:mm").hours();
}

client.subscribe("czyKalendarz", async function({ task, taskService }) { // nazwa musi być taka jak w aktywności pole Topic
    const zmiennaJSON = task.variables.getAllTyped();
    danePogodowe = [];
    alert = [];
    kalendarz =[];
    this.danePogodowe = zmiennaJSON['danePogodowe']['value']['list']; // pobiera tablice surowych zmiennych pogodowych
    this.alert = zmiennaJSON['alert']['value'];  // pobiera tablice alertów
    const parametry = zmiennaJSON['parametry']['value']; // pobiera parametry
    this.kalendarz = zmiennaJSON['kalendarz']['value']; // pobierz kalendarz

    if (this.danePogodowe == null){ // błąd bladODP, gdy brak danych pogodowych 
        console.log("Błąd otwierania danych pogodowych");
        await taskService.handleBpmnError(task, "bladODP");
        return;   
    }
    const licznikDni = moment(this.danePogodowe[this.danePogodowe.length-1].dt_txt).diff(new Date(), 'days');
    for (var j = 0; j <= licznikDni + 1; j++){
        this.kalendarz.forEach(k => {
            dKpocz = moment(new Date().toLocaleDateString(),"YYYY-MM-DD").add(j,'days').add(kalendarzGodziny(k),'hours').add(kalendarzMinuty(k),'minutes');
            dKkon = moment(dKpocz).add(parametry['mozliwyCzasNaPodlewanie'],'hours');
            this.danePogodowe.forEach((element, i) => {
                if (moment(element['dt_txt']).isBetween(dKpocz, dKkon, null, '[]')) {
                    this.alert[i].poraPodlewania = true; 
                }
            });
        });
    };

    // console.log(this.tablica[0]['dt_txt']);
    const dP = new Variables();
    dP.set("alert", this.alert);
    await taskService.complete(task, dP);
    console.log(logger.success("Komunikat z czyKalendarz poszedł!"))
});