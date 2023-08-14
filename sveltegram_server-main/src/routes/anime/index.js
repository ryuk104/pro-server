import express from 'express';

const app = express();
import cors from 'cors';

//Importing Global functions & utils
import {
    fetchSchedule
} from './scraper/scrape.js';

app.use(cors({ origin: "*", credentials: true }));
app.use(express.json())

import gogoRoutes from './Gogoanime.js';
import animixRoutes from './Animixplay.js';
import zoroRoutes from './Zoro.js';
import allanimeRoutes from './Allanime.js';
import animepaheRoutes from './Animepahe.js';
import yugenRoutes from './Yugen.js';

app.use('/gogoanime', gogoRoutes);
app.use('/animix', animixRoutes);
app.use('/zoro', zoroRoutes);
app.use('/allanime', allanimeRoutes);
app.use('/animepahe', animepaheRoutes);
app.use('/yugen', yugenRoutes);

// Routes
app.get('/schedule', async (req, res) => {
    const data = await fetchSchedule();
    res.json(data).status(200);
})

