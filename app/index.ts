import express, { Express, Request, Response } from 'express';
import bodyParser from 'body-parser';
import cors from 'cors';
import dotenv from 'dotenv';
import billReader from './routes/billReader';

dotenv.config();

const app: Express = express();
const port = process.env.PORT || 3000;

app.use(bodyParser.urlencoded({ extended: false, limit: '50mb' }));
app.use(bodyParser.json({ limit: '50mb' }));
app.use(cors({ origin: '*' }));
app.use(billReader);

app.get('/', (request: Request, response: Response) => {
  response.send('Health check');
});

app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
});
