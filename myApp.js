const express = require('express');
const app = express();
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const cors = require('cors');
const morgan = require('morgan');
const fs = require('fs');
const path = require('path');

// app.use(helmet.hidePoweredBy());
// app.use(helmet.frameguard({action: 'deny'}));
// app.use(helmet.xssFilter()); // use content security policy instead of this 
// app.use(helmet.noSniff()); // protect content type override
// app.use(helmet.ieNoOpen()); // prevent executing the downloaded file in IE
// app.use(helmet.hsts({maxAge: (90 * 60 * 60 * 24) , force: true}));
// app.use(helmet.dnsPrefetchControl()); //compromise the speed and performance
// app.use(helmet.noCache()); // control cache
// app.use(
// 	helmet.contentSecurityPolicy({
// 	  directives: {
// 		defaultSrc: ["'self'"], // Only allow resources from the same origin
// 		scriptSrc: ["'self'", 'trusted-cdn.com'] // Allow scripts only from self & trusted source
// 	  },
// 	})
//   );


const corsMiddleware = cors({
	origin: process.env.ALLOWED_ORIGINS ? process.env.ALLOWED_ORIGINS.split(',') : '*',
	methods: ['GET', 'POST', 'PUT', 'DELETE'],
	allowedHeaders: ['Content-Type', 'Authorization'],
	credentials: true,
	maxAge: 86400 // 24 hours
});

const helmetMiddleware = helmet({
	frameguard: { action: 'deny' },
	contentSecurityPolicy: {
	  directives: {
		defaultSrc: ["'self'"],
		styleSrc: ["'self'"],
		imgSrc: ["'self'"],
		scriptSrc: ["'self'"],
		connectSrc: ["'self'"],
		upgradeInsecureRequests: true,
	  }
	},
	dnsPrefetchControl: false, // may compromise the speed and performance
	xssFilter: true,
	noSniff: true,
	hsts: {
	  maxAge: 15552000,
	  includeSubDomains: true // force to use https 
	}
});

const rateLimiterMiddleware = rateLimit({
	windowMs: 1 * 60 * 1000, // 1 minute
	max: 30, // limit each IP to 30 requests per windowMs
	standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
	legacyHeaders: false, // Disable the `X-RateLimit-*` headers
	message: 'Too many requests from this IP, please try again after 1 minute'
});

const authRateLimiterMiddleware = rateLimit({
	windowMs: 60 * 60 * 1000, // 1 hour
	max: 15, // 15 attempts per hour
	message: 'Too many login attempts, please try again later'
});

const setupLoggerMiddleware = (app) => {
	// Create a logs directory if it doesn't exist
	const logDirectory = path.join(__dirname, '..', 'logs');
	fs.existsSync(logDirectory) || fs.mkdirSync(logDirectory);
	
	// Create a write stream for access logs
	const accessLogStream = fs.createWriteStream(
	  path.join(logDirectory, 'access.log'),
	  { flags: 'a' }
	);
	
	// Create a write stream for audit logs
	const auditLogStream = fs.createWriteStream(
	  path.join(logDirectory, 'audit.log'),
	  { flags: 'a' }
	);
  
	// Create custom token for user information
	morgan.token('user-info', function (req, res) {
	  if (req.user) {
		return `${req.user.id}:${req.user.name}:${req.user.email}:${req.user.orgId}`;
	  }
	  return 'unauthenticated';
	});
  
	// Create custom token for operation details
	morgan.token('operation', function (req, res) {
	  const method = req.method;
	  const path = req.path;
	  
	  let operation = 'UNKNOWN';
	  if (method === 'POST') operation = 'CREATE';
	  if (method === 'GET') operation = 'READ';
	  if (method === 'PUT' || method === 'PATCH') operation = 'UPDATE';
	  if (method === 'DELETE') operation = 'DELETE';
	  
	  return operation;
	});
  
	// Add standard access logging
	app.use(morgan('combined', { stream: accessLogStream }));
  
	// Add detailed audit logging for CRUD operations
	app.use(morgan('[AUDIT] :date[iso] - User::user-info - :operation - :method :url - Status::status', { 
	  stream: auditLogStream,
	  // Skip static resources and non-API routes
	  skip: function (req, res) {
		return req.path.startsWith('/static') || 
			   req.path === '/favicon.ico' ||
			   req.path.startsWith('/public');
	  }
	}));
  
	// Add console logging in development
	if (process.env.NODE_ENV !== 'production') {
	  app.use(morgan('dev'));
	}
};






























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
