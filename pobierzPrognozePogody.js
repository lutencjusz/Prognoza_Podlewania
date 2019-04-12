const https = require('https');
const { Client, logger } = require("camunda-external-task-client-js");
const { Variables } = require("camunda-external-task-client-js");

const config = { baseUrl: "http://localhost:8080/engine-rest", use: logger, asyncResponseTimeout:10000};
const client = new Client(config);

console.log('Jest ok')
// aktualny zapis - https://api.openweathermap.org/data/2.5/weather?q=Warsaw,pl&APPID=6e4f748efd51cdf7bdc15e6c9710fda8
// prognoza - https://api.openweathermap.org/data/2.5/forecast?q=Warsaw,pl&APPID=6e4f748efd51cdf7bdc15e6c9710fda8
https.get('https://api.openweathermap.org/data/2.5/forecast?q=Warsaw,pl&APPID=6e4f748efd51cdf7bdc15e6c9710fda8', (resp) => {
  let data = '';

  resp.on('data', (chunk) => {
    data += chunk;
  });

  resp.on('end', () => {
    console.log("Pobrał dane")
    client.subscribe("pobierzPrognozePogody", async function({ task, taskService }) { // nazwa musi być taka jak w aktywności pole Topic
      const dP = new Variables();
      dP.set("danePogodowe", JSON.parse(data));
      //dP.set("dataPobrania", { Data: new Date()});
      console.log(dP.getAll());

      await taskService.complete(task, dP);
      console.log(logger.success("Komunikat z utworzJSON poszedł!"));
    });
  });

}).on("error", (err) => {
  console.log("Error: " + err.message);
});


