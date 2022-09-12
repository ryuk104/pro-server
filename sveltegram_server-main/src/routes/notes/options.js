const express = require("express");
const router = express.Router();
const optionService = require('../../services/options');
const log = require('../../services/log');
const searchService = require('../../services/search/services/search');

// options allowed to be updated directly in options dialog
const ALLOWED_OPTIONS = new Set([
    'eraseEntitiesAfterTimeInSeconds',
    'protectedSessionTimeout',
    'noteRevisionSnapshotTimeInterval',
    'zoomFactor',
    'theme',
    'syncServerHost',
    'syncServerTimeout',
    'syncProxy',
    'hoistedNoteId',
    'mainFontSize',
    'mainFontFamily',
    'treeFontSize',
    'treeFontFamily',
    'detailFontSize',
    'detailFontFamily',
    'monospaceFontSize',
    'monospaceFontFamily',
    'openTabs',
    'noteInfoWidget',
    'attributesWidget',
    'linkMapWidget',
    'noteRevisionsWidget',
    'whatLinksHereWidget',
    'similarNotesWidget',
    'editedNotesWidget',
    'calendarWidget',
    'vimKeymapEnabled',
    'codeNotesMimeTypes',
    'spellCheckEnabled',
    'spellCheckLanguageCode',
    'imageMaxWidthHeight',
    'imageJpegQuality',
    'leftPaneWidth',
    'rightPaneWidth',
    'leftPaneVisible',
    'rightPaneVisible',
    'nativeTitleBarVisible',
    'attributeListExpanded',
    'promotedAttributesExpanded',
    'similarNotesExpanded',
    'headingStyle',
    'autoCollapseNoteTree',
    'autoReadonlySizeText',
    'autoReadonlySizeCode',
    'overrideThemeFonts',
    'dailyBackupEnabled',
    'weeklyBackupEnabled',
    'monthlyBackupEnabled',
    'maxContentWidth',
    'compressImages',
    'downloadImagesAutomatically'
]);

router.get ("/getOptions", (req, res) => {
   const optionMap = optionService.getOptionsMap();
    const resultMap = {};

    for (const optionName in optionMap) {
        if (isAllowed(optionName)) {
            resultMap[optionName] = optionMap[optionName];
        }
    }

    resultMap['isPasswordSet'] = !!optionMap['passwordVerificationHash'] ? 'true' : 'false';

    return resultMap; 
});

router.put ("/updateOption", (req, res) => {
    const {name, value} = req.params;

    if (!update(name, value)) {
        return [400, "not allowed option to change"];
    }
});

router.put ("/updateOptions", (req, res) => {
    for (const optionName in req.body) {
        if (!update(optionName, req.body[optionName])) {
            // this should be improved
            // it should return 400 instead of current 500, but at least it now rollbacks transaction
            throw new Error(`${optionName} is not allowed to change`);
        }
    }
});

router.get ("/update", (req, res, name, value) => {
    if (!isAllowed(name)) {
        return false;
    }

    if (name !== 'openTabs') {
        log.info(`Updating option ${name} to ${value}`);
    }

    optionService.setOption(name, value);

    return true;
});

router.get ("/getUserThemes", (req, res) => {
    const notes = searchService.searchNotes("#appTheme");
    const ret = [];

    for (const note of notes) {
        let value = note.getOwnedLabelValue('appTheme');

        if (!value) {
            value = note.title.toLowerCase().replace(/[^a-z0-9]/gi, '-');
        }

        ret.push({
            val: value,
            title: note.title,
            noteId: note.noteId
        });
    }

    return ret;
});

router.get ("/isAllowed", (req, res, name) => {
    return ALLOWED_OPTIONS.has(name)
        || name.startsWith("keyboardShortcuts")
        || name.endsWith("Collapsed")
        || name.startsWith("hideArchivedNotes")
        || name.startsWith("hideIncludedImages");
});



module.exports = router;