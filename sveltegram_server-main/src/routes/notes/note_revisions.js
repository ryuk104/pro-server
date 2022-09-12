const express = require("express");
const router = express.Router();
const beccaService = require('../../becca/becca_service');
const protectedSessionService = require('../../services/protected_session');
const noteRevisionService = require('../../services/note_revisions');
const utils = require('../../services/utils');
const sql = require('../../services/sql');
const path = require('path');
const becca = require("../../becca/becca");

router.get ("/getNoteRevisions", (req, res) => {
    return becca.getNoteRevisionsFromQuery(`
        SELECT note_revisions.*,
               LENGTH(note_revision_contents.content) AS contentLength
        FROM note_revisions
        JOIN note_revision_contents ON note_revisions.noteRevisionId = note_revision_contents.noteRevisionId 
        WHERE noteId = ?
        ORDER BY utcDateCreated DESC`, [req.params.noteId]);
});

router.get ("/getNoteRevision", (req, res) => {
    const noteRevision = becca.getNoteRevision(req.params.noteRevisionId);

    if (noteRevision.type === 'file') {
        if (noteRevision.isStringNote()) {
            noteRevision.content = noteRevision.getContent().substr(0, 10000);
        }
    }
    else {
        noteRevision.content = noteRevision.getContent();

        if (noteRevision.content && noteRevision.type === 'image') {
            noteRevision.content = noteRevision.content.toString('base64');
        }
    }

    return noteRevision;
});


/**
 * @param {NoteRevision} noteRevision
 * @return {string}
 */


 router.get ("/getRevisionFilename", (req, res) => {
    let filename = utils.formatDownloadTitle(noteRevision.title, noteRevision.type, noteRevision.mime);

    const extension = path.extname(filename);
    const date = noteRevision.dateCreated
        .substr(0, 19)
        .replace(' ', '_')
        .replace(/[^0-9_]/g, '');

    if (extension) {
        filename = filename.substr(0, filename.length - extension.length)
            + '-' + date + extension;
    }
    else {
        filename += '-' + date;
    }

    return filename;
});

router.get ("/downloadNoteRevision", (req, res) => {
    const noteRevision = becca.getNoteRevision(req.params.noteRevisionId);

    if (noteRevision.noteId !== req.params.noteId) {
        return res.status(400).send(`Note revision ${req.params.noteRevisionId} does not belong to note ${req.params.noteId}`);
    }

    if (noteRevision.isProtected && !protectedSessionService.isProtectedSessionAvailable()) {
        return res.status(401).send("Protected session not available");
    }

    const filename = getRevisionFilename(noteRevision);

    res.setHeader('Content-Disposition', utils.getContentDisposition(filename));
    res.setHeader('Content-Type', noteRevision.mime);

    res.send(noteRevision.getContent());
});

router.delete ("/eraseAllNoteRevisions", (req, res) => {
    const noteRevisionIdsToErase = sql.getColumn('SELECT noteRevisionId FROM note_revisions WHERE noteId = ?',
        [req.params.noteId]);

    noteRevisionService.eraseNoteRevisions(noteRevisionIdsToErase);
});

router.delete ("/eraseNoteRevision", (req, res) => {
        noteRevisionService.eraseNoteRevisions([req.params.noteRevisionId]);

});

router.put ("/restoreNoteRevision", (req, res) => {
    const noteRevision = becca.getNoteRevision(req.params.noteRevisionId);

    if (noteRevision) {
        const note = noteRevision.getNote();

        note.saveNoteRevision();

        note.title = noteRevision.title;
        note.setContent(noteRevision.getContent());
        note.save();
    }
});

router.get ("/getEditedNotesOnDate", (req, res) => {
    const noteIds = sql.getColumn(`
        SELECT notes.*
        FROM notes
        WHERE noteId IN (
                SELECT noteId FROM notes 
                WHERE notes.dateCreated LIKE :date
                   OR notes.dateModified LIKE :date
            UNION ALL
                SELECT noteId FROM note_revisions
                WHERE note_revisions.dateLastEdited LIKE :date
        )
        ORDER BY isDeleted
        LIMIT 50`, {date: req.params.date + '%'});

    const notes = becca.getNotes(noteIds, true)
        .map(note => note.getPojo());

    for (const note of notes) {
        const notePath = note.isDeleted ? null : beccaService.getNotePath(note.noteId);

        note.notePath = notePath ? notePath.notePath : null;
    }

    return notes;
});

module.exports = router;
