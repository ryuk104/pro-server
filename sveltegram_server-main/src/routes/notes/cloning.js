const express = require("express");
const router = express.Router();
const cloningService = require('../../services/cloning');

router.put ("/cloneNoteToBranch", (req, res) => {
    const {noteId, parentBranchId} = req.params;
    const {prefix} = req.body;

    return cloningService.cloneNoteToBranch(noteId, parentBranchId, prefix);
});

router.put ("/cloneNoteToNote", (req, res) => {
    const {noteId, parentNoteId} = req.params;
    const {prefix} = req.body;

    return cloningService.cloneNoteToNote(noteId, parentNoteId, prefix);
});

router.put ("/cloneNoteAfter", (req, res) => {
    const {noteId, afterBranchId} = req.params;

    return cloningService.cloneNoteAfter(noteId, afterBranchId);
});



module.exports = router;