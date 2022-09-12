const express = require("express");
const router = express.Router();
const sql = require('../../services/sql');
const becca = require("../../becca/becca");


router.get ("/getSchema", (req, res) => {
    const tableNames = sql.getColumn(`SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%' ORDER BY name`);
    const tables = [];

    for (const tableName of tableNames) {
        tables.push({
            name: tableName,
            columns: sql.getRows(`PRAGMA table_info(${tableName})`)
        });
    }

    return tables;
});

router.post ("/execute", (req, res) => {
    const note = becca.getNote(req.params.noteId);

    if (!note) {
        return [404, `Note ${req.params.noteId} was not found.`];
    }

    const queries = note.getContent().split("\n---");

    try {
        const results = [];

        for (let query of queries) {
            query = query.trim();

            if (!query) {
                continue;
            }

            if (query.toLowerCase().startsWith('select')) {
                results.push(sql.getRows(query));
            }
            else {
                results.push(sql.execute(query));
            }
        }

        return {
            success: true,
            results
        };
    }
    catch (e) {
        return {
            success: false,
            error: e.message
        };
    }
});

module.exports = router;
