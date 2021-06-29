require('dotenv').config();
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');

const urlShortenerService = require('./services/url-shortener');
const urlShortenerController = require('./controllers/url-shortener');
const apiRoute = require('./routes/api');

const app = express();

// Basic Configuration
const port = process.env.PORT || 3000;

app.use(cors());
app.use(bodyParser.urlencoded());

app.use('/public', express.static(`${process.cwd()}/public`));

app.get('/', function (req, res) {
  res.sendFile(process.cwd() + '/views/index.html');
});

const urlSvc = urlShortenerService({});
const urlCont = urlShortenerController(urlSvc, {});

app.use('/api', apiRoute(urlCont, {}));

app.listen(port, function () {
  console.log(`Listening on port ${port}`);
});
