import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import lecturesRouter from '../routes/lectures';
import summarizeRoutes from '../routes/summarize';

const app = express();
const PORT = 4000;

app.use(cors());
app.use(bodyParser.json());

app.use('/lectures', lecturesRouter);
app.use('/lectures', summarizeRoutes);

app.listen(PORT, () => {
  console.log(`✅ Server is running at http://localhost:${PORT}`);
});
