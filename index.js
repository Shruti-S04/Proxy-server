require('dotenv').config();
const PORT = process.env.PORT || 5000
const express = require('express')
const url = require('url')
const app = express()
const needle = require('needle')
const cors = require("cors")
const rateLimit = require('express-rate-limit').default
const apicache = require("apicache");

const limiter = rateLimit({
  windowMs: 10 * 60 * 1000, // 10 Mins
  max: 100, // maximum amount of requests per 10 mins
})

let cache = apicache.middleware;

const API_BASE_URL = process.env.API_BASE_URL;
const API_KEY_NAME = process.env.API_BASE_KEY;
const API_KEY_VALUE = process.env.API_KEY_VALUE;

app.use(cors())
app.use(express.static(__dirname + 'public'))

app.get("/getweather", async (req, res) => {
  try {
    const params = new URLSearchParams({
      [API_BASE_KEY]: API_KEY_VALUE,
      ...url.parse(req.url, true).query,
    });

    const apiRes = await needle("get", `${API_BASE_URL}?${params}`);
    const data = apiRes.body;

    // Log the request to the public API
    if (process.env.NODE_ENV !== "production") {
      console.log(`REQUEST: ${API_BASE_URL}?${params}`);
    }

    res.status(200).json(data);
  } catch (error) {
    console.log(error)
  }
});

 
console.log(API_BASE_URL)
console.log(API_KEY_NAME)
console.log(API_KEY_VALUE)

app.get('/',(req,res)=>{
    res.sendFile(__dirname + "/index.html")
} )

app.listen(PORT, () => {
    console.log(`App is listening on PORT ${PORT}`)
})

app.use(limiter)
app.set('trust proxy', 1)

app.get("/getweather", cache('2 minutes'), async (req, res) => {
    try {
      const params = new URLSearchParams({
        [API_BASE_KEY]: API_KEY_VALUE,
        ...url.parse(req.url, true).query,
      });
  
      const apiRes = await needle("get", `${API_BASE_URL}?${params}`);
        const data = apiRes.body;
        console.log(data)
  
      // Log the request to the public API
      if (process.env.NODE_ENV !== "production") {
        console.log(`REQUEST: ${API_BASE_URL}?${params}`);
      }
  
        res.json({
          data:data
      })
    } catch (error) {
      console.log(error);
      //res.send(error)
    }
  });