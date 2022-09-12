const express = require("express");
const router = express.Router();
const syncService = require('../../services/notes/sync');
const syncUpdateService = require('../../services/notes/sync_update');
const entityChangesService = require('../../services/notes/entity_changes');
const sql = require('../../services/notes/sql');
const sqlInit = require('../../services/notes/sql_init');
const optionService = require('../../services/notes/options');
const contentHashService = require('../../services/notes/content_hash');
const log = require('../../services/notes/log');
const syncOptions = require('../../services/notes/sync_options');
const dateUtils = require('../../services/notes/date_utils');
const utils = require('../../services/notes/utils');
const ws = require('../../services/notes/ws');



router.post ("/testSync", (req, res) => {
    try {
        if (!syncOptions.isSyncSetup()) {
            return { success: false, message: "Sync server host is not configured. Please configure sync first." };
        }

        await syncService.login();

        // login was successful so we'll kick off sync now
        // this is important in case when sync server has been just initialized
        syncService.sync();

        return { success: true, message: "Sync server handshake has been successful, sync has been started." };
    }
    catch (e) {
        return {
            success: false,
            message: e.message
        };
    }
});

router.get ("/getStats", (req, res) => {
    if (!sqlInit.schemaExists()) {
        // fail silently but prevent errors from not existing options table
        return {};
    }

    const stats = {
        initialized: sql.getValue("SELECT value FROM options WHERE name = 'initialized'") === 'true',
        outstandingPullCount: syncService.getOutstandingPullCount()
    };

    log.info(`Returning sync stats: ${JSON.stringify(stats)}`);

    return stats;
});

router.get ("/checkSync", (req, res) => {
    return {
        entityHashes: contentHashService.getEntityHashes(),
        maxEntityChangeId: sql.getValue('SELECT COALESCE(MAX(id), 0) FROM entity_changes WHERE isSynced = 1')
    };
});

router.post ("/syncNow", (req, res) => {
    log.info("Received request to trigger sync now.");

    // when explicitly asked for set in progress status immediatelly for faster user feedback
    ws.syncPullInProgress();

    return syncService.sync();
});

router.post ("/fillEntityChanges", (req, res) => {
    entityChangesService.fillAllEntityChanges();

    log.info("Sync rows have been filled.");
});

router.post ("/forceFullSync", (req, res) => {
    optionService.setOption('lastSyncedPull', 0);
    optionService.setOption('lastSyncedPush', 0);

    log.info("Forcing full sync.");

    // not awaiting for the job to finish (will probably take a long time)
    syncService.sync();
});

router.post ("/forceNoteSync", (req, res) => {
    const noteId = req.params.noteId;

    const now = dateUtils.utcNowDateTime();

    sql.execute(`UPDATE notes SET utcDateModified = ? WHERE noteId = ?`, [now, noteId]);
    entityChangesService.moveEntityChangeToTop('notes', noteId);

    sql.execute(`UPDATE note_contents SET utcDateModified = ? WHERE noteId = ?`, [now, noteId]);
    entityChangesService.moveEntityChangeToTop('note_contents', noteId);

    for (const branchId of sql.getColumn("SELECT branchId FROM branches WHERE noteId = ?", [noteId])) {
        sql.execute(`UPDATE branches SET utcDateModified = ? WHERE branchId = ?`, [now, branchId]);

        entityChangesService.moveEntityChangeToTop('branches', branchId);
    }

    for (const attributeId of sql.getColumn("SELECT attributeId FROM attributes WHERE noteId = ?", [noteId])) {
        sql.execute(`UPDATE attributes SET utcDateModified = ? WHERE attributeId = ?`, [now, attributeId]);

        entityChangesService.moveEntityChangeToTop('attributes', attributeId);
    }

    for (const noteRevisionId of sql.getColumn("SELECT noteRevisionId FROM note_revisions WHERE noteId = ?", [noteId])) {
        sql.execute(`UPDATE note_revisions SET utcDateModified = ? WHERE noteRevisionId = ?`, [now, noteRevisionId]);
        entityChangesService.moveEntityChangeToTop('note_revisions', noteRevisionId);

        sql.execute(`UPDATE note_revision_contents SET utcDateModified = ? WHERE noteRevisionId = ?`, [now, noteRevisionId]);
        entityChangesService.moveEntityChangeToTop('note_revision_contents', noteRevisionId);
    }

    log.info("Forcing note sync for " + noteId);

    // not awaiting for the job to finish (will probably take a long time)
    syncService.sync();
});

router.get ("/getChanged", (req, res) => {
    const startTime = Date.now();

    let lastEntityChangeId = parseInt(req.query.lastEntityChangeId);
    const clientinstanceId = req.query.instanceId;
    let filteredEntityChanges = [];

    while (filteredEntityChanges.length === 0) {
        const entityChanges = sql.getRows(`
            SELECT *
            FROM entity_changes
            WHERE isSynced = 1
              AND id > ?
            ORDER BY id
            LIMIT 1000`, [lastEntityChangeId]);

        if (entityChanges.length === 0) {
            break;
        }

        filteredEntityChanges = entityChanges.filter(ec => ec.instanceId !== clientinstanceId);

        if (filteredEntityChanges.length === 0) {
            lastEntityChangeId = entityChanges[entityChanges.length - 1].id;
        }
    }

    const entityChangeRecords = syncService.getEntityChangeRecords(filteredEntityChanges);

    if (entityChangeRecords.length > 0) {
        lastEntityChangeId = entityChangeRecords[entityChangeRecords.length - 1].entityChange.id;
    }

    const ret = {
        entityChanges: entityChangeRecords,
        lastEntityChangeId,
        outstandingPullCount: sql.getValue(`
            SELECT COUNT(id) 
            FROM entity_changes 
            WHERE isSynced = 1 
              AND instanceId != ?
              AND id > ?`, [clientinstanceId, lastEntityChangeId])
    };

    if (ret.entityChanges.length > 0) {
        log.info(`Returning ${ret.entityChanges.length} entity changes in ${Date.now() - startTime}ms`);
    }

    return ret;
});

const partialRequests = {};


router.put ("/update", (req, res) => {
    let {body} = req;

    const pageCount = parseInt(req.get('pageCount'));
    const pageIndex = parseInt(req.get('pageIndex'));

    if (pageCount !== 1) {
        const requestId = req.get('requestId');

        if (pageIndex === 0) {
            partialRequests[requestId] = {
                createdAt: Date.now(),
                payload: ''
            };
        }

        if (!partialRequests[requestId]) {
            throw new Error(`Partial request ${requestId}, index ${pageIndex} of ${pageCount} of pages does not have expected record.`);
        }

        partialRequests[requestId].payload += req.body;

        log.info(`Receiving partial request ${requestId}, page index ${pageIndex} out of ${pageCount} pages.`);

        if (pageIndex !== pageCount - 1) {
            return;
        }
        else {
            body = JSON.parse(partialRequests[requestId].payload);
            delete partialRequests[requestId];
        }
    }

    const {entities, instanceId} = body;

    for (const {entityChange, entity} of entities) {
        syncUpdateService.updateEntity(entityChange, entity, instanceId);
    }
});

setInterval(() => {
    for (const key in partialRequests) {
        if (Date.now() - partialRequests[key].createdAt > 5 * 60 * 1000) {
            log.info(`Cleaning up unfinished partial requests for ${key}`);

            delete partialRequests[key];
        }
    }
}, 60 * 1000);


router.post ("/syncFinished", (req, res) => {
     // after first sync finishes, the application is ready to be used
    // this is meaningless but at the same time harmless (idempotent) for further syncs
    sqlInit.setDbAsInitialized();
});

router.post ("/queueSector", (req, res) => {
    const entityName = utils.sanitizeSqlIdentifier(req.params.entityName);
    const sector = utils.sanitizeSqlIdentifier(req.params.sector);

    entityChangesService.addEntityChangesForSector(entityName, sector);
});

router.post ("/checkEntityChanges", (req, res) => {
    const consistencyChecks = require("../../services/consistency_checks");
    consistencyChecks.runEntityChangesChecks();
});



module.exports = router;