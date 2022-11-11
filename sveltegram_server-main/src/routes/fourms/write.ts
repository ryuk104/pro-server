const router = require('express').Router();
const middleware = require('../../middleware');
const controllers = require('../../controllers');
const routeHelpers = require('../helpers');
const writeControllers = require('../../controllers/write');





Write.reload = async (params) => {
	const { router } = params;
	let apiSettings = await meta.settings.get('core.api');
	plugins.hooks.register('core', {
		hook: 'action:settings.set',
		method: async (data) => {
			if (data.plugin === 'core.api') {
				apiSettings = await meta.settings.get('core.api');
			}
		},
	});

	router.use('/api/v3', (req, res, next) => {
		// Require https if configured so
		if (apiSettings.requireHttps === 'on' && req.protocol !== 'https') {
			res.set('Upgrade', 'TLS/1.0, HTTP/1.1');
			return helpers.formatApiResponse(426, res);
		}

		res.locals.isAPI = true;
		next();
	});

	router.use('/api/v3/users', require('./users')());
	router.use('/api/v3/groups', require('./groups')());
	router.use('/api/v3/categories', require('./categories')());
	router.use('/api/v3/topics', require('./topics')());
	router.use('/api/v3/posts', require('./posts')());
	router.use('/api/v3/chats', require('./chats')());
	router.use('/api/v3/flags', require('./flags')());
	router.use('/api/v3/admin', require('./admin')());
	router.use('/api/v3/files', require('./files')());
	router.use('/api/v3/utilities', require('./utilities')());

	router.get('/api/v3/ping', writeControllers.utilities.ping.get);
	router.post('/api/v3/ping', middleware.authenticateRequest, middleware.ensureLoggedIn, writeControllers.utilities.ping.post);

	/**
	 * Plugins can add routes to the Write API by attaching a listener to the
	 * below hook. The hooks added to the passed-in router will be mounted to
	 * `/api/v3/plugins`.
	 */
	const pluginRouter = require('express').Router();
	await plugins.hooks.fire('static:api.routes', {
		router: pluginRouter,
		middleware,
		helpers,
	});
	winston.info(`[api] Adding ${pluginRouter.stack.length} route(s) to \`api/v3/plugins\``);
	router.use('/api/v3/plugins', pluginRouter);

	// 404 handling
	router.use('/api/v3', (req, res) => {
		helpers.formatApiResponse(404, res);
	});
};

Write.cleanup = (req) => {
	if (req && req.session) {
		req.session.destroy();
	}
};






























//admin
router.put('/settings/:setting', [...middlewares, middleware.checkRequired.bind(null, ['value'])], controllers.write.admin.updateSetting);
router.get('/analytics', [...middlewares], controllers.write.admin.getAnalyticsKeys);
router.get('/analytics/:set', [...middlewares], controllers.write.admin.getAnalyticsData);


//catergories
router.post('/', [...middlewares, middleware.checkRequired.bind(null, ['name'])], controllers.write.categories.create);
router.get('/:cid', [], controllers.write.categories.get);
router.put('/:cid', [...middlewares], controllers.write.categories.update);
router.delete('/:cid', [...middlewares], controllers.write.categories.delete);

router.get('/:cid/privileges', [...middlewares], controllers.write.categories.getPrivileges);
router.put('/:cid/privileges/:privilege', [...middlewares, middleware.checkRequired.bind(null, ['member'])], controllers.write.categories.setPrivilege);
router.delete('/:cid/privileges/:privilege', [...middlewares, middleware.checkRequired.bind(null, ['member'])], controllers.write.categories.setPrivilege);

router.put('/:cid/moderator/:uid', [...middlewares], controllers.write.categories.setModerator);
router.delete('/:cid/moderator/:uid', [...middlewares], controllers.write.categories.setModerator);

//chat
router.get('/', [...middlewares], controllers.write.chats.list);
router.post('/', [...middlewares, middleware.checkRequired.bind(null, ['uids'])], controllers.write.chats.create);

router.get('head', '/:roomId', [...middlewares, middleware.assert.room], controllers.write.chats.exists);
router.get('/:roomId', [...middlewares, middleware.assert.room], controllers.write.chats.get);
router.post('/:roomId', [...middlewares, middleware.assert.room, middleware.checkRequired.bind(null, ['message'])], controllers.write.chats.post);
router.put('/:roomId', [...middlewares, middleware.assert.room, middleware.checkRequired.bind(null, ['name'])], controllers.write.chats.rename);
// no route for room deletion, noted here just in case...

router.get('/:roomId/users', [...middlewares, middleware.assert.room], controllers.write.chats.users);
router.post('/:roomId/users', [...middlewares, middleware.assert.room, middleware.checkRequired.bind(null, ['uids'])], controllers.write.chats.invite);
router.delete('/:roomId/users', [...middlewares, middleware.assert.room, middleware.checkRequired.bind(null, ['uids'])], controllers.write.chats.kick);
router.delete('/:roomId/users/:uid', [...middlewares, middleware.assert.room, middleware.assert.user], controllers.write.chats.kickUser);

router.get('/:roomId/messages', [...middlewares, middleware.assert.room], controllers.write.chats.messages.list);
router.get('/:roomId/messages/:mid', [...middlewares, middleware.assert.room, middleware.assert.message], controllers.write.chats.messages.get);
router.put('/:roomId/messages/:mid', [...middlewares, middleware.assert.room, middleware.assert.message], controllers.write.chats.messages.edit);
router.post('/:roomId/messages/:mid', [...middlewares, middleware.assert.room, middleware.assert.message], controllers.write.chats.messages.restore);
router.delete('/:roomId/messages/:mid', [...middlewares, middleware.assert.room, middleware.assert.message], controllers.write.chats.messages.delete);



//files
// router.put('/', [
	//  ...middlewares,
	//  middleware.checkRequired.bind(null, ['path']),
	//  middleware.assert.folder
	// ], controllers.write.files.upload);
	router.delete('/', [
		...middlewares,
		middleware.checkRequired.bind(null, ['path']),
		middleware.assert.path,
	], controllers.write.files.delete);

	router.put('/folder', [
		...middlewares,
		middleware.checkRequired.bind(null, ['path', 'folderName']),
		middleware.assert.path,
		// Should come after assert.path
		middleware.assert.folderName,
	], controllers.write.files.createFolder);


//flags

router.post('/', [...middlewares], controllers.write.flags.create);

router.get('/:flagId', [...middlewares, middleware.assert.flag], controllers.write.flags.get);
router.put('/:flagId', [...middlewares, middleware.assert.flag], controllers.write.flags.update);
router.delete('/:flagId', [...middlewares, middleware.assert.flag], controllers.write.flags.delete);

router.post('/:flagId/notes', [...middlewares, middleware.assert.flag], controllers.write.flags.appendNote);
router.delete('/:flagId/notes/:datetime', [...middlewares, middleware.assert.flag], controllers.write.flags.deleteNote);


//group
router.post('/', [...middlewares, middleware.checkRequired.bind(null, ['name'])], controllers.write.groups.create);
router.get('head', '/:slug', [middleware.assert.group], controllers.write.groups.exists);
router.put('/:slug', [...middlewares, middleware.assert.group], controllers.write.groups.update);
router.delete('/:slug', [...middlewares, middleware.assert.group], controllers.write.groups.delete);
router.put('/:slug/membership/:uid', [...middlewares, middleware.assert.group], controllers.write.groups.join);
router.delete('/:slug/membership/:uid', [...middlewares, middleware.assert.group], controllers.write.groups.leave);
router.put('/:slug/ownership/:uid', [...middlewares, middleware.assert.group], controllers.write.groups.grant);
router.delete('/:slug/ownership/:uid', [...middlewares, middleware.assert.group], controllers.write.groups.rescind);


//posts
router.get('/:pid', [], controllers.write.posts.get);
// There is no POST route because you POST to a topic to create a new post. Intuitive, no?
router.put('/:pid', [...middlewares, middleware.checkRequired.bind(null, ['content'])], controllers.write.posts.edit);
router.delete('/:pid', [...middlewares, middleware.assert.post], controllers.write.posts.purge);

router.put('/:pid/state', [...middlewares, middleware.assert.post], controllers.write.posts.restore);
router.delete('/:pid/state', [...middlewares, middleware.assert.post], controllers.write.posts.delete);

router.put('/:pid/move', [...middlewares, middleware.assert.post, middleware.checkRequired.bind(null, ['tid'])], controllers.write.posts.move);

router.put('/:pid/vote', [...middlewares, middleware.checkRequired.bind(null, ['delta']), middleware.assert.post], controllers.write.posts.vote);
router.delete('/:pid/vote', [...middlewares, middleware.assert.post], controllers.write.posts.unvote);

router.put('/:pid/bookmark', [...middlewares, middleware.assert.post], controllers.write.posts.bookmark);
router.delete('/:pid/bookmark', [...middlewares, middleware.assert.post], controllers.write.posts.unbookmark);

router.get('/:pid/diffs', [middleware.assert.post], controllers.write.posts.getDiffs);
router.get('/:pid/diffs/:since', [middleware.assert.post], controllers.write.posts.loadDiff);
router.put('/:pid/diffs/:since', [...middlewares, middleware.assert.post], controllers.write.posts.restoreDiff);
router.delete('/:pid/diffs/:timestamp', [...middlewares, middleware.assert.post], controllers.write.posts.deleteDiff);


//topics
const multipart = require('connect-multiparty');
const multipartMiddleware = multipart();

router.post('/', [middleware.checkRequired.bind(null, ['cid', 'title', 'content'])], controllers.write.topics.create);
router.get('/:tid', [], controllers.write.topics.get);
router.post('/:tid', [middleware.checkRequired.bind(null, ['content']), middleware.assert.topic], controllers.write.topics.reply);
router.delete('/:tid', [...middlewares], controllers.write.topics.purge);

router.put('/:tid/state', [...middlewares], controllers.write.topics.restore);
router.delete('/:tid/state', [...middlewares], controllers.write.topics.delete);

router.put('/:tid/pin', [...middlewares, middleware.assert.topic], controllers.write.topics.pin);
router.delete('/:tid/pin', [...middlewares], controllers.write.topics.unpin);

router.put('/:tid/lock', [...middlewares], controllers.write.topics.lock);
router.delete('/:tid/lock', [...middlewares], controllers.write.topics.unlock);

router.put('/:tid/follow', [...middlewares, middleware.assert.topic], controllers.write.topics.follow);
router.delete('/:tid/follow', [...middlewares, middleware.assert.topic], controllers.write.topics.unfollow);
router.put('/:tid/ignore', [...middlewares, middleware.assert.topic], controllers.write.topics.ignore);
router.delete('/:tid/ignore', [...middlewares, middleware.assert.topic], controllers.write.topics.unfollow); // intentional, unignore == unfollow

router.put('/:tid/tags', [...middlewares, middleware.checkRequired.bind(null, ['tags']), middleware.assert.topic], controllers.write.topics.addTags);
router.delete('/:tid/tags', [...middlewares, middleware.assert.topic], controllers.write.topics.deleteTags);

router.get('/:tid/thumbs', [], controllers.write.topics.getThumbs);
router.post('/:tid/thumbs', [multipartMiddleware, middleware.validateFiles, middleware.uploads.ratelimit, ...middlewares], controllers.write.topics.addThumb);
router.put('/:tid/thumbs', [...middlewares, middleware.checkRequired.bind(null, ['tid'])], controllers.write.topics.migrateThumbs);
router.delete('/:tid/thumbs', [...middlewares, middleware.checkRequired.bind(null, ['path'])], controllers.write.topics.deleteThumb);
router.put('/:tid/thumbs/order', [...middlewares, middleware.checkRequired.bind(null, ['path', 'order'])], controllers.write.topics.reorderThumbs);

router.get('/:tid/events', [middleware.assert.topic], controllers.write.topics.getEvents);
router.delete('/:tid/events/:eventId', [middleware.assert.topic], controllers.write.topics.deleteEvent);


//user
router.post('/', [...middlewares, middleware.checkRequired.bind(null, ['username'])], controllers.write.users.create);
router.delete('/', [...middlewares, middleware.checkRequired.bind(null, ['uids'])], controllers.write.users.deleteMany);

router.get('head', '/:uid', [middleware.assert.user], controllers.write.users.exists);
router.get('/:uid', [...middlewares, middleware.assert.user], controllers.write.users.get);
router.put('/:uid', [...middlewares, middleware.assert.user], controllers.write.users.update);
router.delete('/:uid', [...middlewares, middleware.assert.user], controllers.write.users.delete);
router.put('/:uid/picture', [...middlewares, middleware.assert.user], controllers.write.users.changePicture);
router.delete('/:uid/content', [...middlewares, middleware.assert.user], controllers.write.users.deleteContent);
router.delete('/:uid/account', [...middlewares, middleware.assert.user], controllers.write.users.deleteAccount);

router.put('/:uid/settings', [...middlewares, middleware.checkRequired.bind(null, ['settings'])], controllers.write.users.updateSettings);

router.put('/:uid/password', [...middlewares, middleware.checkRequired.bind(null, ['newPassword']), middleware.assert.user], controllers.write.users.changePassword);

router.put('/:uid/follow', [...middlewares, middleware.assert.user], controllers.write.users.follow);
router.delete('/:uid/follow', [...middlewares, middleware.assert.user], controllers.write.users.unfollow);

router.put('/:uid/ban', [...middlewares, middleware.assert.user], controllers.write.users.ban);
router.delete('/:uid/ban', [...middlewares, middleware.assert.user], controllers.write.users.unban);

router.put('/:uid/mute', [...middlewares, middleware.assert.user], controllers.write.users.mute);
router.delete('/:uid/mute', [...middlewares, middleware.assert.user], controllers.write.users.unmute);

router.post('/:uid/tokens', [...middlewares, middleware.assert.user], controllers.write.users.generateToken);
router.delete('/:uid/tokens/:token', [...middlewares, middleware.assert.user], controllers.write.users.deleteToken);

router.delete('/:uid/sessions/:uuid', [...middlewares, middleware.assert.user], controllers.write.users.revokeSession);

router.post('/:uid/invites', middlewares, controllers.write.users.invite);
router.get('/:uid/invites/groups', [...middlewares, middleware.assert.user], controllers.write.users.getInviteGroups);

router.get('/:uid/emails', [...middlewares, middleware.assert.user], controllers.write.users.listEmails);
router.get('/:uid/emails/:email', [...middlewares, middleware.assert.user], controllers.write.users.getEmail);
router.post('/:uid/emails/:email/confirm', [...middlewares, middleware.assert.user], controllers.write.users.confirmEmail);

router.get('head', '/:uid/exports/:type', [...middlewares, middleware.assert.user, middleware.checkAccountPermissions], controllers.write.users.checkExportByType);
router.get('/:uid/exports/:type', [...middlewares, middleware.assert.user, middleware.checkAccountPermissions], controllers.write.users.getExportByType);
router.post('/:uid/exports/:type', [...middlewares, middleware.assert.user, middleware.checkAccountPermissions], controllers.write.users.generateExportsByType);

	// Shorthand route to access user routes by userslug
router.all('/+bySlug/:userslug*?', [], controllers.write.users.redirectBySlug);


