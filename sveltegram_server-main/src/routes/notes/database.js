const express = require("express");
const router = express.Router();
const sql = require('../../services/sql');
const log = require('../../services/log');
const backupService = require('../../services/backup');
const anonymizationService = require('../../services/anonymization');
const consistencyChecksService = require('../../services/consistency_checks');


router.post ("/anonymize", (req, res, async) => {
        return await anonymizationService.createAnonymizedCopy(req.params.type);

});

router.post ("/backupDatabase", (req, res, async ) => {
    return {
        backupFile: await backupService.backupNow("now")
    };
});

router.post ("/vacuumDatabase", (req, res) => {
    sql.execute("VACUUM");

    log.info("Database has been vacuumed.");
});

router.get ("/checkIntegrity", (req, res) => {
    const results = sql.getRows("PRAGMA integrity_check");

    log.info("Integrity check result: " + JSON.stringify(results));

    return {
        results
    };
});

router.post ("/findAndFixConsistencyIssues", (req, res) => {
    consistencyChecksService.runOnDemandChecks(true);

});


module.exports = router;
