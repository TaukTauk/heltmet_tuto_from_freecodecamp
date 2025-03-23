const express = require('express');
const app = express();
const helmet = require('helmet');

app.use(helmet.hidePoweredBy());
app.use(helmet.frameguard({action: 'deny'}));
app.use(helmet.xssFilter()); // use content security policy instead of this 
app.use(helmet.noSniff()); // protect content type override
app.use(helmet.ieNoOpen()); // prevent executing the downloaded file in IE
app.use(helmet.hsts({maxAge: (90 * 60 * 60 * 24) , force: true}));
app.use(helmet.dnsPrefetchControl()); //compromise the speed and performance
app.use(helmet.noCache()); // control cache
app.use(
	helmet.contentSecurityPolicy({
	  directives: {
		defaultSrc: ["'self'"], // Only allow resources from the same origin
		scriptSrc: ["'self'", 'trusted-cdn.com'] // Allow scripts only from self & trusted source
	  },
	})
  );




































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
