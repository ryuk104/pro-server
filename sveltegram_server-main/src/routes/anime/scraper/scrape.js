import axios from 'axios';
import { load } from 'cheerio';

const livechartBase = `https://www.livechart.me/`;

// Animix
export {
    fetchSearchAnimix,
    fetchAnimixAllAnime,
    fetchAnimixAnimeInfo,
    fetchAnimixEpisodeInfo,
    fetchAnimixEpisodeSource,
    fetchAnimixRecentEpisodes
} from './animixplay/animixplay.js';

// Gogoanime
export {
    fetchGogoAnimeInfo,
    fetchGogoRecentEpisodes,
    fetchGogoanimeEpisodeSource,
    fetchSearchGogo
} from './gogoanime/gogoanime.js';

export {
    fetchSearchZoro,
    fetchZoroAnimeInfo,
    fetchZoroEpisodeSource
} from './zoro/zoro.js';

export {
    fetchAllanimeRecentEpisodes,
    fetchSearchAllanime,
    fetchAllanimeInfo,
    fetchAllanimeEpisodeSource
} from './allanime/allanime.js';

export {
    fetchSearchAnimepahe,
    fetchAnimepaheEpisodeSource,
    fetchAnimepaheInfo
} from './animepahe/animepahe.js';

export {
    fetchSearchYugen,
    fetchYugenAnimeInfo,
    fetchYugenEpisodeSource
} from './yugen/yugen.js';

// GLOBAL ROUTES
export const fetchSchedule = async () => {
    try {
        const res = await axios.get(`${livechartBase}schedule/tv?sortby=countdown`);
        const $ = load(res.data);

        let schedule = [];

        $('div.schedule-card').each((i, el) => {
            schedule.push({
                animeTitle: $(el).attr('data-title'),
                episode: $(el).find('.episode-countdown').attr('data-label'),
                unixTimestamp: $(el).find('.episode-countdown').attr('data-timestamp')
            })
        })

        return schedule;
    } catch (error) {
        console.log(error)
        return {
            error: true,
            error_message: error
        }
    }
}