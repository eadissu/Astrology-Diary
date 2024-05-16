const zodiac_image = ["aries.png", "taurus.png", "gemini.png", "cancer.png", "leo.png", "virgo.png", "libra.png", "scorpio.png", "sagittarius.png", "capricorn.png", "sagittarius.png"];
const zodiac_color = ["var(--aries)", "var(--taurus)", "var(--gemini)", "var(--cancer)", "var(--leo)", "var(--virgo)", "var(--libra)", "var(--scorpio)", "var(--capricorn)", "var(--aquarius)", "var(--pisces)"];

const express = require("express");
const app = express();
const path = require("path");
const { MongoClient, ServerApiVersion } = require('mongodb');
const uri = "mongodb+srv://mwang17:8nzObH3KJ65sV1Gu@cluster0.edwq9kb.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0";

require("dotenv").config({ path: path.resolve(__dirname, 'credentialsDontPost/.env') });
const databaseAndCollection = {db: "CMSC335_HOROSCOPES", collection:"userHoroscopes"};
// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

app.set("views", path.resolve(__dirname, "templates"));
app.set("view engine", "ejs");
portNumber = 4000;

app.listen(portNumber);
console.log(`Web server is running at http://localhost:${portNumber}`);
console.log("Stop to shutdown the server")

process.stdin.setEncoding("utf8");

process.stdin.on("readable", () => {
  const dataInput = process.stdin.read();
  if (dataInput !== null) {
    const inputString = dataInput.toString().trim().toLowerCase();
    if (inputString === "stop") {
      console.log("Shutting down the server");
      process.exit(0);
    } else {
      console.log("Stop to shutdown the server");
    }
  }
});

app.use(express.urlencoded({ extended: true }));
app.use(express.static("public")); 

app.get("/", (request, response) => {
  response.render("index")
});

app.get("/addSign", (request, response) => {
  response.render("addSign")
});

app.get("/getSign", (request, response) => {
  response.render("getSign")
});

app.post("/signAddedConfirmation", async (request, response) => {
  response.render("signAddedConfirmation")
  const {name, dob} = request.body
  const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });
  try {
    await client.connect();

    sign = calculateSign(dob)
    let newSign = {name, dob, sign};
    console.log(newSign)
    
    const result = await client.db(databaseAndCollection.db).collection(databaseAndCollection.collection).insertOne(newSign);
    console.log(`entry made${result.insertedId}`);
  } catch (e) {
      await console.error(e);
  } finally {
      await client.close();
  }
});

app.post("/dailyHoroscope", (request, response) => {
  // API Key should be stored in an environment variable for security
  const { horoscopeSign } = request.body;

  const URL = 'https://aztro.sameerkumar.website/?sign=aries&day=today';
  fetch(URL, {
      method: 'POST'
  })
  .then(response => response.json())
  .then(json => {
      const date = json.current_date;
      console.log(date);
  });
  response.render("dailyHoroscope",{horoscopeSign})
  
});


app.get("/getHoroscope", (request, response) => {
  
  response.render("getHoroscope")
});

const calculateSign = (dateInput) => {

  const date = new Date(dateInput);
  const month = date.getUTCMonth() + 1;
  const day = date.getUTCDate();
  if ((month === 1 && day >= 20) || (month === 2 && day <= 18)) {
      return "Aquarius";
  } else if ((month === 2 && day >= 19) || (month === 3 && day <= 20)) {
      return "Pisces";
  } else if ((month === 3 && day >= 21) || (month === 4 && day <= 19)) {
      return "Aries";
  } else if ((month === 4 && day >= 20) || (month === 5 && day <= 20)) {
      return "Taurus";
  } else if ((month === 5 && day >= 21) || (month === 6 && day <= 20)) {
      return "Gemini";
  } else if ((month === 6 && day >= 21) || (month === 7 && day <= 22)) {
      return "Cancer";
  } else if ((month === 7 && day >= 23) || (month === 8 && day <= 22)) {
      return "Leo";
  } else if ((month === 8 && day >= 23) || (month === 9 && day <= 22)) {
      return "Virgo";
  } else if ((month === 9 && day >= 23) || (month === 10 && day <= 22)) {
      return "Libra";
  } else if ((month === 10 && day >= 23) || (month === 11 && day <= 21)) {
      return "Scorpio";
  } else if ((month === 11 && day >= 22) || (month === 12 && day <= 21)) {
      return "Sagittarius";
  } else if ((month === 12 && day >= 22) || (month === 1 && day <= 19)) {
      return "Capricorn";
  }
}

/* Function that converts Requested DB information into Diary Entrees on the Index Page */
/*
function createEntree(name, sign) {*/
  
  /* <div class="entree"> <img="${}"> <h3>${name}<h3><h4>${sign}</h4><div>*/
/*}
*/


const encodedParams = new URLSearchParams();
encodedParams.set('name', 'Aakash');
encodedParams.set('birthdate', '15-02-1989');
encodedParams.set('birthtime', '12:32');
encodedParams.set('City', 'DELHI');

const url = 'https://kundli1.p.rapidapi.com/';
const options = {
  method: 'POST',
  headers: {
    'content-type': 'application/x-www-form-urlencoded',
    'X-RapidAPI-Key': 'e8ac1c1b64mshf75bb5062a0cdefp1e2e92jsnc70e311540a7',
    'X-RapidAPI-Host': 'kundli1.p.rapidapi.com'
  },
  body: encodedParams.toString(),
};

async function fetchData() {
  try {
    const response = await fetch(url, options);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();
    console.log(data);
  } catch (error) {
    console.error('Error:', error);
  }
}

fetchData();


