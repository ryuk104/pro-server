import axios from 'axios';
import CryptoJS from 'crypto-js';
import { load } from 'cheerio';

const USER_AGENT = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/103.0.0.0 Safari/537.36";
const headerOption = { "User-Agent": USER_AGENT, "X-Requested-With": "XMLHttpRequest" };

const decryptKeyLink = "https://raw.githubusercontent.com/consumet/rapidclown/main/key.txt";

export const scrapeSource = async (serverId) => {
    const res = await axios.get(`https://zoro.to//ajax/v2/episode/sources?id=${serverId}`, {
        headers: headerOption
    })
    const rapidLink = res.data.link;

    const rapidId = rapidLink?.split("/").pop().split("?")[0];
    const rapidAjax = await axios.get(`https://rapid-cloud.co/ajax/embed-6/getSources?id=${rapidId}`, {
        headers: headerOption
    });

    const sources = rapidAjax.data.sources;
    let decryptKey = await axios.get("https://github.com/enimax-anime/key/blob/e6/key.txt");

    const $ = load(decryptKey.data);

    const source = CryptoJS.AES.decrypt(sources, $('#LC1').text()).toString(CryptoJS.enc.Utf8);
    return {
        sources: JSON.parse(source),
        tracks: rapidAjax.data.tracks
    }
}