const express = require("express");
const router = express.Router();
const sqlInit = require('../../services/sql_init');
const setupService = require('../../services/setup');
const log = require('../../services/log');
const appInfo = require('../../services/app_info');


router.get ("/getStatus", (req, res) => {
    return {
        isInitialized: sqlInit.isDbInitialized(),
        schemaExists: sqlInit.schemaExists(),
        syncVersion: appInfo.syncVersion
    };
});

router.post ("/setupNewDocument", (req, res, async) => {
    await sqlInit.createInitialDatabase();
});

router.post ("/setupSyncFromServer", (req, res) => {
    const { syncServerHost, syncProxy, password } = req.body;

    return setupService.setupSyncFromSyncServer(syncServerHost, syncProxy, password);
});

router.post ("/saveSyncSeed", (req, res) => {
    const {options, syncVersion} = req.body;

    if (appInfo.syncVersion !== syncVersion) {
        const message = `Could not setup sync since local sync protocol version is ${appInfo.syncVersion} while remote is ${syncVersion}. To fix this issue, use same Trilium version on all instances.`;

        log.error(message);

        return [400, {
            error: message
        }]
    }

    log.info("Saved sync seed.");

    sqlInit.createDatabaseForSync(options);
});

router.get ("/getSyncSeed", (req, res) => {
    log.info("Serving sync seed.");

    return {
        options: setupService.getSyncSeedOptions(),
        syncVersion: appInfo.syncVersion
    };
});

module.exports = router;
