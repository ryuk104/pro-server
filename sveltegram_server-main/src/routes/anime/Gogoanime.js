import express from "express";
const router = express.Router();

import {
    fetchSearchGogo,
    fetchGogoRecentEpisodes,
    fetchGogoAnimeInfo,
    fetchGogoanimeEpisodeSource
} from "../scraper/scrape.js";

router.get('/', (req, res) => {
    res.send({
        routes: ['/recent-episodes', '/search?keyw={keyword}', '/info/:animeId', '/watch/:episodeId'],
        website: 'https://gogoanime.fi'
    })
})

router.get('/search', async (req, res) => {
    const keyw = req.query.keyw;
    const page = req.query.page;

    const data = await fetchSearchGogo({ keyw: keyw, page: page })
    res.json(data).status(200)
});

router.get('/recent-episodes', async (req, res) => {
    const page = req.query.page;
    const type = req.query.type;

    const data = await fetchGogoRecentEpisodes({ page, type });
    res.json(data).status(200)
});

router.get('/info/:animeId', async (req, res) => {
    const animeId = req.params.animeId;

    const data = await fetchGogoAnimeInfo({ animeId });
    res.json(data).status(200);
});

router.get('/watch/:episodeId', async (req, res) => {
    const episodeId = req.params.episodeId;

    const data = await fetchGogoanimeEpisodeSource({ episodeId });
    res.json(data).status(200)
});

export default router;