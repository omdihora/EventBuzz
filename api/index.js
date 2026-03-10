// Vercel Serverless Function entry point — proxies all /api/* requests to Express app
const app = require('../server/server');

module.exports = app;
