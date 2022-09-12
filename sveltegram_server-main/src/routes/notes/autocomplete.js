const express = require("express");
const router = express.Router();
const beccaService = require('../../becca/becca_service');
const searchService = require('../../services/search/services/search');
const log = require('../../services/log');
const utils = require('../../services/utils');
const cls = require('../../services/cls');
const becca = require("../../becca/becca");

router.get ("/getAutocomplete", (req, res) => {
    const query = req.query.query.trim();
    const activeNoteId = req.query.activeNoteId || 'none';

    let results;

    const timestampStarted = Date.now();

    if (query.length === 0) {
        results = getRecentNotes(activeNoteId);
    }
    else {
        results = searchService.searchNotesForAutocomplete(query);
    }

    const msTaken = Date.now() - timestampStarted;

    if (msTaken >= 100) {
        log.info(`Slow autocomplete took ${msTaken}ms`);
    }

    return results;
});

router.get ("/getRecentNotes", (req, res, activeNoteId) => {
    let extraCondition = '';
    const params = [activeNoteId];

    const hoistedNoteId = cls.getHoistedNoteId();
    if (hoistedNoteId !== 'root') {
        extraCondition = `AND recent_notes.notePath LIKE ?`;
        params.push('%' + hoistedNoteId + '%');
    }

    const recentNotes = becca.getRecentNotesFromQuery(`
      SELECT 
        recent_notes.* 
      FROM 
        recent_notes
        JOIN notes USING(noteId)
      WHERE
        notes.isDeleted = 0
        AND notes.noteId != ?
        ${extraCondition}
      ORDER BY 
        utcDateCreated DESC
      LIMIT 200`, params);

    return recentNotes.map(rn => {
        const notePathArray = rn.notePath.split('/');

        const noteTitle = beccaService.getNoteTitle(notePathArray[notePathArray.length - 1]);
        const notePathTitle = beccaService.getNoteTitleForPath(notePathArray);

        return {
            notePath: rn.notePath,
            noteTitle,
            notePathTitle,
            highlightedNotePathTitle: utils.escapeHtml(notePathTitle)
        };
    });
});

module.exports = router;