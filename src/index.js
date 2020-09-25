import http from 'http';
import express from 'express'
import cors from 'cors'
import path from 'path'
import fs from 'fs';
import { fileURLToPath } from 'url';
import cookieParser from 'cookie-parser'
import bodyParser from 'body-parser'
import morgan from 'morgan'
import sassMiddleware from 'node-sass-middleware'
import cache from './lib/cache.js'
import indexRouter from './routes/index.js'
import { connectToDB, connectToAirtable} from './lib/db.js'
import enforce from 'express-sslify'
import logger from './lib/logger.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const configPath = path.resolve(path.join(__dirname, 'config.json'));
const config = JSON.parse(fs.readFileSync(configPath, 'UTF-8'));

let app = express();
app.server = http.createServer(app);
if (process.env.NODE_ENV == 'production') {
  // Enforce https and the proto header is required for heroku
  app.use(enforce.HTTPS({ trustProtoHeader: true }));
}

app.use(bodyParser.json({
	limit : config.bodyLimit
}));

app.use(cors({
	exposedHeaders: config.corsHeaders
}));

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');
app.set('cache', new cache(config.defaultCacheSeconds));
app.use(morgan('dev', { stream: {write: function (message) {
  logger.info(message);
}}}));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(sassMiddleware({
  src: path.join(__dirname, 'public'),
  dest: path.join(__dirname, 'public'),
	prefix: '/assets',
	outputStyle: 'compressed',
  indentedSyntax: true, // true = .sass and false = .scss
  sourceMap: true
}));
// This is done before every request
app.use((req, res, next) => {
  res.locals.env = app.locals.settings.env;
  next();
})

// load assets
app.use('/assets', [
  express.static(path.join(__dirname, 'public')),
  express.static(path.join(__dirname, '../node_modules/feather-icons/dist')),
  express.static(path.join(__dirname, '../node_modules/jquery/dist')),
  express.static(path.join(__dirname, '../node_modules/jquery-mask-plugin/dist'))
]);
app.set('config', config);

app.use('/', indexRouter);

// error handler
app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  let error = {};
  if (req.app.get('NODE_ENV') === 'development') {
    error = {
      status: err.status,
      message: err.message,
      stacktrace: error.stack
    }
  } else {
    error = {
      message: res.statusMessage,
      status: res.statusCode
    }
  }
  logger.error("Error: %s\n%s", err, err.stack);
  // render the error page
  res.status(err.status || 500);
  res.render('error', error);
});

(async () => {
  try {
    // Execute these tasks in parallel
    var mongoClientPromise = connectToDB();
    var serverListenPromise = app.server.listen(process.env.PORT || config.port);

    // Wait for the above tasks to complete
    var mongoClient = await mongoClientPromise;
    app.set('db', mongoClient.db());
    app.set('airtable', connectToAirtable());
    await serverListenPromise;
  }
  catch(error) {
    logger.error("Exception connectig to DB", error);
    process.exit(1);
  }

  logger.info('Started on port %s', app.server.address().port);
})();

export default app
