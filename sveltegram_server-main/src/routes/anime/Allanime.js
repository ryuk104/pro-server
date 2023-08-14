import express from 'express';
const router = express.Router();

import {
    fetchAllanimeRecentEpisodes,
    fetchSearchAllanime,
    fetchAllanimeInfo,
    fetchAllanimeEpisodeSource
} from '../scraper/scrape.js';

router.get('/', (req, res) => {
    res.send({ routes: ['/search?keyw={keyword}', '/info/:animeId', '/watch/:episodeId'], website: 'https://allanime.to/anime' })
})

router.get('/recent-episodes', async (req, res) => {
    const data = await fetchAllanimeRecentEpisodes();
    res.json(data).status(200);
})

router.get('/search', async (req, res) => {
    const keyw = req.query.keyw;

    const data = await fetchSearchAllanime({ keyw });
    res.json(data).status(200);
});

router.get('/info/:animeId', async (req, res) => {
    const animeId = req.params.animeId;

    const data = await fetchAllanimeInfo({ animeId });
    res.json(data).status(200);
});

router.get('/watch/:episodeId', async (req, res) => {
    const episodeId = req.params.episodeId;

    const data = await fetchAllanimeEpisodeSource({ episodeId });
    res.json(data).status(200);
})


export default router;