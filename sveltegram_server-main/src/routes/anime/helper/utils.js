import axios from 'axios';
export const USER_AGENT = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/107.0.0.0 Safari/537.36";
const headerOption = { headers: { "User-Agent": USER_AGENT } };


// from: https://raw.githubusercontent.com/AnimeJeff/Brohflow/main/keys.json
export const cipher = "sUuzSWVbCkqDDrkz";

export const decodeString = (string) => {
    return Buffer.from(string, 'base64').toString();
}

export const encodeString = (string) => {
    return Buffer.from(string).toString('base64');
};

export const decodeStreamingLinkAnimix = async (animixLiveApiLink) => {
    let plyrLink;

    const animixLiveApiRegex = new RegExp(/(aHR0[^#]+)/)
    if (animixLiveApiLink.includes("player.html")) {
        plyrLink = animixLiveApiLink
    } else {
        const res = await axios.get(animixLiveApiLink, headerOption);

        plyrLink = await res.request.res.responseUrl;
    }

    const sourceLink = decodeString(animixLiveApiRegex.exec(plyrLink)[0]);

    return sourceLink;
};

export const firstLetterToUpperCase = (str) => {
    if (str.toLowerCase().includes("-")) {
        var splitStr = str.toLowerCase().split('-');
        for (var i = 0; i < splitStr.length; i++) {
            splitStr[i] = splitStr[i].charAt(0).toUpperCase() + splitStr[i].substring(1);
        };
        return splitStr.join('-');
    };
    var splitStr = str.toLowerCase().split(' ');
    for (var i = 0; i < splitStr.length; i++) {
        splitStr[i] = splitStr[i].charAt(0).toUpperCase() + splitStr[i].substring(1);
    }
    return splitStr.join(' ');
};

export const range = ({ from = 0, to = 0, step = 1, length = Math.ceil((to - from) / step) }) =>
    Array.from({ length }, (_, i) => from + i * step);


// Functions used from consumet/consumet.ts and justfoolingaround/animdl.

export const ciphered_key = (query, key) => {
    let u = 0;
    let v = 0;
    const arr = range({ from: 0, to: 256 });

    for (let i = 0; i < arr.length; i++) {
        u = (u + arr[i] + key.charCodeAt(i % key.length)) % 256;
        v = arr[i];
        arr[i] = arr[u];
        arr[u] = v;
    }
    u = 0;
    let j = 0;

    let res = '';
    for (let i = 0; i < query.length; i++) {
        j = (j + 1) % 256;
        u = (u + arr[j]) % 256;
        v = arr[j];
        arr[j] = arr[u];
        arr[u] = v;
        res += String.fromCharCode(query.charCodeAt(i) ^ arr[(arr[j] + arr[u]) % 256]);
    }
    return res;
};

export const decrypt_url = (query) => {
    const key = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';
    const p = query?.replace(/[\t\n\f\r]/g, '')?.length % 4 === 0 ? query?.replace(/[==|?|$]/g, '') : query;

    if (p?.length % 4 === 1 || /[^+/0-9A-Za-z]/gm.test(p)) throw new Error('Invalid character.');

    let res = '';
    let i = 0;
    let e = 0;
    let n = 0;
    for (let j = 0; j < p?.length; j++) {
        e = e << 6;
        i = key.indexOf(p[j]);
        e = e | i;
        n += 6;

        if (n === 24) {
            res += String.fromCharCode((16711680 & e) >> 16);
            res += String.fromCharCode((65280 & e) >> 8);
            res += String.fromCharCode(255 & e);
            n = 0;
            e = 0;
        }
    }

    if (12 === n) return res + String.fromCharCode(e >> 4);
    else if (18 === n) {
        e = e >> 2;
        res += String.fromCharCode((65280 & e) >> 8);
        res += String.fromCharCode(255 & e);
    }
    return res;
};
