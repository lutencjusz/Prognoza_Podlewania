const moment = require("moment");
moment().utcOffset(2);
console.log(moment('2010-10-20 20:30','YYYY-MM-DD HH:mm')
.isBetween('2010-10-20 20:30', '2010-10-20 21:30', null, '[]')); // ostre oznaczają, że graniczna się mieści

console.log(moment(new Date())
.isBetween('2019-04-17 18:50', '2019-04-17 19:30', null, '[]'));
console.log(moment(new Date()).toJSON());
console.log(moment(new Date()).add(1,'h'));
const d = moment(new Date().toLocaleDateString(),"YYYY-MM-DD").add(7,'hours').add(5,'minutes');
const d1 = moment(d).add(1,'day');
console.log(d);
console.log(d1);

console.log(moment("20:20", "HH:mm").minutes());

