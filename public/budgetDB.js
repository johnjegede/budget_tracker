let db;
// create a new db request for a "budget" database.
const request = indexedDB.open("budgetTracker", 1);

request.onupgradeneeded = function (event) {
  // create object store called "budget" and set autoIncrement to true
  const db = event.target.result;
  db.createObjectStore("budget", { autoIncrement: true });
};

request.onsuccess = function (event) {
  db = event.target.result;

  // check if app is online before reading from db
  if (navigator.onLine) {
    checkDatabase();
  }
};

request.onerror = function (event) {
  console.log("Woops! " + event.target.errorCode);
};

function saveRecord(record) {
  // create a transaction on the budget db with readwrite access
  const transaction = db.transaction(["budget"], "readwrite");

  // access your budget object store
  const store = transaction.objectStore("budget");

  // add record to your store with add method.
  store.add(record);
}

function checkDatabase() {
  // open a transaction on your budget db
  const transaction = db.transaction(["budget"], "readwrite");
  // access your budget object store
  const store = transaction.objectStore("budget");
  // get all records from store and set to a variable
  const getAll = store.getAll();
  console.log("checkdatabase");

  getAll.onsuccess = function () {
    if (getAll.result.length > 0) {
      fetch("/api/transaction/bulk", {
        method: "POST",
        body: JSON.stringify(getAll.result),
        headers: {
          Accept: "application/json, text/plain, */*",
          "Content-Type": "application/json",
        },
      })
        .then((response) => response.json())
        .then(() => {
          // if successful, open a transaction on your budget db
          const transaction = db.transaction(["budget"], "readwrite");

          // access your budget object store
          const store = transaction.objectStore("budget");
          console.log("clear items in store");

          // clear all items in your store
          store.clear();
        });
    }
  };
}

// listen for app coming back online
window.addEventListener("online", checkDatabase);
