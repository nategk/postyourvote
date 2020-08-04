import createError from 'http-errors'
import http from 'http';
import express from 'express'
import cors from 'cors'
import path from 'path'
import cookieParser from 'cookie-parser'
import bodyParser from 'body-parser'
import logger from 'morgan'
import sassMiddleware from 'node-sass-middleware'
import config from './config.json'
import cache from './lib/cache.js'
import indexRouter from './routes/index.js'
import { connectToDB, connectToAirtable} from './lib/db.js'
import enforce from 'express-sslify'

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
app.use(logger('dev'));
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

// load assets
app.use('/assets', [
  express.static(path.join(__dirname, 'public')),
  express.static(path.join(__dirname, '../node_modules/feather-icons/dist')),
  express.static(path.join(__dirname, '../node_modules/jquery/dist')),
  express.static(path.join(__dirname, '../node_modules/jquery-mask-plugin/dist'))
]);

app.use('/', indexRouter);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
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
    console.error("Exception connectig to DB", error);
    process.exit(1);
  }
  
  console.log(`Started on port ${app.server.address().port}`);
})();


export default app
