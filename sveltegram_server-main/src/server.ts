//dependencies
import express from "express";
//import { Router, Request, Response, NextFunction, urlencoded, json, RequestHandler, ErrorRequestHandler } from "express";
import http from "http";
import https from'https';
import mongoose from "mongoose";
import dotenv from 'dotenv';
//import cors from "cors";
import bodyParser from 'body-parser';
import logger from "morgan";
import path from 'path';
import cookieParser from 'cookie-parser';
import helmet from 'helmet';
import session from 'express-session';
import fs from 'fs';


//import 'newrelic'


//import log from './services/notes/log';
//import ws from './services/notes/ws';
//import utils from './services/notes/utils';
//import sqlInit from './services/notes/sql_init';

//import sessionSecret from './services/notes/session_secret';
//import backupService from './services/notes/backup';
//require('./services/notes/handlers');

//notes
//import fileUploadService from './files';
//import scriptService from '../services/notes/script';
//import sql from '../services/notes/sql';
//import attributeService from '../services/notes/attributes';
//import config from '../services/notes/config';
//import optionService from '../services/notes/options';
//import env from '../services/notes/env';
//import protectedSessionService from "../services/notes/protected_session";
//import entityChangesService from '../services/entity_changes';

//import '../src/Controller/HealthCheckController'
//import '../src/Controller/RevisionsController'
//import '../src/Controller/ItemsController'

//import {createPartialContentHandler} from "express-partial-content";
//import rateLimit from "express-rate-limit";


// middlewares
import realIP from "./middlewares/realIP";
import redisSession from './middlewares/redisSession'
import { getRedisInstance, redisInstanceExists } from "./services/redis/instance";
//import { Authentication } from "./middlewares/Authentication";
//import { Config, initDatabase, initEvent } from "./utils";
//import { ErrorHandler } from "./middlewares/ErrorHandler";
//import { initRateLimits } from "./middlewares/RateLimit";
//import TestClient from "./middlewares/TestClient";
//import { initTranslation } from "./middlewares/Translation";
//import { getAndRemoveAllRequests, ipRequestIncrement } from './services/redis/newRedisWrapper';
//import { initInstance } from "./utils/handlers/Instance";
//import { InversifyExpressServer } from 'inversify-express-utils'
//import { DataSource, LoggerOptions } from 'typeorm'
//import loadMedia from './middlewares/loadMedia';
//import { Config, initDatabase, registerRoutes } from "./utils/";

import cors from "./middlewares/cors";

//import { getRedisInstance, redisInstanceExists } from "./services/redis/instance";
import { getIOInstance } from "./services/socket/instance";
//import { Log } from './Log';
//import { API_ENDPOINT_NOT_FOUND_ERR, SERVER_ERR } from "./errors";
//import {addWebsocket} from './services/ws';
//import {ssr} from "./services/index";
//import {roomAuthenticator, identityAuthenticator} from './routes/auth/index';



//require('./services/initDb')();




//routes


import authRoutes from "./routes/auth/index";
import adminRoutes from './routes/admin/index';
import botroutes from "./routes/bots/index";
import channelroutes from "./routes/channels/index";
import deviceroutes from "./routes/devices/index";
import errorreportroute from "./routes/errorReport/index";
//import discoverroutes from "./routes/discover/discovery";
import exploreroutes from "./routes/explore/index";
//import gatewayroutes from "./routes/explore/index";
//import gifsroutes from "./routes/explore/index";
//import inviteroutes from "./routes/invite/index";
//import metricsRouter from './routes/metrics/index';
import messagesRoutes from './routes/messages/index'; 
import postRoutes from "./routes/posts/post";
//import roomKeyRouter from './routes/rooms/roomKey';
//import liveRoomRouter from './routes/rooms/liveRoom';
import serversroutes from "./routes/servers/index";
import settingsRouter from './routes/settings/index';
//import stickpackroutes from "./routes/invite/index";
import shortsRoutes from "./routes/shorts/shorts";
import storiesRoutes from "./routes/stories/stories";
//import threadroutes from "./routes/stories/stories";
import themesroute from "./routes/themes/index";
import tenorroute from "./routes/tenor/index";

import userRoutes from "./routes/users/index";
import voiceRoutes from "./routes/voice/index";
//import roomroutes from "./routes/rooms/index";



//cdn
//import avatarsRoute from "./routes/cdn/avatars";
//import iconsRoute from "./routes/cdn/role-icons";


// notes
//import treeApiRoute from './routes/notes/tree';
//import notesApiRoute from './routes/notes/notes';
//import branchesApiRoute from './routes/notes/branches';

//import autocompleteApiRoute from './routes/notes/autocomplete';
//import cloningApiRoute from './routes/notes/cloning';
//import noteRevisionsApiRoute from './routes/notes/note_revisions';
//import recentChangesApiRoute from './routes/notes/recent_changes';
//import optionsApiRoute from './routes/notes/options';
//import passwordApiRoute from './routes/notes/password';
//import syncApiRoute from './routes/notes/sync';
//import loginApiRoute from './routes/notes/login';
//import recentNotesRoute from './routes/notes/recent_notes';
//import exportRoute from './routes/notes/export';
//import importRoute from './routes/notes/import';
//import setupApiRoute from './routes/notes/setup';
//import sqlRoute from './routes/notes/sql';
//import databaseRoute from './routes/notes/database';
//import imageRoute from './routes/notes/image';
//import attributesRoute from './routes/notes/attributes';
//import scriptRoute from './routes/notes/script';
//import senderRoute from './routes/notes/sender';
//import filesRoute from './routes/notes/files';
//import searchRoute from './routes/notes/search';
//import specialNotesRoute from './routes/notes/special_notes';
//import noteMapRoute from './routes/notes/note_map';
//import clipperRoute from './routes/notes/clipper';
//import similarNotesRoute from './routes/notes/similar_notes';
//import keysRoute from './routes/notes/keys';
//import statsRoute from './routes/notes/stats';
//import fontsRoute from './routes/notes/fonts';
//import shareRoutes from './routes/notes/share';


const app = express();
app.disable('x-powered-by');
const server = new http.Server(app);
const io = getIOInstance(server);


// log in development environment
if (process.env.NODE_ENV === "development") {
	const morgan = require("morgan");
	app.use(morgan("dev"));
}

/*
app.use(
  cors({
    methods: ["GET", "POST"],
    origin: "*",
    optionsSuccessStatus: 200,
  })
);
*/

app.use(function(req, res, next){
  req.io = io;
  next();
})


//addWebsocket(server);

/*
const sessionParser = session({
    secret: sessionSecret,
    resave: false, // true forces the session to be saved back to the session store, even if the session was never modified during the request.
    saveUninitialized: false, // true forces a session that is "uninitialized" to be saved to the store. A session is uninitialized when it is new but not modified.
    cookie: {
        //    path: "/",
        httpOnly: true,
        maxAge:  24 * 60 * 60 * 1000 // in milliseconds
    },
    name: 'trilium.sid',
    store: new FileStore({
        ttl: 30 * 24 * 3600,
        path: dataDir.TRILIUM_DATA_DIR + '/sessions'
    })
});
app.use(sessionParser);

app.use((err, req, res, next) => {
    if (err.code !== 'EBADCSRFTOKEN') {
        return next(err);
    }

    log.error(`Invalid CSRF token: ${req.headers['x-csrf-token']}, secret: ${req.cookies['_csrf']}`);

    err = new Error('Invalid CSRF token');
    err.status = 403;
    next(err);
});


sqlInit.dbReady.then(async () => {
    try {
        console.log("Starting anonymization...");

        const resp = await backupService.anonymize();

        if (resp.success) {
            console.log("Anonymized file has been saved to: " + resp.anonymizedFilePath);

            process.exit(0);
        } else {
            console.log("Anonymization failed.");
        }
    }
    catch (e) {
        console.error(e.message, e.stack);
    }

    process.exit(1);
});
*/

// triggers sync timer
//require('./services/sync');

// triggers backup timer
//require('./services/backup');

// trigger consistency checks timer
//require('./services/consistency_checks');

//require('./services/scheduler');



  
  //redis://[USER]:[PASSWORD]@[SERVICE-IP]:[PORT]
  // io.adapter(redisAdapter({
  //   host: process.env.REDIS_HOST,
  //   port: process.env.REDIS_PORT,
  //   auth_pass: process.env.REDIS_PASS
  // }));


  // middlewares
  dotenv.config();
  app.use(bodyParser.json({limit: '10mb'}));
  //app.use(express.text({limit: '500mb'}));
  //app.use(express.json({limit: '500mb'}));
  //app.use(express.raw({limit: '500mb'}));
  //app.use(express.urlencoded({extended: false}));
  //app.use(cookieParser());
  app.use(realIP);
  //app.use(ErrorHandler);
  app.use(cors);
  
 
  app.use(redisSession);
  /*
  app.use(express.json()); 
  app.use(
  cors({
    credentials: true,
    origin: process.env.ORIGIN,
    optionsSuccessStatus: 200,
  })
);
*/

//app.use(logger('dev'));
//app.use(ssr);
/*app.use(helmet({
    hidePoweredBy: false, // errors out in electron
    contentSecurityPolicy: false,
    crossOriginEmbedderPolicy: false
}));
*/

/*
setInterval(async () => {
  const [requests, err] = await getAndRemoveAllRequests();
  if (requests) {
    for (const ip in requests) {
      const count = requests[ip];
      if (count >= 100) {
        console.log(`IP: ${ip} is sending a lot of requests (${count} in 60 seconds)`)
      }
    }
  }
}, 60000);
*/


/*
app.use('/*', async (req, res, next) => {
  const [count, err] = await ipRequestIncrement(req.userIP);
  if (count >= 150) {
    res.status(403).json({message: "You have been rate limited!"})
    return;
  }
  next();
})
*/



// routes
// index route
  app.get("/", (req, res) => {
	res.status(200).json({
	  type: "success",
	  message: "server is up and running",
	  data: null,
	});
});


//voice route
app.use('/api/voice', voiceRoutes)

//voice route
app.use('/api/shorts', shortsRoutes)

//room route
//app.use('/api/rooms', roomroutes)

//messages routes
app.use("/api/messages", messagesRoutes);

app.use("/api/admin", adminRoutes);

//channel route
app.use('/api/channels', channelroutes);

//device route
app.use('/api/devices', deviceroutes);

//device errorreportroute
app.use('/api/errorreport', errorreportroute);


//media route
//app.use('/media/*', loadMedia.default);
//app.use('/files/*', require('./files'));

//setting route
app.use('/api/settings', settingsRouter);
//app.use('/themes', require('./themes').ThemeRouter)

//app.use('/api', require('./routes/api'));

//user route
app.use("/api/user", userRoutes);

app.use("/api/post", postRoutes);
app.use("/api/stories", storiesRoutes);
//app.use("/api/shorts", shortsRoutes);

//server routes
app.use("/api/servers", serversroutes);

//channel routes
//app.use("/api/channel", channelroutes);

//gif routes
//app.use("/api/gif", authRoutes);
//app.use('/tenor', require('./tenor').TenorRouter);

//explore routes
app.use("/api/explore", exploreroutes);

//themes routes
app.use("/api/themes", themesroute);

//themes routes
app.use("/api/tenor", tenorroute);


// auth routes
app.use("/api/auth", authRoutes);

//bot routes
app.use("/api/bots", botroutes);

//note routes
//app.use("/api/note", authRoutes);

//command routes

//less important routes
//app.use('/error_report', require('./errorReport'));
//app.use('/devices', require('./devices'));


// rooms route
//app.use('/', indexRouter);
//app.use('/metrics', metricsRouter);
//app.use('/api/v1/rooms/:id/roomKey', roomKeyRouter);
//app.use('/api/v1/rooms/:id/live', liveRoomRouter);
//app.use('/api/v1/', controller('identities', identityAuthenticator));
//app.use('/api/v1/admin/', adminRouter);
/*app.use('/api/v1/', controller( 'rooms', roomAuthenticator,
	  id => id,
	  () => 'room-info'
	)
);
*/

/*
//cdn routes
await initDatabase();
		await Config.init();
		app.use((req, res, next) => {
			res.set("Access-Control-Allow-Origin", "*");
			// TODO: use better CSP policy
			res.set(
				"Content-security-policy",
				"default-src *  data: blob: filesystem: about: ws: wss: 'unsafe-inline' 'unsafe-eval'; script-src * data: blob: 'unsafe-inline' 'unsafe-eval'; connect-src * data: blob: 'unsafe-inline'; img-src * data: blob: 'unsafe-inline'; frame-src * data: blob: ; style-src * data: blob: 'unsafe-inline'; font-src * data: blob: 'unsafe-inline';"
			);
			res.set(
				"Access-Control-Allow-Headers",
				req.header("Access-Control-Request-Headers") || "*"
			);
			res.set(
				"Access-Control-Allow-Methods",
				req.header("Access-Control-Request-Methods") || "*"
		  );
		next();
	});
app.use(bodyParser.json({ inflate: true, limit: "10mb" }));
await registerRoutes(this, path.join(__dirname, "routes/"));

app.use("/icons/", avatarsRoute);
app.use("/role-icons/", iconsRoute);
app.use("/emojis/", avatarsRoute);
app.use("/stickers/", avatarsRoute);
app.use("/banners/", avatarsRoute)
app.use("/splashes/", avatarsRoute);
app.use("/app-icons/", avatarsRoute);
app.use("/app-assets/", avatarsRoute);
app.use("/discover-splashes/", avatarsRoute);
app.use("/team-icons/", avatarsRoute);
app.use("/channel-icons/", avatarsRoute);
*/

//note route
//app.use("/api/note/tree", treeApiRoute);
//app.use("/api/note/branches", branchesApiRoute);
//app.use("/api/note/autocomplete", branchesApiRoute);
//app.use("/api/note/notes", notesApiRoute);
//app.use("/api/note/tree", treeApiRoute);
//app.use("/api/note/tree", treeApiRoute);


// page not found error handling  middleware
app.use("*", (req, res, next) => {
	const error = {
	  status: 404,
	  message: 'API_ENDPOINT_NOT_FOUND_ERR',
	};
	next(error);
});
  
// global error handling middleware
app.use((err, req, res, next) => {
	console.log(err);
	const status = err.status || 500;
	const message = err.message || 'SERVER_ERR';
	const data = err.data || null;
	res.status(status).json({
	  type: "error",
	  message,
	  data,
	});
});

/*
//mongodb
async function main() {
	try {
	  await mongoose.connect(process.env.MONGODB_URI, {
		useNewUrlParser: true,
		useCreateIndex: true,
		useFindAndModify: false,
		useUnifiedTopology: true,
	  });
  
	  console.log("database connected");
  
	  server.listen(process.env.PORT, () => console.log(`Server listening on port ${process.env.PORT}`));
	} catch (error) {
	  console.log(error);
	  process.exit(1);
	}
}
  
main();
*/






// header only contains ALGORITHM & TOKEN TYPE (https://jwt.io/)
process.env.JWT_HEADER = "eyJhbGciOiJIUzI1NiJ9.";


function start() {

	let isListening = false;

	connectMongoDB();
	
	function connectMongoDB() {
		console.log("Connecting to MongoDB...")
		const mongoOptions: mongoose.ConnectOptions = {
			useNewUrlParser: true,
			useUnifiedTopology: true,
			useFindAndModify: false,
			useCreateIndex: true
		};
		mongoose.connect(process.env.MONGODB_ADDRESS, mongoOptions, err => {
      
			if (err) throw err;
			console.log("Connected!")
			connectRedis();
		})
	}
	function connectRedis() {
		console.log("Connecting to Redis...")
		if (redisInstanceExists()) return;
		const client = getRedisInstance({
			host: process.env.REDIS_HOST,
			password: process.env.REDIS_PASS,
			port: parseInt(process.env.REDIS_PORT)
		});
		if (!client) return;
		client.on("ready", () => {
			console.log("Connected!")
			client.flushall();
			startServer();
		});
		client.on("error", err => {
			throw err;
		})
	}
	function startServer() {
		if (isListening) return;
		console.log("Starting server...");

		const socketIO = require('./services/socketIO');

		getIOInstance().on("connection", socketIO);

		const port = process.env.PORT || 4000;
		server.listen(port, function () {
			console.log("Listening on port", port);
		});
	}

}

start();


/*
const maxQueryExecutionTime = env.get('DB_MAX_QUERY_EXECUTION_TIME', true)
  ? +env.get('DB_MAX_QUERY_EXECUTION_TIME', true)
  : 45_000

export const AppDataSource = new DataSource({
  type: 'mysql',
  supportBigNumbers: true,
  bigNumberStrings: false,
  maxQueryExecutionTime,
  replication: {
    master: {
      host: env.get('DB_HOST'),
      port: parseInt(env.get('DB_PORT')),
      username: env.get('DB_USERNAME'),
      password: env.get('DB_PASSWORD'),
      database: env.get('DB_DATABASE'),
    },
    slaves: [
      {
        host: env.get('DB_REPLICA_HOST'),
        port: parseInt(env.get('DB_PORT')),
        username: env.get('DB_USERNAME'),
        password: env.get('DB_PASSWORD'),
        database: env.get('DB_DATABASE'),
      },
    ],
    removeNodeErrorCount: 10,
    restoreNodeTimeout: 5,
  },
  entities: [Item, Revision],
  migrations: [env.get('DB_MIGRATIONS_PATH')],
  migrationsRun: true,
  logging: <LoggerOptions>env.get('DB_DEBUG_LEVEL'),
})






//goodluck adding this in for notes about
/*
	  apiRoute(GET, '/api/tree', treeApiRoute.getTree); done
    apiRoute(POST, '/api/tree/load', treeApiRoute.load); done
    apiRoute(PUT, '/api/branches/:branchId/set-prefix', branchesApiRoute.setPrefix); done

    apiRoute(PUT, '/api/branches/:branchId/move-to/:parentBranchId', branchesApiRoute.moveBranchToParent); done
    apiRoute(PUT, '/api/branches/:branchId/move-before/:beforeBranchId', branchesApiRoute.moveBranchBeforeNote); done
    apiRoute(PUT, '/api/branches/:branchId/move-after/:afterBranchId', branchesApiRoute.moveBranchAfterNote); done
    apiRoute(PUT, '/api/branches/:branchId/expanded/:expanded', branchesApiRoute.setExpanded); done
    apiRoute(PUT, '/api/branches/:branchId/expanded-subtree/:expanded', branchesApiRoute.setExpandedForSubtree); done
    apiRoute(DELETE, '/api/branches/:branchId', branchesApiRoute.deleteBranch); done

    apiRoute(GET, '/api/autocomplete', autocompleteApiRoute.getAutocomplete); done

    apiRoute(GET, '/api/notes/:noteId', notesApiRoute.getNote); done
    apiRoute(PUT, '/api/notes/:noteId/content', notesApiRoute.updateNoteContent); done
    apiRoute(DELETE, '/api/notes/:noteId', notesApiRoute.deleteNote); done
    apiRoute(PUT, '/api/notes/:noteId/undelete', notesApiRoute.undeleteNote); done
    apiRoute(POST, '/api/notes/:parentNoteId/children', notesApiRoute.createNote); done
    apiRoute(PUT, '/api/notes/:noteId/sort-children', notesApiRoute.sortChildNotes); done
    apiRoute(PUT, '/api/notes/:noteId/protect/:isProtected', notesApiRoute.protectNote); done
    apiRoute(PUT, '/api/notes/:noteId/type', notesApiRoute.setNoteTypeMime); done
    apiRoute(GET, '/api/notes/:noteId/revisions', noteRevisionsApiRoute.getNoteRevisions); done
    apiRoute(DELETE, '/api/notes/:noteId/revisions', noteRevisionsApiRoute.eraseAllNoteRevisions); done
    apiRoute(GET, '/api/notes/:noteId/revisions/:noteRevisionId', noteRevisionsApiRoute.getNoteRevision); done
    apiRoute(DELETE, '/api/notes/:noteId/revisions/:noteRevisionId', noteRevisionsApiRoute.eraseNoteRevision); done
    route(GET, '/api/notes/:noteId/revisions/:noteRevisionId/download', [auth.checkApiAuthOrElectron], noteRevisionsApiRoute.downloadNoteRevision); done
    apiRoute(PUT, '/api/notes/:noteId/restore-revision/:noteRevisionId', noteRevisionsApiRoute.restoreNoteRevision); done
    apiRoute(GET, '/api/notes/:noteId/backlink-count', notesApiRoute.getBacklinkCount); done
    apiRoute(POST, '/api/notes/relation-map', notesApiRoute.getRelationMap); done
    apiRoute(POST, '/api/notes/erase-deleted-notes-now', notesApiRoute.eraseDeletedNotesNow); done
    apiRoute(PUT, '/api/notes/:noteId/title', notesApiRoute.changeTitle); done
    apiRoute(POST, '/api/notes/:noteId/duplicate/:parentNoteId', notesApiRoute.duplicateSubtree); done
    apiRoute(POST, '/api/notes/:noteId/upload-modified-file', notesApiRoute.uploadModifiedFile); done

    apiRoute(GET, '/api/edited-notes/:date', noteRevisionsApiRoute.getEditedNotesOnDate); done

    apiRoute(PUT, '/api/notes/:noteId/clone-to-branch/:parentBranchId', cloningApiRoute.cloneNoteToBranch); done
    apiRoute(PUT, '/api/notes/:noteId/clone-to-note/:parentNoteId', cloningApiRoute.cloneNoteToNote); done
    apiRoute(PUT, '/api/notes/:noteId/clone-after/:afterBranchId', cloningApiRoute.cloneNoteAfter); done

    route(GET, '/api/notes/:branchId/export/:type/:format/:version/:taskId', [auth.checkApiAuthOrElectron], exportRoute.exportBranch);
    route(POST, '/api/notes/:parentNoteId/import', [auth.checkApiAuthOrElectron, uploadMiddleware, csrfMiddleware], importRoute.importToBranch, apiResultHandler);

    route(PUT, '/api/notes/:noteId/file', [auth.checkApiAuthOrElectron, uploadMiddleware, csrfMiddleware],
        filesRoute.updateFile, apiResultHandler);

    route(GET, '/api/notes/:noteId/open', [auth.checkApiAuthOrElectron], filesRoute.openFile);
    route(GET, '/api/notes/:noteId/open-partial', [auth.checkApiAuthOrElectron],
        createPartialContentHandler(filesRoute.fileContentProvider, {
            debug: (string, extra) => { console.log(string, extra); }
        }));
    route(GET, '/api/notes/:noteId/download', [auth.checkApiAuthOrElectron], filesRoute.downloadFile);
    // this "hacky" path is used for easier referencing of CSS resources
    route(GET, '/api/notes/download/:noteId', [auth.checkApiAuthOrElectron], filesRoute.downloadFile);
    apiRoute(POST, '/api/notes/:noteId/save-to-tmp-dir', filesRoute.saveToTmpDir);

    apiRoute(GET, '/api/notes/:noteId/attributes', attributesRoute.getEffectiveNoteAttributes); done
    apiRoute(POST, '/api/notes/:noteId/attributes', attributesRoute.addNoteAttribute); done
    apiRoute(PUT, '/api/notes/:noteId/attributes', attributesRoute.updateNoteAttributes); done
    apiRoute(PUT, '/api/notes/:noteId/attribute', attributesRoute.updateNoteAttribute); done
    apiRoute(PUT, '/api/notes/:noteId/set-attribute', attributesRoute.setNoteAttribute); done
    apiRoute(PUT, '/api/notes/:noteId/relations/:name/to/:targetNoteId', attributesRoute.createRelation); done
    apiRoute(DELETE, '/api/notes/:noteId/relations/:name/to/:targetNoteId', attributesRoute.deleteRelation); delete
    apiRoute(DELETE, '/api/notes/:noteId/attributes/:attributeId', attributesRoute.deleteNoteAttribute); done
    apiRoute(GET, '/api/attributes/names', attributesRoute.getAttributeNames); done
    apiRoute(GET, '/api/attributes/values/:attributeName', attributesRoute.getValuesForAttribute); done

    apiRoute(POST, '/api/note-map/:noteId/tree', noteMapRoute.getTreeMap); done
    apiRoute(POST, '/api/note-map/:noteId/link', noteMapRoute.getLinkMap); done
    apiRoute(GET, '/api/note-map/:noteId/backlinks', noteMapRoute.getBacklinks); done

    apiRoute(GET, '/api/special-notes/inbox/:date', specialNotesRoute.getInboxNote); done
    apiRoute(GET, '/api/special-notes/days/:date', specialNotesRoute.getDayNote); done
    apiRoute(GET, '/api/special-notes/weeks/:date', specialNotesRoute.getWeekNote); done
    apiRoute(GET, '/api/special-notes/months/:month', specialNotesRoute.getMonthNote); done
    apiRoute(GET, '/api/special-notes/years/:year', specialNotesRoute.getYearNote); done
    apiRoute(GET, '/api/special-notes/notes-for-month/:month', specialNotesRoute.getDayNotesForMonth); done
    apiRoute(POST, '/api/special-notes/sql-console', specialNotesRoute.createSqlConsole); done
    apiRoute(POST, '/api/special-notes/save-sql-console', specialNotesRoute.saveSqlConsole); done
    apiRoute(POST, '/api/special-notes/search-note', specialNotesRoute.createSearchNote); done
    apiRoute(POST, '/api/special-notes/save-search-note', specialNotesRoute.saveSearchNote); done

    // :filename is not used by trilium, but instead used for "save as" to assign a human readable filename
    route(GET, '/api/images/:noteId/:filename', [auth.checkApiAuthOrElectron], imageRoute.returnImage); done
    route(POST, '/api/images', [auth.checkApiAuthOrElectron, uploadMiddleware, csrfMiddleware], imageRoute.uploadImage, apiResultHandler); done
    route(PUT, '/api/images/:noteId', [auth.checkApiAuthOrElectron, uploadMiddleware, csrfMiddleware], imageRoute.updateImage, apiResultHandler); done

    apiRoute(GET, '/api/recent-changes/:ancestorNoteId', recentChangesApiRoute.getRecentChanges);

    apiRoute(GET, '/api/options', optionsApiRoute.getOptions); done
    // FIXME: possibly change to sending value in the body to avoid host of HTTP server issues with slashes
    apiRoute(PUT, '/api/options/:name/:value*', optionsApiRoute.updateOption); done
    apiRoute(PUT, '/api/options', optionsApiRoute.updateOptions); done
    apiRoute(GET, '/api/options/user-themes', optionsApiRoute.getUserThemes); done

    apiRoute(POST, '/api/password/change', passwordApiRoute.changePassword); done
    apiRoute(POST, '/api/password/reset', passwordApiRoute.resetPassword); done

    apiRoute(POST, '/api/sync/test', syncApiRoute.testSync); done
    apiRoute(POST, '/api/sync/now', syncApiRoute.syncNow); done
    apiRoute(POST, '/api/sync/fill-entity-changes', syncApiRoute.fillEntityChanges); doone
    apiRoute(POST, '/api/sync/force-full-sync', syncApiRoute.forceFullSync); done
    apiRoute(POST, '/api/sync/force-note-sync/:noteId', syncApiRoute.forceNoteSync); done
    route(GET, '/api/sync/check', [auth.checkApiAuth], syncApiRoute.checkSync, apiResultHandler); done
    route(GET, '/api/sync/changed', [auth.checkApiAuth], syncApiRoute.getChanged, apiResultHandler); done
    route(PUT, '/api/sync/update', [auth.checkApiAuth], syncApiRoute.update, apiResultHandler); done
    route(POST, '/api/sync/finished', [auth.checkApiAuth], syncApiRoute.syncFinished, apiResultHandler); done
    route(POST, '/api/sync/check-entity-changes', [auth.checkApiAuth], syncApiRoute.checkEntityChanges, apiResultHandler); done
    route(POST, '/api/sync/queue-sector/:entityName/:sector', [auth.checkApiAuth], syncApiRoute.queueSector, apiResultHandler); done
    route(GET, '/api/sync/stats', [], syncApiRoute.getStats, apiResultHandler); done

    apiRoute(POST, '/api/recent-notes', recentNotesRoute.addRecentNote); done

    // group of services below are meant to be executed from outside
    route(GET, '/api/setup/status', [], setupApiRoute.getStatus, apiResultHandler); done
    route(POST, '/api/setup/new-document', [auth.checkAppNotInitialized], setupApiRoute.setupNewDocument, apiResultHandler, false); done
    route(POST, '/api/setup/sync-from-server', [auth.checkAppNotInitialized], setupApiRoute.setupSyncFromServer, apiResultHandler, false); done
    route(GET, '/api/setup/sync-seed', [auth.checkCredentials], setupApiRoute.getSyncSeed, apiResultHandler); done
    route(POST, '/api/setup/sync-seed', [auth.checkAppNotInitialized], setupApiRoute.saveSyncSeed, apiResultHandler, false); done

    apiRoute(GET, '/api/sql/schema', sqlRoute.getSchema); done
    apiRoute(POST, '/api/sql/execute/:noteId', sqlRoute.execute); done

    route(POST, '/api/database/anonymize/:type', [auth.checkApiAuthOrElectron, csrfMiddleware], databaseRoute.anonymize, apiResultHandler, false); done

    // backup requires execution outside of transaction
    route(POST, '/api/database/backup-database', [auth.checkApiAuthOrElectron, csrfMiddleware], databaseRoute.backupDatabase, apiResultHandler, false); done

    // VACUUM requires execution outside of transaction
    route(POST, '/api/database/vacuum-database', [auth.checkApiAuthOrElectron, csrfMiddleware], databaseRoute.vacuumDatabase, apiResultHandler, false); done
    route(POST, '/api/database/find-and-fix-consistency-issues', [auth.checkApiAuthOrElectron, csrfMiddleware], databaseRoute.findAndFixConsistencyIssues, apiResultHandler, false); done
    apiRoute(GET, '/api/database/check-integrity', databaseRoute.checkIntegrity); done

    apiRoute(POST, '/api/script/exec', scriptRoute.exec); done
    apiRoute(POST, '/api/script/run/:noteId', scriptRoute.run); done
    apiRoute(GET, '/api/script/startup', scriptRoute.getStartupBundles); done
    apiRoute(GET, '/api/script/widgets', scriptRoute.getWidgetBundles); done
    apiRoute(GET, '/api/script/bundle/:noteId', scriptRoute.getBundle); done
    apiRoute(GET, '/api/script/relation/:noteId/:relationName', scriptRoute.getRelationBundles); done

    // no CSRF since this is called from android app
    route(POST, '/api/sender/login', [], loginApiRoute.token, apiResultHandler); done
    route(POST, '/api/sender/image', [auth.checkEtapiToken, uploadMiddleware], senderRoute.uploadImage, apiResultHandler); done
    route(POST, '/api/sender/note', [auth.checkEtapiToken], senderRoute.saveNote, apiResultHandler); done

    apiRoute(GET, '/api/quick-search/:searchString', searchRoute.quickSearch); done
    apiRoute(GET, '/api/search-note/:noteId', searchRoute.searchFromNote); done
    apiRoute(POST, '/api/search-and-execute-note/:noteId', searchRoute.searchAndExecute); done
    apiRoute(POST, '/api/search-related', searchRoute.getRelatedNotes); done
    apiRoute(GET, '/api/search/:searchString', searchRoute.search); done
    apiRoute(GET, '/api/search-templates', searchRoute.searchTemplates); done

    apiRoute(POST, '/api/bulk-action/execute', bulkActionRoute.execute);
    apiRoute(POST, '/api/bulk-action/affected-notes', bulkActionRoute.getAffectedNoteCount);

    route(POST, '/api/login/sync', [], loginApiRoute.loginSync, apiResultHandler); done
    // this is for entering protected mode so user has to be already logged-in (that's the reason we don't require username)
    apiRoute(POST, '/api/login/protected', loginApiRoute.loginToProtectedSession); done
    apiRoute(POST, '/api/login/protected/touch', loginApiRoute.touchProtectedSession); done
    apiRoute(POST, '/api/logout/protected', loginApiRoute.logoutFromProtectedSession); done
    route(POST, '/api/login/token', [], loginApiRoute.token, apiResultHandler); done

    route(GET, '/api/clipper/handshake', clipperMiddleware, clipperRoute.handshake, apiResultHandler); done
    route(POST, '/api/clipper/clippings', clipperMiddleware, clipperRoute.addClipping, apiResultHandler); dpne
    route(POST, '/api/clipper/notes', clipperMiddleware, clipperRoute.createNote, apiResultHandler); done
    route(POST, '/api/clipper/open/:noteId', clipperMiddleware, clipperRoute.openNote, apiResultHandler); done

    apiRoute(GET, '/api/similar-notes/:noteId', similarNotesRoute.getSimilarNotes); done

    apiRoute(GET, '/api/keyboard-actions', keysRoute.getKeyboardActions); done
    apiRoute(GET, '/api/keyboard-shortcuts-for-notes', keysRoute.getShortcutsForNotes); done

    apiRoute(GET, '/api/stats/note-size/:noteId', statsRoute.getNoteSize); done
    apiRoute(GET, '/api/stats/subtree-size/:noteId', statsRoute.getSubtreeSize); done

    apiRoute(POST, '/api/delete-notes-preview', notesApiRoute.getDeleteNotesPreview); done

    route(GET, '/api/fonts', [auth.checkApiAuthOrElectron], fontsRoute.getFontCss); done

    
*/
