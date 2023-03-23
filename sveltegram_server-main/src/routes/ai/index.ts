import express from "express";
const router = express.Router();





import fs from 'fs';
import { pathToFileURL } from 'url';
import { KeyvFile } from 'keyv-file';
import ChatGPTClient from './ChatGPTClient.js';
import ChatGPTBrowserClient from './ChatGPTBrowserClient.js';
import BingAIClient from './BingAIClient.js';

const arg = process.argv.find(_arg => _arg.startsWith('--settings'));
const path = arg?.split('=')[1] ?? './settings.js';

let settings;
//bug
if (fs.existsSync(path)) {
    // get the full path
    const fullPath = fs.realpathSync(path);
    settings = ( import(pathToFileURL(fullPath).toString()));
} else {
    if (arg) {
        console.error('Error: the file specified by the --settings parameter does not exist.');
    } else {
        console.error('Error: the settings.js file does not exist.');
    }
    process.exit(1);
}

if (settings.storageFilePath && !settings.cacheOptions.store) {
    // make the directory and file if they don't exist
    const dir = settings.storageFilePath.split('/').slice(0, -1).join('/');
    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
    }
    if (!fs.existsSync(settings.storageFilePath)) {
        fs.writeFileSync(settings.storageFilePath, '');
    }

    settings.cacheOptions.store = new KeyvFile({ filename: settings.storageFilePath });
}

const clientToUse = settings.apiOptions?.clientToUse || settings.clientToUse || 'chatgpt';
const perMessageClientOptionsWhitelist = settings.apiOptions?.perMessageClientOptionsWhitelist || null;


router.post('/conversation', async (req, res, reply) => {
    const body = req.body || {};
    const abortController = new AbortController();

    res.on('close', () => {
        if (abortController.signal.aborted === false) {
            abortController.abort();
        }
    });

    let onProgress;
    if (body.stream === true) {
        onProgress = (token) => {
            if (settings.apiOptions?.debug) {
                console.debug(token);
            }
            if (token !== '[DONE]') {
                res.write({ id: '', data: JSON.stringify(token) });
            }
        };
    } else {
        onProgress = null;
    }

    let result;
    let error;
    try {
        if (!body.message) {
            let invalidError = new Error();
            // noinspection ExceptionCaughtLocallyJS
            throw invalidError;
        }

        let clientToUseForMessage = clientToUse;
        const clientOptions = filterClientOptions(body.clientOptions, clientToUseForMessage);
        if (clientOptions && clientOptions.clientToUse) {
            clientToUseForMessage = clientOptions.clientToUse;
            delete clientOptions.clientToUse;
        }

        const messageClient = getClient(clientToUseForMessage);

        result = await messageClient.sendMessage(body.message, {
            jailbreakConversationId: body.jailbreakConversationId,
            conversationId: body.conversationId ? body.conversationId.toString() : undefined,
            parentMessageId: body.parentMessageId ? body.parentMessageId.toString() : undefined,
            conversationSignature: body.conversationSignature,
            clientId: body.clientId,
            invocationId: body.invocationId,
            shouldGenerateTitle: settings.apiOptions?.generateTitles || false, // only used for ChatGPTClient
            clientOptions,
            onProgress,
            abortController,
        });
    } catch (e) {
        error = e;
    }

    if (result !== undefined) {
        if (settings.apiOptions?.debug) {
            console.debug(result);
        }
        if (body.stream === true) {
            res.write({ event: 'result', id: '', data: JSON.stringify(result) });
            res.write({ id: '', data: '[DONE]' });
            await nextTick();
            return res.end();
        }
        return res.send(result);
    }

    const code = error?.data?.code || 503;
    if (code === 503) {
        console.error(error);
    } else if (settings.apiOptions?.debug) {
        console.debug(error);
    }
    const message = error?.data?.message || `There was an error communicating with ${clientToUse === 'bing' ? 'Bing' : 'ChatGPT'}.`;
    if (body.stream === true) {
        res.write({
            id: '',
            event: 'error',
            data: JSON.stringify({
                code,
                error: message,
            }),
        });
        await nextTick();
        return res.end();
    }
    return res.send(code).send({ error: message });
});


function nextTick() {
    return new Promise(resolve => setTimeout(resolve, 0));
}

function getClient(clientToUseForMessage) {
    switch (clientToUseForMessage) {
        case 'bing':
            return new BingAIClient({ ...settings.bingAiClient, cache: settings.cacheOptions });
        case 'chatgpt-browser':
            return new ChatGPTBrowserClient(
                settings.chatGptBrowserClient,
                settings.cacheOptions,
            );
        case 'chatgpt':
            return new ChatGPTClient(
                settings.openaiApiKey || settings.chatGptClient.openaiApiKey,
                settings.chatGptClient,
                settings.cacheOptions,
            );
        default:
            throw new Error(`Invalid clientToUse: ${clientToUseForMessage}`);
    }
}

/**
 * Filter objects to only include whitelisted properties set in
 * `settings.js` > `apiOptions.perMessageClientOptionsWhitelist`.
 * Returns original object if no whitelist is set.
 * @param {*} inputOptions
 * @param clientToUseForMessage
 */
function filterClientOptions(inputOptions, clientToUseForMessage) {
    if (!inputOptions || !perMessageClientOptionsWhitelist) {
        return null;
    }

    // If inputOptions.clientToUse is set and is in the whitelist, use it instead of the default
    if (
        perMessageClientOptionsWhitelist.validClientsToUse
        && inputOptions.clientToUse
        && perMessageClientOptionsWhitelist.validClientsToUse.includes(inputOptions.clientToUse)
    ) {
        clientToUseForMessage = inputOptions.clientToUse;
    } else {
        inputOptions.clientToUse = clientToUseForMessage;
    }

    const whitelist = perMessageClientOptionsWhitelist[clientToUseForMessage];
    if (!whitelist) {
        // No whitelist, return all options
        return inputOptions;
    }

    const outputOptions = {
        clientToUse: clientToUseForMessage,
    };

    for (const property of Object.keys(inputOptions)) {
        const allowed = whitelist.includes(property);

        if (!allowed && typeof inputOptions[property] === 'object') {
            // Check for nested properties
            for (const nestedProp of Object.keys(inputOptions[property])) {
                const nestedAllowed = whitelist.includes(`${property}.${nestedProp}`);
                if (nestedAllowed) {
                    outputOptions[property] = outputOptions[property] || {};
                    outputOptions[property][nestedProp] = inputOptions[property][nestedProp];
                }
            }
            continue;
        }

        // Copy allowed properties to outputOptions
        if (allowed) {
            outputOptions[property] = inputOptions[property];
        }
    }

    return outputOptions;
}









export default router;



// NUMBER 2
/*
* GPT-3 REST API example using serverless node.js and codehooks.io
*/

/*
import { app, Datastore } from 'codehooks-js';
import fetch from 'node-fetch';


// REST API routes
app.post('/chat', async (req, res) => {
    if (!process.env.OPENAI_API_KEY) return res.status(500).end('Please add your OPENAI_API_KEY'); // CLI command: coho set-env OPENAI_API_KEY 'XXX' 
    const { ask } = req.body;
    const db = await Datastore.open();
    const cacheKey = 'chatgpt_cache_' + ask;

    // check cache first    
    const cachedAnswer = await db.get(cacheKey);

    // get from cache or OpenAi
    if (cachedAnswer) {
        res.end(cachedAnswer)
    } else { // get from Open AI API

        // pick text element from the OpenAI response by JS nested destructuring
        const { choices: { 0: { text } } } = await callOpenAiApi(ask);
        console.log(ask, text);

        // add to cache for 1 minute
        await db.set(cacheKey, text, { ttl: 60 * 1000 });
        // send text back to client
        res.end(text);
    }
})

// Call OpenAI API
async function callOpenAiApi(ask) {

    const raw = JSON.stringify({
        "model": "text-davinci-003",
        "prompt": ask,
        "temperature": 0.6,
        "max_tokens": 1024,
        "stream": false
    });

    var requestOptions = {
        method: 'POST',
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${process.env.OPENAI_API_KEY}`
        },
        body: raw,
        redirect: 'follow'
    };

    const response = await fetch("https://api.openai.com/v1/completions", requestOptions);
    return response.json();

}

// global middleware to IP rate limit traffic
app.use(async (req, res, next) => {
    const db = await Datastore.open();
    // get client IP address
    const ipAddress = req.headers['x-real-ip'];
    // increase count for IP
    const count = await db.incr('IP_count_' + ipAddress, 1, { ttl: 60 * 1000 })
    console.log(ipAddress, count);
    if (count > 10) {
        // too many calls
        res.status(429).end("Sorry too many requests for this IP");
    } else {
        // ok to proceed
        next();
    }
})

// Export app to the serverless runtime
export default app.init();
*/