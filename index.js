import express from 'express';
import cors from 'cors';
import apiRoutes from './routes/api.js';

const app = express();
const port = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

app.use('/api', apiRoutes);

app.listen(port, () => {
  console.log(`Server has been started on port ${port}...`)
});
