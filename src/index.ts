import cookieParser from 'cookie-parser';
import express from 'express';
import path from 'path';
import dotenv from 'dotenv';
import i18nextBackend from 'i18next-fs-backend';
import i18nextMiddleware from 'i18next-http-middleware';
import i18next from 'i18next';
import router from './routes';
import winston from 'winston';

dotenv.config();
import { AppDataSource } from './config/database';
import { Request, Response, NextFunction } from 'express';
const app = express();
const port = 3000;

const logger = winston.createLogger({
  transports: [
    new winston.transports.Console(),
  ],
});
AppDataSource.initialize()
  .then(() => {
    logger.info('Data Source has been initialized!');
  })
  .catch((err) => {
    logger.error('Error during Data Source initialization', err);
  });


// Serve static files
app.use(express.static(path.join(__dirname, 'public')));

i18next
  .use(i18nextBackend)
  .use(i18nextMiddleware.LanguageDetector)
  .init({
    fallbackLng: 'vi',
    preload: ['vi', 'en'],
    supportedLngs: ['vi', 'en'],
    saveMissing: true,
    backend: {
      loadPath: path.join(__dirname, 'locales/{{lng}}/{{ns}}.json'),
      addPath: path.join(__dirname, 'locales/{{lng}}/{{ns}}.missing.json'),
    },
    detection: {
      order: ['querystring', 'cookie'],
      caches: ['cookie'],
      lookupQuerystring: 'locale', //query string on url (?locale=en/vi)
      lookupCookie: 'locale',
      ignoreCase: true,
      cookieSecure: false,
    },
  });
app.use(i18nextMiddleware.handle(i18next));

app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

// Use router
app.use(router);

// Error handling middleware
app.use((err: any, req: Request, res: Response, next: NextFunction) => {
  if (err) {
    console.error(err.stack);
  } else {
    res.status(500).send('Đã xảy ra lỗi!');
  }
});

// Start server
app.listen(port, () => {
  console.log(`App listening on port ${port}`);
});
