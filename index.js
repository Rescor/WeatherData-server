// Unfortunately, due to my workload, I only had one day to work on the test assignment.
// I tried to implement as many things as possible.
// If you are interested, you can take a look at some of my other projects:
// - https://aww.xyz/ - my personal website
// -- (Probably) The best domain on the Internet!
// - https://krtd.net/ - online radio station
// -- KRTD is an online radio station featuring various musical genres, mostly rock and alternative,
// -- and with live radio broadcasts
// - https://netstalking.org/ - Internet research community
// - http://radiotower.netstalking.org/ - Internet radio stations aggregator
// - https://tulpamancy.org/ – community forum

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
