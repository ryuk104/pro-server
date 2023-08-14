import axios from "axios";
import { load } from 'cheerio';

const zoroBase = "https://zoro.to";

const USER_AGENT = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/103.0.0.0 Safari/537.36";
const headerOption = { "User-Agent": USER_AGENT, "X-Requested-With": "XMLHttpRequest" };

import { scrapeSource } from '../../helper/rapid-cloud.js';

export const fetchSearchZoro = async ({ list = [], keyw, page = 1 }) => {
    try {
        if (!keyw) return {
            error: true,
            error_message: "No keyword provided"
        };

        const res = await axios.get(zoroBase + `/search?keyword=${keyw}&page=${page}`);
        const $ = load(res.data);

        $('div.film_list-wrap > div.flw-item').each((i, el) => {
            list.push({
                animeTitle: $(el).find('div.film-detail > .film-name > a').text(),
                animeId: $(el).find('div.film-detail > .film-name > a').attr('href').split('/')[1].split('?')[0],
                animeImg: $(el).find('div.film-poster > img').attr('data-src')
            })
        })

        return list;
    } catch (err) {
        return {
            error: true,
            error_message: err
        }
    }
}

export const fetchZoroAnimeInfo = async ({ zoroId }) => {
    try {
        if (!zoroId) return {
            error: true,
            error_message: "No animeId provided"
        };

        let list = {};
        let episodes = [];

        const res = await axios.get(zoroBase + `/watch/${zoroId}`);
        const $ = load(res.data);

        const animeTitle = $('div.anisc-detail > h2.film-name > a').text()
        const animeImg = $('div.anisc-poster > div.film-poster > img').attr("src")
        const synopsis = $('div.film-description > div.text').text().trim()
        const type = $('div.film-stats > span.item').last().prev().prev().text()
        let dubbed = false;

        Array.from($('div.film-stats span.item div.tick-dub')).map((el) => {
            if ($(el).text().toLowerCase().includes("dub")) dubbed = true
        });

        const idNum = zoroId.split("-").pop();

        const episodesRes = await axios.get(zoroBase + `/ajax/v2/episode/list/${idNum}`, {
            headers: {
                ...headerOption,
                "Referer": zoroBase + `watch/${zoroId}`
            }
        });
        const $$ = load(episodesRes.data.html)
        const totalEpisodes = $$('div.detail-infor-content > div.ss-list > a').length;

        $$('div.detail-infor-content > div.ss-list > a').each((i, el) => {
            episodes.push({
                epNum: $(el).attr("data-number"),
                episodeName: $(el).attr("title"),
                episodeId: $(el).attr("href").split("/").pop().replace("?ep=", "-episode-")
            })
        })

        list = {
            animeTitle,
            animeImg,
            synopsis,
            type,
            isDubbed: dubbed,
            totalEpisodes,
            episodes
        };

        return list;
    } catch (err) {
        // console.log(err)
        return {
            error: true,
            error_message: err
        }
    }
}

export const fetchZoroEpisodeSource = async ({ episodeId, type = 1 }) => {
    try {
        if (!episodeId) return {
            error: true,
            error_message: "Episode ID not provided"
        };

        episodeId = episodeId.split("-").pop()

        const res = await axios.get(zoroBase + `/ajax/v2/episode/servers?episodeId=${episodeId}`, {
            headers: headerOption
        });
        const $ = load(res.data.html)

        // console.log(res.data.html)

        let dataId;
        let subOrDub = "sub";
        if (type == 2) subOrDub = "dub"

        // console.log(subOrDub)

        if (subOrDub === "dub" && $('div.servers-dub').length <= 0) {
            return {
                noDubs: true,
                error_message: "No dubs available for this episode"
            }
        }

        $(`div.servers-${subOrDub} > div.ps__-list > div.server-item`).each((i, el) => {
            if ($(el).attr("data-server-id") == 1) {
                dataId = $(el).attr("data-id")
            };
        });

        const sources = await scrapeSource(dataId);


        return sources;
    } catch (err) {
        console.log(err)
        return {
            error: true,
            error_message: err
        }
    }
}