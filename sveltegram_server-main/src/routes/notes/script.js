const express = require("express");
const router = express.Router();
const scriptService = require('../../services/script');
const attributeService = require('../../services/attributes');
const becca = require('../../becca/becca');
const syncService = require('../../services/sync');


router.post ("/exec", (req, res) => {
    try {
        const {body} = req;

        const result = await scriptService.executeScript(
            body.script,
            body.params,
            body.startNoteId,
            body.currentNoteId,
            body.originEntityName,
            body.originEntityId
        );

        return {
            success: true,
            executionResult: result,
            maxEntityChangeId: syncService.getMaxEntityChangeId()
        };
    }
    catch (e) {
        return { success: false, error: e.message };
    }
});


router.post ("/run", (req, res ) => {
    const note = becca.getNote(req.params.noteId);

    const result = scriptService.executeNote(note, { originEntity: note });

    return { executionResult: result };
});

router.get ("/getBundlesWithLabel", (req, res, lable, value) => {
    const notes = attributeService.getNotesWithLabelFast(label, value);

    const bundles = [];

    for (const note of notes) {
        const bundle = scriptService.getScriptBundleForFrontend(note);

        if (bundle) {
            bundles.push(bundle);
        }
    }

    return bundles;
});

router.get ("/getStartupBundles", (req, res) => {
    if (!process.env.TRILIUM_SAFE_MODE) {
        if (req.query.mobile === "true") {
            return getBundlesWithLabel("run", "mobileStartup");
        }
        else {
            return getBundlesWithLabel("run", "frontendStartup");
        }
    }
    else {
        return [];
    }
});

router.get ("/getWidgetBundles", (req, res) => {
    if (!process.env.TRILIUM_SAFE_MODE) {
        return getBundlesWithLabel("widget");
    }
    else {
        return [];
    }
});

router.get ("/getRelationBundles", (req, res) => {
    const noteId = req.params.noteId;
    const note = becca.getNote(noteId);
    const relationName = req.params.relationName;

    const attributes = note.getAttributes();
    const filtered = attributes.filter(attr => attr.type === 'relation' && attr.name === relationName);
    const targetNoteIds = filtered.map(relation => relation.value);
    const uniqueNoteIds = Array.from(new Set(targetNoteIds));

    const bundles = [];

    for (const noteId of uniqueNoteIds) {
        const note = becca.getNote(noteId);

        if (!note.isJavaScript() || note.getScriptEnv() !== 'frontend') {
            continue;
        }

        const bundle = scriptService.getScriptBundleForFrontend(note);

        if (bundle) {
            bundles.push(bundle);
        }
    }

    return bundles;
});

router.get ("/getBundle", (req, res) => {
    const note = becca.getNote(req.params.noteId);

    return scriptService.getScriptBundleForFrontend(note);
});


    

module.exports = router;