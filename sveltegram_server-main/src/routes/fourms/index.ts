const express = require('express');

const uploadsController = require('../controllers/uploads');
const helpers = require('./helpers');
const posts = require('./posts');
const topics = require('../topics');
const user = require('../user');
const categories = require('./categories');
const meta = require('../meta');
const helpers = require('../controllers/helpers');
const privileges = require('../privileges');
const db = require('../database');
const utils = require('../utils');
const controllers404 = require('../controllers/404');

const middlewares = [middleware.exposeUid, middleware.canViewUsers];
	const accountMiddlewares = [
		middleware.exposeUid,
		middleware.ensureLoggedIn,
		middleware.canViewUsers,
		middleware.checkAccountPermissions,
	];





	const middlewares = [middleware.authenticateRequest];
	const router = express.Router();
	app.use('/api', router);

	router.get('/config', [...middlewares, middleware.applyCSRF], helpers.tryRoute(controllers.api.getConfig));

	router.get('/self', [...middlewares], helpers.tryRoute(controllers.user.getCurrentUser));
	router.get('/user/uid/:uid', [...middlewares, middleware.canViewUsers], helpers.tryRoute(controllers.user.getUserByUID));
	router.get('/user/username/:username', [...middlewares, middleware.canViewUsers], helpers.tryRoute(controllers.user.getUserByUsername));
	router.get('/user/email/:email', [...middlewares, middleware.canViewUsers], helpers.tryRoute(controllers.user.getUserByEmail));

	router.get('/user/:userslug/export/posts', [...middlewares, middleware.authenticateRequest, middleware.ensureLoggedIn, middleware.checkAccountPermissions, middleware.exposeUid], helpers.tryRoute(controllers.user.exportPosts));
	router.get('/user/:userslug/export/uploads', [...middlewares, middleware.authenticateRequest, middleware.ensureLoggedIn, middleware.checkAccountPermissions, middleware.exposeUid], helpers.tryRoute(controllers.user.exportUploads));
	router.get('/user/:userslug/export/profile', [...middlewares, middleware.authenticateRequest, middleware.ensureLoggedIn, middleware.checkAccountPermissions, middleware.exposeUid], helpers.tryRoute(controllers.user.exportProfile));

	// Deprecated, remove in v1.20.0
	router.get('/user/uid/:userslug/export/:type', (req, res) => {
		winston.warn(`[router] \`/api/user/uid/${req.params.userslug}/export/${req.params.type}\` is deprecated, call it \`/api/user/${req.params.userslug}/export/${req.params.type}\`instead.`);
		res.redirect(`/api/user/${req.params.userslug}/export/${req.params.type}`);
	});

	router.get('/categories/:cid/moderators', [...middlewares], helpers.tryRoute(controllers.api.getModerators));
	router.get('/recent/posts/:term?', [...middlewares], helpers.tryRoute(controllers.posts.getRecentPosts));
	router.get('/unread/total', [...middlewares, middleware.ensureLoggedIn], helpers.tryRoute(controllers.unread.unreadTotal));
	router.get('/topic/teaser/:topic_id', [...middlewares], helpers.tryRoute(controllers.topics.teaser));
	router.get('/topic/pagination/:topic_id', [...middlewares], helpers.tryRoute(controllers.topics.pagination));

	const multipart = require('connect-multiparty');
	const multipartMiddleware = multipart();
	const postMiddlewares = [
		middleware.maintenanceMode,
		multipartMiddleware,
		middleware.validateFiles,
		middleware.uploads.ratelimit,
		middleware.applyCSRF,
	];

	router.post('/post/upload', postMiddlewares, helpers.tryRoute(uploadsController.uploadPost));
	router.post('/user/:userslug/uploadpicture', [
		...middlewares,
		...postMiddlewares,
		middleware.exposeUid,
		middleware.ensureLoggedIn,
		middleware.canViewUsers,
		middleware.checkAccountPermissions,
	], helpers.tryRoute(controllers.accounts.edit.uploadPicture));
};


//meta data
router.get('/sitemap.xml', controllers.sitemap.render);
router.get('/sitemap/pages.xml', controllers.sitemap.getPages);
router.get('/sitemap/categories.xml', controllers.sitemap.getCategories);
router.get(/\/sitemap\/topics\.(\d+)\.xml/, controllers.sitemap.getTopicPage);
router.get('/robots.txt', controllers.robots);
router.get('/manifest.webmanifest', controllers.manifest);
router.get('/css/previews/:theme', controllers.admin.themes.get);
router.get('/osd.xml', controllers.osd.handle);
router.get('/service-worker.js', (req, res) => {
	res.status(200).type('application/javascript').set('Service-Worker-Allowed', `${nconf.get('relative_path')}/`).sendFile(path.join(__dirname, '../../public/src/service-worker.js'));
});


//user
router.get('/me', [], middleware.redirectMeToUserslug);
router.get('/me/*', [], middleware.redirectMeToUserslug);
router.get('/uid/:uid*', [], middleware.redirectUidToUserslug);

router.get(`/${name}/:userslug`, middlewares, controllers.accounts.profile.get);
router.get(`/${name}/:userslug/following`, middlewares, controllers.accounts.follow.getFollowing);
router.get(`/${name}/:userslug/followers`, middlewares, controllers.accounts.follow.getFollowers);

router.get(`/${name}/:userslug/posts`, middlewares, controllers.accounts.posts.getPosts);
router.get(`/${name}/:userslug/topics`, middlewares, controllers.accounts.posts.getTopics);
router.get(`/${name}/:userslug/best`, middlewares, controllers.accounts.posts.getBestPosts);
router.get(`/${name}/:userslug/controversial`, middlewares, controllers.accounts.posts.getControversialPosts);
router.get(`/${name}/:userslug/groups`, middlewares, controllers.accounts.groups.get);

router.get(`/${name}/:userslug/categories`, accountMiddlewares, controllers.accounts.categories.get);
router.get(`/${name}/:userslug/bookmarks`, accountMiddlewares, controllers.accounts.posts.getBookmarks);
router.get(`/${name}/:userslug/watched`, accountMiddlewares, controllers.accounts.posts.getWatchedTopics);
router.get(`/${name}/:userslug/ignored`, accountMiddlewares, controllers.accounts.posts.getIgnoredTopics);
router.get(`/${name}/:userslug/upvoted`, accountMiddlewares, controllers.accounts.posts.getUpVotedPosts);
router.get(`/${name}/:userslug/downvoted`, accountMiddlewares, controllers.accounts.posts.getDownVotedPosts);
router.get(`/${name}/:userslug/edit`, accountMiddlewares, controllers.accounts.edit.get);
router.get(`/${name}/:userslug/edit/username`, accountMiddlewares, controllers.accounts.edit.username);
router.get(`/${name}/:userslug/edit/email`, accountMiddlewares, controllers.accounts.edit.email);
router.get(`/${name}/:userslug/edit/password`, accountMiddlewares, controllers.accounts.edit.password);
	app.use('/.well-known/change-password', (req, res) => {
		res.redirect('/me/edit/password');
	});
router.get(`/${name}/:userslug/info`, accountMiddlewares, controllers.accounts.info.get);
router.get(`/${name}/:userslug/settings`, accountMiddlewares, controllers.accounts.settings.get);
router.get(`/${name}/:userslug/uploads`, accountMiddlewares, controllers.accounts.uploads.get);
router.get(`/${name}/:userslug/consent`, accountMiddlewares, controllers.accounts.consent.get);
router.get(`/${name}/:userslug/blocks`, accountMiddlewares, controllers.accounts.blocks.getBlocks);
router.get(`/${name}/:userslug/sessions`, accountMiddlewares, controllers.accounts.sessions.get);

router.get('/notifications', [middleware.ensureLoggedIn], controllers.accounts.notifications.get);
router.get(`/${name}/:userslug/chats/:roomid?`, middlewares, controllers.accounts.chats.get);
router.get('/chats/:roomid?', [middleware.ensureLoggedIn], controllers.accounts.chats.redirectToChat);


//admin
const middlewares = [middleware.pluginHooks];

router.get(`/${name}`, middlewares, controllers.admin.routeIndex);

router.get(`/${name}/dashboard`, middlewares, controllers.admin.dashboard.get);
router.get(`/${name}/dashboard/logins`, middlewares, controllers.admin.dashboard.getLogins);
router.get(`/${name}/dashboard/users`, middlewares, controllers.admin.dashboard.getUsers);
router.get(`/${name}/dashboard/topics`, middlewares, controllers.admin.dashboard.getTopics);
router.get(`/${name}/dashboard/searches`, middlewares, controllers.admin.dashboard.getSearches);

router.get(`/${name}/manage/categories`, middlewares, controllers.admin.categories.getAll);
router.get(`/${name}/manage/categories/:category_id`, middlewares, controllers.admin.categories.get);
router.get(`/${name}/manage/categories/:category_id/analytics`, middlewares, controllers.admin.categories.getAnalytics);

router.get(`/${name}/manage/privileges/:cid?`, middlewares, controllers.admin.privileges.get);
router.get(`/${name}/manage/tags`, middlewares, controllers.admin.tags.get);

router.get(`/${name}/manage/users`, middlewares, controllers.admin.users.index);
router.get(`/${name}/manage/registration`, middlewares, controllers.admin.users.registrationQueue);

router.get(`/${name}/manage/admins-mods`, middlewares, controllers.admin.adminsMods.get);

router.get(`/${name}/manage/groups`, middlewares, controllers.admin.groups.list);
router.get(`/${name}/manage/groups/:name`, middlewares, controllers.admin.groups.get);

router.get(`/${name}/manage/uploads`, middlewares, controllers.admin.uploads.get);
router.get(`/${name}/manage/digest`, middlewares, controllers.admin.digest.get);

router.get(`/${name}/settings/email`, middlewares, controllers.admin.settings.email);
router.get(`/${name}/settings/user`, middlewares, controllers.admin.settings.user);
router.get(`/${name}/settings/post`, middlewares, controllers.admin.settings.post);
router.get(`/${name}/settings/languages`, middlewares, controllers.admin.settings.languages);
router.get(`/${name}/settings/navigation`, middlewares, controllers.admin.settings.navigation);
router.get(`/${name}/settings/homepage`, middlewares, controllers.admin.settings.homepage);
router.get(`/${name}/settings/social`, middlewares, controllers.admin.settings.social);
router.get(`/${name}/settings/:term?`, middlewares, controllers.admin.settings.get);

router.get(`/${name}/appearance/:term?`, middlewares, controllers.admin.appearance.get);

router.get(`/${name}/extend/plugins`, middlewares, controllers.admin.plugins.get);
router.get(`/${name}/extend/widgets`, middlewares, controllers.admin.extend.widgets.get);
router.get(`/${name}/extend/rewards`, middlewares, controllers.admin.extend.rewards.get);

router.get(`/${name}/advanced/database`, middlewares, controllers.admin.database.get);
router.get(`/${name}/advanced/events`, middlewares, controllers.admin.events.get);
router.get(`/${name}/advanced/hooks`, middlewares, controllers.admin.hooks.get);
router.get(`/${name}/advanced/logs`, middlewares, controllers.admin.logs.get);
router.get(`/${name}/advanced/errors`, middlewares, controllers.admin.errors.get);
router.get(`/${name}/advanced/errors/export`, middlewares, controllers.admin.errors.export);
router.get(`/${name}/advanced/cache`, middlewares, controllers.admin.cache.get);

router.get(`/${name}/development/logger`, middlewares, controllers.admin.logger.get);
router.get(`/${name}/development/info`, middlewares, controllers.admin.info.get);




function apiRoutes(router, name, middleware, controllers) {
	router.get(`/api/${name}/users/csv`, middleware.ensureLoggedIn, helpers.tryRoute(controllers.admin.users.getCSV));
	router.get(`/api/${name}/groups/:groupname/csv`, middleware.ensureLoggedIn, helpers.tryRoute(controllers.admin.groups.getCSV));
	router.get(`/api/${name}/analytics`, middleware.ensureLoggedIn, helpers.tryRoute(controllers.admin.dashboard.getAnalytics));
	router.get(`/api/${name}/advanced/cache/dump`, middleware.ensureLoggedIn, helpers.tryRoute(controllers.admin.cache.dump));

	const multipart = require('connect-multiparty');
	const multipartMiddleware = multipart();

	const middlewares = [multipartMiddleware, middleware.validateFiles, middleware.applyCSRF, middleware.ensureLoggedIn];

	router.post(`/api/${name}/category/uploadpicture`, middlewares, helpers.tryRoute(controllers.admin.uploads.uploadCategoryPicture));
	router.post(`/api/${name}/uploadfavicon`, middlewares, helpers.tryRoute(controllers.admin.uploads.uploadFavicon));
	router.post(`/api/${name}/uploadTouchIcon`, middlewares, helpers.tryRoute(controllers.admin.uploads.uploadTouchIcon));
	router.post(`/api/${name}/uploadMaskableIcon`, middlewares, helpers.tryRoute(controllers.admin.uploads.uploadMaskableIcon));
	router.post(`/api/${name}/uploadlogo`, middlewares, helpers.tryRoute(controllers.admin.uploads.uploadLogo));
	router.post(`/api/${name}/uploadOgImage`, middlewares, helpers.tryRoute(controllers.admin.uploads.uploadOgImage));
	router.post(`/api/${name}/upload/file`, middlewares, helpers.tryRoute(controllers.admin.uploads.uploadFile));
	router.post(`/api/${name}/uploadDefaultAvatar`, middlewares, helpers.tryRoute(controllers.admin.uploads.uploadDefaultAvatar));


//main
router.get('/login', loginRegisterMiddleware, controllers.login);
router.get('/register', loginRegisterMiddleware, controllers.register);
router.get('/register/complete', [], controllers.registerInterstitial);
router.get('/compose', [], controllers.composer.get);
router.get('/confirm/:code', [], controllers.confirmEmail);
router.get('/outgoing', [], controllers.outgoing);
router.get('/search', [], controllers.search.search);
router.get('/reset/:code?', [middleware.delayLoading], controllers.reset);
router.get('/tos', [], controllers.termsOfUse);

router.get('/email/unsubscribe/:token', [], controllers.accounts.settings.unsubscribe);
	app.post('/email/unsubscribe/:token', controllers.accounts.settings.unsubscribePost);

	app.post('/compose', middleware.applyCSRF, controllers.composer.post);
};

_mounts.mod = (app, middleware, controllers) => {
router.get('/flags', [], controllers.mods.flags.list);
router.get('/flags/:flagId', [], controllers.mods.flags.detail);
router.get('/post-queue/:id?', [], controllers.mods.postQueue);
};

_mounts.globalMod = (app, middleware, controllers) => {
router.get('/ip-blacklist', [], controllers.globalMods.ipBlacklist);
router.get('/registration-queue', [], controllers.globalMods.registrationQueue);
};

_mounts.topic = (app, name, middleware, controllers) => {
router.get(`/${name}/:topic_id/:slug/:post_index?`, [], controllers.topics.get);
router.get(`/${name}/:topic_id/:slug?`, [], controllers.topics.get);
};

_mounts.post = (app, name, middleware, controllers) => {
	const middlewares = [
		middleware.maintenanceMode,
		middleware.authenticateRequest,
		middleware.registrationComplete,
		middleware.pluginHooks,
	];
	app.get(`/${name}/:pid`, middleware.busyCheck, middlewares, controllers.posts.redirectToPost);
	app.get(`/api/${name}/:pid`, middlewares, controllers.posts.redirectToPost);
};

_mounts.tags = (app, name, middleware, controllers) => {
router.get(`/${name}/:tag`, [middleware.privateTagListing], controllers.tags.getTag);
router.get(`/${name}`, [middleware.privateTagListing], controllers.tags.getTags);
};

_mounts.category = (app, name, middleware, controllers) => {
router.get('/categories', [], controllers.categories.list);
router.get('/popular', [], controllers.popular.get);
router.get('/recent', [], controllers.recent.get);
router.get('/top', [], controllers.top.get);
router.get('/unread', [middleware.ensureLoggedIn], controllers.unread.get);

router.get(`/${name}/:category_id/:slug/:topic_index`, [], controllers.category.get);
router.get(`/${name}/:category_id/:slug?`, [], controllers.category.get);
};

_mounts.users = (app, name, middleware, controllers) => {
	const middlewares = [middleware.canViewUsers];

router.get(`/${name}`, middlewares, controllers.users.index);
};

_mounts.groups = (app, name, middleware, controllers) => {
	const middlewares = [middleware.canViewGroups];

router.get(`/${name}`, middlewares, controllers.groups.list);
router.get(`/${name}/:slug`, middlewares, controllers.groups.details);
router.get(`/${name}/:slug/members`, middlewares, controllers.groups.members);
};

module.exports = async function (app, middleware) {
	const router = express.Router();
	router.render = function (...args) {
		app.render(...args);
	};

	// Allow plugins/themes to mount some routes elsewhere
	const remountable = ['admin', 'category', 'topic', 'post', 'users', 'user', 'groups', 'tags'];
	const { mounts } = await plugins.hooks.fire('filter:router.add', {
		mounts: remountable.reduce((memo, mount) => {
			memo[mount] = mount;
			return memo;
		}, {}),
	});
	// Guard against plugins sending back missing/extra mounts
	Object.keys(mounts).forEach((mount) => {
		if (!remountable.includes(mount)) {
			delete mounts[mount];
		} else if (typeof mount !== 'string') {
			mounts[mount] = mount;
		}
	});
	remountable.forEach((mount) => {
		if (!mounts.hasOwnProperty(mount)) {
			mounts[mount] = mount;
		}
	});

	router.all('(/+api|/+api/*?)', middleware.prepareAPI);
	router.all(`(/+api/admin|/+api/admin/*?${mounts.admin !== 'admin' ? `|/+api/${mounts.admin}|/+api/${mounts.admin}/*?` : ''})`, middleware.authenticateRequest, middleware.ensureLoggedIn, middleware.admin.checkPrivileges);
	router.all(`(/+admin|/+admin/*?${mounts.admin !== 'admin' ? `|/+${mounts.admin}|/+${mounts.admin}/*?` : ''})`, middleware.ensureLoggedIn, middleware.applyCSRF, middleware.admin.checkPrivileges);

	app.use(middleware.stripLeadingSlashes);

	// handle custom homepage routes
	router.use('/', controllers.home.rewrite);

	// homepage handled by `action:homepage.get:[route]`
	setupPageRoute(router, '/', [], controllers.home.pluginHook);

	await plugins.reloadRoutes({ router: router });
	await authRoutes.reloadRoutes({ router: router });
	await writeRoutes.reload({ router: router });
	addCoreRoutes(app, router, middleware, mounts);

	winston.info('[router] Routes added');
};

function addCoreRoutes(app, router, middleware, mounts) {
	_mounts.meta(router, middleware, controllers);
	_mounts.api(router, middleware, controllers);
	_mounts.feed(router, middleware, controllers);

	_mounts.main(router, middleware, controllers);
	_mounts.mod(router, middleware, controllers);
	_mounts.globalMod(router, middleware, controllers);

	addRemountableRoutes(app, router, middleware, mounts);

	const relativePath = nconf.get('relative_path');
	app.use(relativePath || '/', router);

	if (process.env.NODE_ENV === 'development') {
		require('./debug')(app, middleware, controllers);
	}

	app.use(middleware.privateUploads);

	const statics = [
		{ route: '/assets', path: path.join(__dirname, '../../build/public') },
		{ route: '/assets', path: path.join(__dirname, '../../public') },
	];
	const staticOptions = {
		maxAge: app.enabled('cache') ? 5184000000 : 0,
	};

	if (path.resolve(__dirname, '../../public/uploads') !== nconf.get('upload_path')) {
		statics.unshift({ route: '/assets/uploads', path: nconf.get('upload_path') });
	}

	statics.forEach((obj) => {
		app.use(relativePath + obj.route, middleware.addUploadHeaders, express.static(obj.path, staticOptions));
	});
	app.use(`${relativePath}/uploads`, (req, res) => {
		res.redirect(`${relativePath}/assets/uploads${req.path}?${meta.config['cache-buster']}`);
	});
	app.use(`${relativePath}/plugins`, (req, res) => {
		winston.warn(`${chalk.bold.red('[deprecation]')} The \`/plugins\` shorthand prefix is deprecated, prefix with \`/assets/plugins\` instead (path: ${req.path})`);
		res.redirect(`${relativePath}/assets/plugins${req.path}${req._parsedUrl.search || ''}`);
	});

	// Skins
	meta.css.supportedSkins.forEach((skin) => {
		app.use(`${relativePath}/assets/client-${skin}.css`, middleware.buildSkinAsset);
	});

	app.use(controllers['404'].handle404);
	app.use(controllers.errors.handleURIErrors);
	app.use(controllers.errors.handleErrors);
}

function addRemountableRoutes(app, router, middleware, mounts) {
	Object.keys(mounts).map(async (mount) => {
		const original = mount;
		mount = mounts[original];

		if (!mount) { // do not mount at all
			winston.warn(`[router] Not mounting /${original}`);
			return;
		}

		if (mount !== original) {
			// Set up redirect for fallback handling (some js/tpls may still refer to the traditional mount point)
			winston.info(`[router] /${original} prefix re-mounted to /${mount}. Requests to /${original}/* will now redirect to /${mount}`);
			router.use(new RegExp(`/(api/)?${original}`), (req, res) => {
				controllerHelpers.redirect(res, `${nconf.get('relative_path')}/${mount}${req.path}`);
			});
		}

		_mounts[original](router, mount, middleware, controllers);
	});
}



	





	