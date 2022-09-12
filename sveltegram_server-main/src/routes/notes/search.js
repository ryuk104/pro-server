const express = require("express");
const router = express.Router();
const becca = require('../../becca/becca');
const SearchContext = require('../../services/search/search_context');
const log = require('../../services/log');
const scriptService = require('../../services/script');
const searchService = require('../../services/search/services/search');
const bulkActionService = require("../../services/bulk_actions");
const {formatAttrForSearch} = require("../../services/attribute_formatter");
const utils = require("../../services/utils.js");

router.get ("/searchFromNoteInt", (req, res, note) => {
    let searchResultNoteIds;

    const searchScript = note.getRelationValue('searchScript');
    const searchString = note.getLabelValue('searchString');

    if (searchScript) {
        searchResultNoteIds = searchFromRelation(note, 'searchScript');
    } else {
        const searchContext = new SearchContext({
            fastSearch: note.hasLabel('fastSearch'),
            ancestorNoteId: note.getRelationValue('ancestor'),
            ancestorDepth: note.getLabelValue('ancestorDepth'),
            includeArchivedNotes: note.hasLabel('includeArchivedNotes'),
            orderBy: note.getLabelValue('orderBy'),
            orderDirection: note.getLabelValue('orderDirection'),
            limit: note.getLabelValue('limit'),
            debug: note.hasLabel('debug'),
            fuzzyAttributeSearch: false
        });

        searchResultNoteIds = searchService.findResultsWithQuery(searchString, searchContext)
            .map(sr => sr.noteId);
    }

    // we won't return search note's own noteId
    // also don't allow root since that would force infinite cycle
    return searchResultNoteIds.filter(resultNoteId => !['root', note.noteId].includes(resultNoteId));
});

router.get ("/searchFromNote", (req, res, async) => {
    const note = becca.getNote(req.params.noteId);

    if (!note) {
        return [404, `Note ${req.params.noteId} has not been found.`];
    }

    if (note.isDeleted) {
        // this can be triggered from recent changes and it's harmless to return empty list rather than fail
        return [];
    }

    if (note.type !== 'search') {
        return [400, `Note ${req.params.noteId} is not a search note.`]
    }

    return await searchFromNoteInt(note);
});

router.post ("/searchAndExecute", (req, res) => {
    const note = becca.getNote(req.params.noteId);

    if (!note) {
        return [404, `Note ${req.params.noteId} has not been found.`];
    }

    if (note.isDeleted) {
        // this can be triggered from recent changes and it's harmless to return empty list rather than fail
        return [];
    }

    if (note.type !== 'search') {
        return [400, `Note ${req.params.noteId} is not a search note.`]
    }

    const searchResultNoteIds = searchFromNoteInt(note);

    bulkActionService.executeActions(note, searchResultNoteIds);
});

router.get ("/searchFromRelation", (req, res, note, relationName) => {
    const scriptNote = note.getRelationTarget(relationName);

    if (!scriptNote) {
        log.info(`Search note's relation ${relationName} has not been found.`);

        return [];
    }

    if (!scriptNote.isJavaScript() || scriptNote.getScriptEnv() !== 'backend') {
        log.info(`Note ${scriptNote.noteId} is not executable.`);

        return [];
    }

    if (!note.isContentAvailable()) {
        log.info(`Note ${scriptNote.noteId} is not available outside of protected session.`);

        return [];
    }

    const result = scriptService.executeNote(scriptNote, { originEntity: note });

    if (!Array.isArray(result)) {
        log.info(`Result from ${scriptNote.noteId} is not an array.`);

        return [];
    }

    if (result.length === 0) {
        return [];
    }

    // we expect either array of noteIds (strings) or notes, in that case we extract noteIds ourselves
    return typeof result[0] === 'string' ? result : result.map(item => item.noteId);
});

router.get ("/quickSearch", (req, res) => {
    const {searchString} = req.params;

    const searchContext = new SearchContext({
        fastSearch: false,
        includeArchivedNotes: false,
        fuzzyAttributeSearch: false
    });

    return searchService.findResultsWithQuery(searchString, searchContext)
        .map(sr => sr.noteId);
});

router.get ("/search", (req, res) => {
    const {searchString} = req.params;

    const searchContext = new SearchContext({
        fastSearch: false,
        includeArchivedNotes: true,
        fuzzyAttributeSearch: false,
        ignoreHoistedNote: true
    });

    return searchService.findResultsWithQuery(searchString, searchContext)
        .map(sr => sr.noteId);
});

router.post ("/getRelatedNotes", (req, res) => {
    const attr = req.body;

    const searchSettings = {
        fastSearch: true,
        includeArchivedNotes: false,
        fuzzyAttributeSearch: false
    };

    const matchingNameAndValue = searchService.findResultsWithQuery(formatAttrForSearch(attr, true), new SearchContext(searchSettings));
    const matchingName = searchService.findResultsWithQuery(formatAttrForSearch(attr, false), new SearchContext(searchSettings));

    const results = [];

    const allResults = matchingNameAndValue.concat(matchingName);

    const allResultNoteIds = new Set();

    for (const record of allResults) {
        allResultNoteIds.add(record.noteId);
    }

    for (const record of allResults) {
        if (results.length >= 20) {
            break;
        }

        if (results.find(res => res.noteId === record.noteId)) {
            continue;
        }

        results.push(record);
    }

    return {
        count: allResultNoteIds.size,
        results
    };
});

router.get ("/searchTemplates", (req, res) => {
    const query = formatAttrForSearch({type: 'label', name: "template"}, false);

    return searchService.searchNotes(query, {
        includeArchivedNotes: true,
        ignoreHoistedNote: false
    }).map(note => note.noteId);
});

module.exports = router;
