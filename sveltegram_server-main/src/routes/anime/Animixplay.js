import express from "express";
const router = express.Router();

import {
    fetchAnimixAllAnime,
    fetchSearchAnimix,
    fetchAnimixRecentEpisodes,
    fetchAnimixAnimeInfo,
    fetchAnimixEpisodeInfo,
    fetchAnimixEpisodeSource
} from "../scraper/scrape.js";

router.get('/all', async (req, res) => {
    const data = await fetchAnimixAllAnime({});
    res.json(data).status(200)
});

router.get('/search', async (req, res) => {
    const keyw = req.query.keyw;

    const data = await fetchSearchAnimix({ keyw: keyw })
    res.json(data).status(200)
});

router.get('/recent-episodes', async (req, res) => {
    const data = await fetchAnimixRecentEpisodes({});
    res.json(data).status(200);
});

router.get('/info/:malId', async (req, res) => {
    const malId = req.params.malId;

    const data = await fetchAnimixAnimeInfo({ malId: malId });
    res.json(data).status(200)
});

router.get('/episodes/:animeId', async (req, res) => {
    const animeId = req.params.animeId;

    const data = await fetchAnimixEpisodeInfo({ animeId });
    res.json(data).status(200);
});

router.get('/watch/:episodeId', async (req, res) => {
    const episodeId = req.params.episodeId;

    const data = await fetchAnimixEpisodeSource({ episodeId });
    res.json(data).status(200)
});

export default router;