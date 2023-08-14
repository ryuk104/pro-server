import axios from 'axios';
import { load } from 'cheerio';

const yugenBase = `https://yugenanime.ro/`;

import { range, encodeString, USER_AGENT } from '../../helper/utils.js';

export const fetchSearchYugen = async ({ keyw, list = [] }) => {
    try {
        if (!keyw) return {
            error: true,
            error_message: "No keyword provided"
        };

        const res = await axios.get(yugenBase + `discover?q=${keyw}`);

        const $ = load(res.data);

        $('div.cards-grid > a.anime-meta').each((i, el) => {
            let animeIdSplitted = $(el).attr('href').split("/anime/")[1].split('/')
            list.push({
                animeTitle: $(el).attr('title'),
                animeId: `${animeIdSplitted[1]}.${animeIdSplitted[0]}`,
                animeImg: $(el).find('div.anime-poster__container > img').attr('data-src'),
                releaseSeason: $(el).find('div.anime-data > div.anime-details > span').text()
            })
        })

        return list;


    } catch (error) {
        // console.log(error)
        return {
            error: true,
            error_message: error
        };
    };
};

export const fetchYugenAnimeInfo = async ({ animeId, list = {} }) => {
    try {
        if (!animeId) return {
            error: true,
            error_message: "No animeId provided"
        };
        const animeIdSplitted = animeId.split(".");
        let episodes = [];

        const res = await axios.get(`${yugenBase}anime/${animeIdSplitted[1]}/${animeIdSplitted[0]}`);

        const $ = load(res.data);

        const totalEpisodes = $('div.page--content > section > div.anime-metadetails > div.data:nth-child(6) > span').text();
        const episodeRange = range({ from: 1, to: parseInt(totalEpisodes) + 1 });
        episodeRange.map(ep => {
            episodes.push({
                epNum: ep,
                episodeId: `${animeIdSplitted[1]}$${ep}$`
            })
        });

        list = {
            animeTitle: $('div.page--container > div.content > h1').text().trim(),
            animeId,
            animeImg: $('div.page-cover-inner > div > img').attr('src'),
            synopsis: $('div.page--container > div.content > div.truncate > p.description').text().trim(),
            score: $('div.page--content > section > div.anime-score > span').text().split("Average Score")[0].trim(),
            otherTitle: $('div.page--content > section > div.anime-metadetails > div.data:nth-child(3) > span').text(),
            type: $('div.page--content > section > div.anime-metadetails > div.data:nth-child(4) > span').text(),
            Studios: $('div.page--content > section > div.anime-metadetails > div.data:nth-child(5) > span').text(),
            totalEpisodes,
            duration: $('div.page--content > section > div.anime-metadetails > div.data:nth-child(8) > span').text(),
            status: $('div.page--content > section > div.anime-metadetails > div.data:nth-child(9) > span').text(),
            airingSeason: $('div.page--content > section > div.anime-metadetails > div.data:nth-child(10) > span').text(),
            episodes
        };

        return list;
    } catch (error) {
        return {
            error: true,
            error_message: error
        };
    };
};

export const fetchYugenEpisodeSource = async ({ episodeId }) => {
    try {
        if (!episodeId) return {
            error: true,
            error_message: "No episodeId provided"
        };

        const episodeIdSplitted = episodeId.split("$");

        const res = await axios({
            method: "POST",
            url: `${yugenBase}api/embed/`,
            data: new URLSearchParams({ id: encodeString(`${episodeIdSplitted[0]}|${episodeIdSplitted[1]}`), ac: 0 }),
            headers: {
                "x-requested-with": "XMLHttpRequest",
                "User-Agent": USER_AGENT
            }
        });

        return {
            episodeThumbnail: res.data.thumbnail,
            sources: Array.from(res.data.hls.map((link) => { return { file: link } }))
        }
    } catch (error) {
        return {
            error: true,
            error_message: error
        };
    };
};

