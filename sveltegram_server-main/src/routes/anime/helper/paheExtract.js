import axios from 'axios';
import { load } from 'cheerio';

const kwikRegex = /(?<=<form action=")(.*)(?=" method)/
const tokenRegex = /(?<="_token" value=")(.*)(?="><button)/

export const paheExtractor = async (url) => {
    let cookie;
    const { data } = await axios.get(url);
    const $ = load(data)

    const kwikRedirectLink = $('a.redirect').attr('href');

    const kwikRes = await axios.get(kwikRedirectLink);
    const $$ = load(kwikRes.data);
    cookie = kwikRes.headers['set-cookie']
    let IMPORTANT;

    const scripttext = $$('script').last().prev().prev().prev().text().trim()
    const replaced = scripttext.replace('return decodeURIComponent(escape', 'IMPORTANT=decodeURIComponent(escape')
    eval(replaced)

    const kwikDlink = kwikRegex.exec(IMPORTANT)[0]
    const token = tokenRegex.exec(IMPORTANT)[0]

    const finalCall = await axios(kwikDlink, {
        method: 'POST',
        headers: {
            Referer: 'https://kwik.cx/',
            "Content-Type": "application/x-www-form-urlencoded",
            "cookie": cookie
        },
        data: new URLSearchParams({ '_token': token }),
        maxRedirects: 0,
        validateStatus: (status => status === 302)
    });


    return finalCall.headers.location;
}