'use strict';

const nconf = require('nconf');

const databaseController = module.exports;

databaseController.get = async function (req, res) {
	const results = {};
	if (nconf.get('redis')) {
		const rdb = require('../HELP/database/redis');
		results.redis = await rdb.info(rdb.client);
	}
	if (nconf.get('mongo')) {
		const mdb = require('../HELP/database/mongo');
		results.mongo = await mdb.info(mdb.client);
	}
	if (nconf.get('postgres')) {
		const pdb = require('../HELP/database/postgres');
		results.postgres = await pdb.info(pdb.pool);
	}

	res.render('admin/advanced/database', results);
};
