const express = require('express');
const app = express();
const helmet = require('helmet');

app.use(helmet.hidePoweredBy());
app.use(helmet.frameguard({action: 'deny'}));
app.use(helmet.xssFilter()); // use content security policy instead of this 
app.use(helmet.noSniff()); // protect content type override
app.use(helmet.ieNoOpen()); // prevent executing the downloaded file in IE
app.use(helmet.hsts({maxAge: (90 * 60 * 60 * 24) , force: true}));







































module.exports = app;
const api = require('./server.js');
app.use(express.static('public'));
app.disable('strict-transport-security');
app.use('/_api', api);
app.get("/", function (request, response) {
  response.sendFile(__dirname + '/views/index.html');
});
let port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Your app is listening on port ${port}`);
});
