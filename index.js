const zodiac_image = ["aries.png", "taurus.png", "gemini.png", "cancer.png", "leo.png", "virgo.png", "libra.png", "scorpio.png", "sagittarius.png", "capricorn.png", "sagittarius.png"];
const zodiacColors = {
  "aries": "#ff5353",
  "taurus": "#81c282",
  "gemini": "#ffe153",
  "cancer": "#c8c8c8",
  "leo": "#ffa35b",
  "virgo": "#af8466",
  "libra": "#fdbdbe",
  "scorpio": "#242424",
  "sagittarius": "#c1adf0",
  "capricorn": "#666b68",
  "aquarius": "#80bfea",
  "pisces": "#a1e2c4"
};


const express = require("express");
const app = express();
const path = require("path");
const { MongoClient, ServerApiVersion } = require('mongodb');
const uri = "mongodb+srv://mwang17:8nzObH3KJ65sV1Gu@cluster0.edwq9kb.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0";

require("dotenv").config({ path: path.resolve(__dirname, 'credentialsDontPost/.env') });
const databaseAndCollection = {db: "CMSC335_HOROSCOPES", collection:"userHoroscopes"};

 /*const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });*/

const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

let count = 0;


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




app.get("/", async (request, response) => {

  try {
    const newHtml = await createEntrees(databaseAndCollection); // Await the promise returned by createEntrees
    console.log(newHtml);
    response.render("index" ,{ entreesHtml: newHtml}); // Pass the HTML to the template
  } catch (error) {
    console.error('Error in getting entrees:', error);
    response.status(500).send('Internal Server Error');
  }

});

app.get("/addSign", (request, response) => {
  response.render("addSign")
});

app.get("/getSign", (request, response) => {
  response.render("getSign")
});

app.post("/signConfirmation", async (request, response) => {
  
  const {name, dob} = request.body
  const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });
  try {
    await client.connect();

    /* Calculate how long DB is. If DB size = 3, Do not add new entree. Instead, next page should suggest deleting an entree */
    const docCount = await client.db(databaseAndCollection.db).collection(databaseAndCollection.collection).countDocuments();
    
    count = docCount
    if (docCount >= 3){ 
      response.render("signConfirmation",{output:"Entries are at max capacity. Please delete at least one. "})
    } else {
      sign = calculateSign(dob)
      let newSign = {name, dob, sign};
      console.log(newSign)
      const result = await client.db(databaseAndCollection.db).collection(databaseAndCollection.collection).insertOne(newSign);
      console.log(`entry made${result.insertedId}`);
      response.render("signConfirmation",{output:"Horoscope Added! 🙂 "})
    }

  } catch (e) {
      await console.error(e);
  } finally {
      await client.close();
  }
});

app.post("/dailyHoroscope", (request, response) => {
  // API Key should be stored in an environment variable for security
  const { horoscopeSign } = (request.body);

  console.log(horoscopeSign.toLowerCase());
  let sign = horoscopeSign.toLowerCase();
  //let horoscope = createHoroscope(sign);


  const url = "https://best-daily-astrology-and-horoscope-api.p.rapidapi.com/api/Detailed-Horoscope/?zodiacSign=" + sign;
  const options = {
    method: 'GET',
    headers: {
      //'x-rapidapi-key': 'e8ac1c1b64mshf75bb5062a0cdefp1e2e92jsnc70e311540a7',
      'X-RapidAPI-Key': '7d34f1f7ddmshc64f8ebdf309bdap114feajsn28d81e683802',
      'x-rapidapi-host': 'best-daily-astrology-and-horoscope-api.p.rapidapi.com',
      'Content-Type': 'application/json'
    }
  };

  fetch(url, options)
  .then(res => res.json())
  .then(result => {
    console.log(result);
    // Assuming result has a property named prediction which contains the horoscope text
    const prediction = result.prediction;
    const segments = prediction.split('\n'); // Split by newline characters
    
    if (segments.length > 2) {
      const selectedSegments = [segments[0], segments[1], segments[segments.length - 1]];
      const formattedPrediction = selectedSegments.join(' ');
      response.render("dailyHoroscope", {
        sign: horoscopeSign,
        signColor: zodiacColors[sign],
        horoscope: formattedPrediction,
        color: result.color,
        number: result.number
      });
    } else {
      response.render("dailyHoroscope", {
        sign: horoscopeSign,
        signColor: zodiacColors[sign],
        horoscope: prediction,
        color: result.color,
        number: result.number
      });
    }
  })
  .catch(error => {
    console.error('Error:', error);
    response.status(500).send('Something went wrong!');
  });
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


async function createEntrees() {

  new_html = ""
  try {
    await client.connect();
    const data = client.db(databaseAndCollection.db)
      .collection(databaseAndCollection.collection)
      .find();

    // Traverse through the cursor
    let index = 0;
    await data.forEach(document => {

      console.log("THIS!: " + document);
      // traverse through all results
      new_html += `<div class="entree">`;
      console.log(`Color: ${zodiacColors[document.sign.toLowerCase()]}`);
      new_html += `<img src="/images/${document.sign}.png" style="background-color: ${zodiacColors[document.sign.toLowerCase()]};">`;
      new_html += `<div>`;
      new_html += `<h3>${document.name}</h3>`;
      new_html += `<p>${document.sign}</p>`;
      // Create a form to delete the entry
      new_html += `<form action="/deleteEntry" method="POST" style="display:inline;">`;
      new_html += `<input type="hidden" name="name" value="${document.name}">`;
      new_html += `<button type="submit" style=" cursor:pointer;">Delete</button>`;
      new_html += `</form>`;
      new_html += `</div></div>`;
      
      index ++;
    });

    count = index;
    /* 
  
*/


    /* <div class="entree">
        
          <img src="/public/images/gemini.png" style="background-color: pink;">
          <div>
            <h3>Jane Doe</h3>
            <p>Aries</p>
            <button>Delete</button>
          </div>
        </div>*/
    
  } catch (error) {
    console.error('Error retrieving documents:', error);
    // Handle error
  } finally {
    await client.close();
  }

  return new_html;
}

async function deleteOne(client, databaseAndCollection, targetName) {
  const result = await client.db(databaseAndCollection.db)
                             .collection(databaseAndCollection.collection)
                             .deleteOne({ name: targetName });
  if (result.deletedCount === 1) {
      console.log(`Successfully deleted one document with name ${targetName}`);
  } else {
      console.log(`No documents matched the query. Deleted 0 documents.`);
  }
}




app.post("/deleteEntry", async (request, response) => {
    const { name } = request.body;
    console.log(name);
    try {
        await client.connect();
        await deleteOne(client, databaseAndCollection, name);
        response.redirect("/");
    } catch (error) {
        console.error('Error deleting document:', error);
        response.status(500).send('Internal Server Error');
    } finally {
        await client.close();
    }
});

