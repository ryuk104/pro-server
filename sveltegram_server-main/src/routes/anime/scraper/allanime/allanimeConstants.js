//All constants, variables and extensions for allanime scraping

const USER_AGENT = `Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/108.0.0.0 Safari/537.36`;

//  --> only subs for now, will add dubs later


const recentEpisodeParams = {
    variables: {
        search: {
            sortBy: "Recent",
            allowAdult: true
        },
        limit: 26,
        page: 1,
        translationType: "sub",
        countryOrigin: "JP"
    },
    extensions: {
        persistedQuery: {
            version: 1,
            sha256Hash: "9c7a8bc1e095a34f2972699e8105f7aaf9082c6e1ccd56eab99c2f1a971152c6"
        }
    }
}

const searchParams = (q) => {
    return {
        variables: {
            search: {
                allowAdult: true,
                query: q
            },
            limit: 30,
            page: 1,
            translationType: "sub"
        },
        extensions: {
            persistedQuery: {
                version: 1,
                sha256Hash: "9c7a8bc1e095a34f2972699e8105f7aaf9082c6e1ccd56eab99c2f1a971152c6"
            }
        }
    }
}

const animeInfoParams = (id) => {
    return {
        variables: {
            _id: id
        },
        extensions: {
            persistedQuery: {
                version: 1,
                sha256Hash: "f73a8347df0e3e794f8955a18de6e85ac25dfc6b74af8ad613edf87bb446a854"
            }
        }
    }
}

const episodeListParams = (id, epNumStart, epNumEnd) => {
    return {
        variables: {
            showId: id,
            episodeNumStart: epNumStart,
            episodeNumEnd: Number(epNumEnd)
        },
        extensions: {
            persistedQuery: {
                version: 1,
                sha256Hash: "73d998d209d6d8de325db91ed8f65716dce2a1c5f4df7d304d952fa3f223c9e8"
            }
        }
    }
}

const sourceParams = (id, epNum) => {
    return {
        variables: {
            showId: id,
            translationType: "sub",
            episodeString: `${epNum}`
        },
        extensions: {
            persistedQuery: {
                version: 1,
                sha256Hash: "1f0a5d6c9ce6cd3127ee4efd304349345b0737fbf5ec33a60bbc3d18e3bb7c61"
            }
        }
    }
}

const headerAllanime = {
    "Host": "allanime.to",
    "User-Agent": USER_AGENT
};


export {
    recentEpisodeParams,
    searchParams,
    animeInfoParams,
    episodeListParams,
    sourceParams,
    headerAllanime
}