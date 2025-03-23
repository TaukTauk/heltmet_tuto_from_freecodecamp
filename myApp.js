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
		scriptSrc: ["'self'", "'trusted-cdn.com'"], // Allow scripts only from self & trusted source
		styleSrc: ["'self'", "'unsafe-inline'"], // Allow inline styles (use cautiously)
		imgSrc: ["'self'", "data:"], // Allow images from self and data URIs
		connectSrc: ["'self'", "https://api.example.com"], // Allow API requests to a specific domain
		fontSrc: ["'self'", "https://fonts.googleapis.com"], // Allow fonts from Google Fonts
		objectSrc: ["'none'"], // Block `<object>`, `<embed>`, and `<applet>`
		frameAncestors: ["'none'"], // Prevent embedding in iframes (Clickjacking protection)
		upgradeInsecureRequests: true, // Upgrade HTTP requests to HTTPS
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
