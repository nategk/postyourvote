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

let app = express();
app.server = http.createServer(app);

app.use(bodyParser.json({
	limit : config.bodyLimit
}));

app.use(cors({
	exposedHeaders: config.corsHeaders
}));

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');
app.set('cache', new cache(60));
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(sassMiddleware({
  src: path.join(__dirname, 'public'),
  dest: path.join(__dirname, 'public'),
  indentedSyntax: true, // true = .sass and false = .scss
  sourceMap: true
}));
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

app.server.listen(process.env.PORT || config.port, () => {
  console.log(`Started on port ${app.server.address().port}`);
});

export default app
