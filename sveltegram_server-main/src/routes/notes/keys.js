const express = require("express");
const router = express.Router();
const keyboardActions = require('../../services/keyboard_actions');
const becca = require('../../becca/becca');


router.get ("/getKeyboardActions", (req, res) => {
        return keyboardActions.getKeyboardActions();

});

router.get ("/getShortcutsForNotes", (req, res) => {
    const attrs = becca.findAttributes('label', 'keyboardShortcut');

    const map = {};

    for (const attr of attrs) {
        map[attr.value] = attr.noteId;
    }

    return map;
});

module.exports = router;