import axios from 'axios';

const allanimeBase = 'https://allanime.to/';
const allanimeApi = allanimeBase + 'allanimeapi';
const allanimeSourceUrl = 'https://allanimenews.com';

import {
    recentEpisodeParams,
    searchParams,
    animeInfoParams,
    episodeListParams,
    sourceParams,
    headerAllanime,
} from './allanimeConstants.js';

export const fetchAllanimeRecentEpisodes = async () => {
    try {
        let list = [];
        const { data: { data: { shows: { edges } } } } = await axios.get(allanimeApi, {
            params: recentEpisodeParams,
            headers: headerAllanime
        });

        edges.map((ep) => {
            list.push({
                animeTitle: ep.name,
                animeId: ep._id,
                animeImg: ep.thumbnail,
                epNum: ep.lastEpisodeInfo.sub.episodeString,
                episodeId: `${ep._id}$${ep.lastEpisodeInfo.sub.episodeString}$`
            });
        });

        return list;
    } catch (error) {
        return {
            error: true,
            error_message: error
        }
    }
}

export const fetchSearchAllanime = async ({ keyw, list = [] }) => {
    try {
        if (!keyw) return {
            error: true,
            error_message: "No keyword provided"
        };

        const { data } = await axios.get(allanimeApi, {
            params: searchParams(keyw),
            headers: headerAllanime
        });

        data.data.shows.edges.map((anime) => {
            list.push({
                animeTitle: anime.name,
                animeId: anime._id,
                animeImg: anime.thumbnail,
                type: anime.type,
                airingSeason: anime.season?.quarter + " " + anime.season?.year,
                score: anime.score
            })
        })

        return list;

    } catch (error) {
        return {
            error: true,
            error_message: error
        };
    }
};

export const fetchAllanimeInfo = async ({ animeId, list = {} }) => {
    try {
        if (!animeId) return {
            error: true,
            error_message: "No keyword provided"
        };

        const { data: { data: { show } } } = await axios.get(allanimeApi, {
            params: animeInfoParams(animeId),
            headers: headerAllanime
        });

        let episodes = [];
        const epList = await axios.get(allanimeApi, {
            params: episodeListParams(animeId, 0, show.availableEpisodesDetail.sub.length),
            headers: headerAllanime
        });

        epList.data.data.episodeInfos.map((ep) => {
            episodes.push({
                epNum: ep.episodeIdNum,
                episodeId: `${show._id}$${ep.episodeIdNum}$`,
                episodeTitle: ep.notes?.split("<note-split>")[0],
                episodeThumbnails: ep.thumbnails?.filter((url) => url.startsWith("http"))
            })
        });


        list = {
            animeTitle: show.name,
            animeId: show._id,
            synopsis: show.description,
            animeImg: show.thumbnail,
            images: show.thumbnails,
            totalEpisodes: show.episodeCount,
            type: show.type,
            genres: show.genres,
            score: show.score,
            status: show.status,
            airingSeason: show.season?.quarter + " " + show.season?.year,
            studios: show.studios,
            episodes: episodes.sort((a, b) => a.epNum - b.epNum)
        }

        return list;


    } catch (error) {
        console.log(error)
        return {
            error: true,
            error_message: error
        };
    }
};

export const fetchAllanimeEpisodeSource = async ({ episodeId, episode = {} }) => {
    try {
        if (!episodeId) return {
            error: true,
            error_message: "No keyword provided"
        };

        let animeId = episodeId.split("$")[0];
        let episodeNum = episodeId.split("$")[1];

        const { data } = await axios.get(allanimeApi, {
            params: sourceParams(animeId, episodeNum),
            headers: headerAllanime
        });

        console.log(data.data.episode.sourceUrls)
        const sourceApiLink = data.data.episode.sourceUrls.sort((a, b) => b.priority - a.priority)[0].sourceUrl;
        const sources = await axios.get(`${allanimeSourceUrl}${sourceApiLink.replace('clock', 'clock.json')}`);

        episode = {
            epNum: data.data.episode.episodeString,
            episodeTitle: data.data.episode.episodeInfo.notes?.split("<note-split>")[0],
            sources: sources.data.links
        }

        return episode;

    } catch (error) {
        // console.log(error);
        return {
            error: true,
            error_message: error
        };
    }
};
