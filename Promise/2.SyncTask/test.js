let Promise = require("./promise");

let promise = new Promise((resolve, reject) => {
  resolve("execute sync task");
});

function successLog(data) {
  console.log(data);
}

function errorLog(error) {
  console.log(error);
}
promise.then(successLog, errorLog);
