const createError = require('http-errors');
const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');

// AWS Secrets Manager SDK (CommonJS import)
const {
  SecretsManagerClient,
  GetSecretValueCommand,
} = require('@aws-sdk/client-secrets-manager');

const indexRouter = require('./routes/index');
const usersRouter = require('./routes/users');


const app = express();

// ===== AWS SECRETS MANAGER FETCH START =====
(async () => {
  const secretName = 'python/test';
  const client = new SecretsManagerClient({
    region: 'us-east-1',
  });

  try {
    const response = await client.send(
        new GetSecretValueCommand({
          SecretId: secretName,
          VersionStage: 'AWSCURRENT',
        })
    );

    const secretString = response.SecretString;

    if (secretString) {
      const secret = JSON.parse(secretString); // ✅ Parse the JSON

      // ✅ Access individual keys
      console.log('✅ AWS Secret fetched successfully');

      console.log('DB_HOST:', secret.degree);
      console.log('DB_USER:', secret.field);
      console.log('DB_PASS:', secret.company);
      // console.log('PORT:', secret.PORT);


      // Optionally: Assign to environment variables or a global config
      process.env.DB_HOST = secret.degree;
      process.env.DB_USER = secret.field;
      process.env.DB_PASS = secret.company;
      process.env.EMAIL_USER = secret.email;
      process.env.PORT = secret.PORT;

      console.log('PORT', process.env.PORT)
    }

  } catch (err) {
    console.error('❌ Error fetching secret from AWS:', err.message);
  }
})();
// ===== AWS SECRETS MANAGER FETCH END =====

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter);
app.use('/users', usersRouter);


// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
