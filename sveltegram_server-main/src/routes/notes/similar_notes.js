const express = require("express");
const router = express.Router();
const similarityService = require('../../becca/similarity');
const becca = require("../../becca/becca");

router.get ("/getSimilarNotes", (req, res) => {
    const noteId = req.params.noteId;

    const note = becca.getNote(noteId);

    if (!note) {
        return [404, `Note ${noteId} not found.`];
    }

    return await similarityService.findSimilarNotes(noteId);
});



module.exports = router;
