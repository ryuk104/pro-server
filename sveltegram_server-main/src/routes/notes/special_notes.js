const express = require("express");
const router = express.Router();
const dateNoteService = require('../../services/notes/date_notes');
const sql = require('../../services/notes/sql');
const cls = require('../../services/notes/cls');
const specialNotesService = require('../../services/notes/special_notes');
const becca = require('../../becca/becca');

router.get ("/getInboxNote", (req, res) => {
    return specialNotesService.getInboxNote(req.params.date);
});

router.get ("/getDayNote", (req, res) => {
        return dateNoteService.getDayNote(req.params.date);

});

router.get ("/getWeekNote", (req, res) => {
        return dateNoteService.getWeekNote(req.params.date);

});

router.get ("/getMonthNote", (req, res) => {
        return dateNoteService.getMonthNote(req.params.month);

});

router.get ("/getYearNote", (req, res) => {
        return dateNoteService.getYearNote(req.params.year);

});

router.get ("/getDayNotesForMonth", (req, res) => {
    const month = req.params.month;

    return sql.getMap(`
        SELECT
            attr.value AS date,
            notes.noteId
        FROM notes
        JOIN attributes attr USING(noteId)
        WHERE notes.isDeleted = 0
            AND attr.isDeleted = 0
            AND attr.type = 'label'
            AND attr.name = 'dateNote'
            AND attr.value LIKE '${month}%'`);
});

router.post ("/saveSqlConsole", (req, res) => {
        return specialNotesService.saveSqlConsole(req.body.sqlConsoleNoteId);

});

router.post ("/createSqlConsole", (req, res) => {
        return specialNotesService.createSqlConsole();

});

router.post ("/saveSearchNote", (req, res) => {
        return specialNotesService.saveSearchNote(req.body.searchNoteId);

});

router.post ("/createSearchNote", (req, res) => {
    const hoistedNote = getHoistedNote();
    const searchString = req.body.searchString || "";
    const ancestorNoteId = req.body.ancestorNoteId || hoistedNote.noteId;

    return specialNotesService.createSearchNote(searchString, ancestorNoteId);
});

router.get ("/getHoistedNote", (req, res) => {
        return becca.getNote(cls.getHoistedNoteId());

});



module.exports = router;