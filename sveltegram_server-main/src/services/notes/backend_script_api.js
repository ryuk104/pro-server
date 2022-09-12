const log = require('./log');
const noteService = require('./notes');
const sql = require('./sql');
const utils = require('./utils');
const attributeService = require('./attributes');
const dateNoteService = require('./date_notes');
const treeService = require('./tree');
const config = require('./config');
const axios = require('axios');
const dayjs = require('dayjs');
const xml2js = require('xml2js');
const cloningService = require('./cloning');
const appInfo = require('./app_info');
const searchService = require('./search/services/search');
const SearchContext = require("./search/search_context");
const becca = require("../becca/becca");

/**
 * This is the main backend API interface for scripts. It's published in the local "api" object.
 *
 * @constructor
 * @hideconstructor
 */
function BackendScriptApi(currentNote, apiParams) {
    /** @property {Note} note where script started executing */
    this.startNote = apiParams.startNote;
    /** @property {Note} note where script is currently executing. Don't mix this up with concept of active note */
    this.currentNote = currentNote;
    /** @property {Entity} entity whose event triggered this executions */
    this.originEntity = apiParams.originEntity;

    for (const key in apiParams) {
        this[key] = apiParams[key];
    }

    /** @property {axios} Axios library for HTTP requests. See https://axios-http.com/ for documentation */
    this.axios = axios;
    /** @property {dayjs} day.js library for date manipulation. See https://day.js.org/ for documentation */
    this.dayjs = dayjs;
    /** @property {axios} xml2js library for XML parsing. See https://github.com/Leonidas-from-XIV/node-xml2js for documentation */
    this.xml2js = xml2js;

    // DEPRECATED - use direct api.unescapeHtml
    this.utils = {
        unescapeHtml: utils.unescapeHtml
    };

    /**
     * Instance name identifies particular Trilium instance. It can be useful for scripts
     * if some action needs to happen on only one specific instance.
     *
     * @returns {string|null}
     */
    this.getInstanceName = () => config.General ? config.General.instanceName : null;

    /**
     * @method
     * @param {string} noteId
     * @returns {Note|null}
     */
    this.getNote = noteId => becca.getNote(noteId);

    /**
     * @method
     * @param {string} branchId
     * @returns {Branch|null}
     */
    this.getBranch = branchId => becca.getBranch(branchId);

    /**
     * @method
     * @param {string} attributeId
     * @returns {Attribute|null}
     */
    this.getAttribute = attributeId => becca.getAttribute(attributeId);

    /**
     * This is a powerful search method - you can search by attributes and their values, e.g.:
     * "#dateModified =* MONTH AND #log". See full documentation for all options at: https://github.com/zadam/trilium/wiki/Search
     *
     * @method
     * @param {string} query
     * @param {Object} [searchParams]
     * @returns {Note[]}
     */
    this.searchForNotes = (query, searchParams = {}) => {
        if (searchParams.includeArchivedNotes === undefined) {
            searchParams.includeArchivedNotes = true;
        }

        if (searchParams.ignoreHoistedNote === undefined) {
            searchParams.ignoreHoistedNote = true;
        }

        const noteIds = searchService.findResultsWithQuery(query, new SearchContext(searchParams))
            .map(sr => sr.noteId);

        return becca.getNotes(noteIds);
    };

    /**
     * This is a powerful search method - you can search by attributes and their values, e.g.:
     * "#dateModified =* MONTH AND #log". See full documentation for all options at: https://github.com/zadam/trilium/wiki/Search
     *
     * @method
     * @param {string} query
     * @param {Object} [searchParams]
     * @returns {Note|null}
     */
    this.searchForNote = (query, searchParams = {}) => {
        const notes = this.searchForNotes(query, searchParams);

        return notes.length > 0 ? notes[0] : null;
    };

    /**
     * Retrieves notes with given label name & value
     *
     * @method
     * @param {string} name - attribute name
     * @param {string} [value] - attribute value
     * @returns {Note[]}
     */
    this.getNotesWithLabel = attributeService.getNotesWithLabel;

    /**
     * Retrieves first note with given label name & value
     *
     * @method
     * @param {string} name - attribute name
     * @param {string} [value] - attribute value
     * @returns {Note|null}
     */
    this.getNoteWithLabel = attributeService.getNoteWithLabel;

    /**
     * If there's no branch between note and parent note, create one. Otherwise, do nothing.
     *
     * @method
     * @param {string} noteId
     * @param {string} parentNoteId
     * @param {string} prefix - if branch will be created between note and parent note, set this prefix
     * @returns {void}
     */
    this.ensureNoteIsPresentInParent = cloningService.ensureNoteIsPresentInParent;

    /**
     * If there's a branch between note and parent note, remove it. Otherwise, do nothing.
     *
     * @method
     * @param {string} noteId
     * @param {string} parentNoteId
     * @returns {void}
     */
    this.ensureNoteIsAbsentFromParent = cloningService.ensureNoteIsAbsentFromParent;

    /**
     * Based on the value, either create or remove branch between note and parent note.
     *
     * @method
     * @param {boolean} present - true if we want the branch to exist, false if we want it gone
     * @param {string} noteId
     * @param {string} parentNoteId
     * @param {string} prefix - if branch will be created between note and parent note, set this prefix
     * @returns {void}
     */
    this.toggleNoteInParent = cloningService.toggleNoteInParent;

    /**
     * @typedef {object} CreateNoteAttribute
     * @property {string} type - attribute type - label, relation etc.
     * @property {string} name - attribute name
     * @property {string} [value] - attribute value
     */

    /**
     * Create text note. See also createNewNote() for more options.
     *
     * @param {string} parentNoteId
     * @param {string} title
     * @param {string} content
     * @return {{note: Note, branch: Branch}} - object having "note" and "branch" keys representing respective objects
     */
    this.createTextNote = (parentNoteId, title, content = '') => noteService.createNewNote({
        parentNoteId,
        title,
        content,
        type: 'text'
    });

    /**
     * Create data note - data in this context means object serializable to JSON. Created note will be of type 'code' and
     * JSON MIME type. See also createNewNote() for more options.
     *
     * @param {string} parentNoteId
     * @param {string} title
     * @param {object} content
     * @return {{note: Note, branch: Branch}} object having "note" and "branch" keys representing respective objects
     */
    this.createDataNote = (parentNoteId, title, content = {}) => noteService.createNewNote({
        parentNoteId,
        title,
        content: JSON.stringify(content, null, '\t'),
        type: 'code',
        mime: 'application/json'
    });

    /**
     * @typedef {object} CreateNewNoteParams
     * @property {string} parentNoteId - MANDATORY
     * @property {string} title - MANDATORY
     * @property {string|buffer} content - MANDATORY
     * @property {string} type - text, code, file, image, search, book, relation-map, canvas - MANDATORY
     * @property {string} mime - value is derived from default mimes for type
     * @property {boolean} isProtected - default is false
     * @property {boolean} isExpanded - default is false
     * @property {string} prefix - default is empty string
     * @property {int} notePosition - default is last existing notePosition in a parent + 10
     */

    /**
     * @method
     *
     * @param {CreateNewNoteParams} [params]
     * @returns {{note: Note, branch: Branch}} object contains newly created entities note and branch
     */
    this.createNewNote = noteService.createNewNote;

    /**
     * @typedef {object} CreateNoteAttribute
     * @property {string} type - attribute type - label, relation etc.
     * @property {string} name - attribute name
     * @property {string} [value] - attribute value
     */

    /**
     * @typedef {object} CreateNoteExtraOptions
     * @property {boolean} [json=false] - should the note be JSON
     * @property {boolean} [isProtected=false] - should the note be protected
     * @property {string} [type='text'] - note type
     * @property {string} [mime='text/html'] - MIME type of the note
     * @property {CreateNoteAttribute[]} [attributes=[]] - attributes to be created for this note
     */

    /**
     * @method
     * @deprecated please use createTextNote() with similar API for simpler use cases or createNewNote() for more complex needs
     *
     * @param {string} parentNoteId - create new note under this parent
     * @param {string} title
     * @param {string} [content=""]
     * @param {CreateNoteExtraOptions} [extraOptions={}]
     * @returns {{note: Note, branch: Branch}} object contains newly created entities note and branch
     */
    this.createNote = (parentNoteId, title, content = "", extraOptions= {}) => {
        extraOptions.parentNoteId = parentNoteId;
        extraOptions.title = title;

        const parentNote = becca.getNote(parentNoteId);

        // code note type can be inherited, otherwise text is default
        extraOptions.type = parentNote.type === 'code' ? 'code' : 'text';
        extraOptions.mime = parentNote.type === 'code' ? parentNote.mime : 'text/html';

        if (extraOptions.json) {
            extraOptions.content = JSON.stringify(content || {}, null, '\t');
            extraOptions.type = 'code';
            extraOptions.mime = 'application/json';
        }
        else {
            extraOptions.content = content;
        }

        return sql.transactional(() => {
            const {note, branch} = noteService.createNewNote(extraOptions);

            for (const attr of extraOptions.attributes || []) {
                attributeService.createAttribute({
                    noteId: note.noteId,
                    type: attr.type,
                    name: attr.name,
                    value: attr.value,
                    isInheritable: !!attr.isInheritable
                });
            }

            return {note, branch};
        });
    };

    /**
     * Log given message to trilium logs.
     *
     * @param message
     */
    this.log = message => log.info(message);

    /**
     * Returns root note of the calendar.
     *
     * @method
     * @returns {Note|null}
     */
    this.getRootCalendarNote = dateNoteService.getRootCalendarNote;

    /**
     * Returns day note for given date. If such note doesn't exist, it is created.
     *
     * @method
     * @param {string} date in YYYY-MM-DD format
     * @returns {Note|null}
     * @deprecated use getDayNote instead
     */
    this.getDateNote = dateNoteService.getDayNote;

    /**
     * Returns day note for given date. If such note doesn't exist, it is created.
     *
     * @method
     * @param {string} date in YYYY-MM-DD format
     * @returns {Note|null}
     */
    this.getDayNote = dateNoteService.getDayNote;

    /**
     * Returns today's day note. If such note doesn't exist, it is created.
     *
     * @method
     * @returns {Note|null}
     */
    this.getTodayNote = dateNoteService.getTodayNote;

    /**
     * Returns note for the first date of the week of the given date.
     *
     * @method
     * @param {string} date in YYYY-MM-DD format
     * @param {object} options - "startOfTheWeek" - either "monday" (default) or "sunday"
     * @returns {Note|null}
     */
    this.getWeekNote = dateNoteService.getWeekNote;

    /**
     * Returns month note for given date. If such note doesn't exist, it is created.
     *
     * @method
     * @param {string} date in YYYY-MM format
     * @returns {Note|null}
     */
    this.getMonthNote = dateNoteService.getMonthNote;

    /**
     * Returns year note for given year. If such note doesn't exist, it is created.
     *
     * @method
     * @param {string} year in YYYY format
     * @returns {Note|null}
     */
    this.getYearNote = dateNoteService.getYearNote;

    /**
     * @method
     * @param {string} parentNoteId - this note's child notes will be sorted
     */
    this.sortNotesByTitle = parentNoteId => treeService.sortNotes(parentNoteId);

    /**
     * This method finds note by its noteId and prefix and either sets it to the given parentNoteId
     * or removes the branch (if parentNoteId is not given).
     *
     * This method looks similar to toggleNoteInParent() but differs because we're looking up branch by prefix.
     *
     * @method
     * @deprecated - this method is pretty confusing and serves specialized purpose only
     * @param {string} noteId
     * @param {string} prefix
     * @param {string|null} parentNoteId
     */
    this.setNoteToParent = treeService.setNoteToParent;

    /**
     * This functions wraps code which is supposed to be running in transaction. If transaction already
     * exists, then we'll use that transaction.
     *
     * @method
     * @param {function} func
     * @returns {?} result of func callback
     */
    this.transactional = sql.transactional;

    /**
     * Return randomly generated string of given length. This random string generation is NOT cryptographically secure.
     *
     * @method
     * @param {number} length of the string
     * @returns {string} random string
     */
    this.randomString = utils.randomString;

    /**
     * @method
     * @param {string} string to escape
     * @returns {string} escaped string
     */
    this.escapeHtml = utils.escapeHtml;

    /**
     * @method
     * @param {string} string to unescape
     * @returns {string} unescaped string
     */
    this.unescapeHtml = utils.unescapeHtml;

    /**
     * @property {module:sql} sql
     */
    this.sql = sql;

    /**
     * @method
     * @deprecated - this is now no-op since all the changes should be gracefully handled per widget
     */
    this.refreshTree = () => {};

    /**
     * @return {{syncVersion, appVersion, buildRevision, dbVersion, dataDirectory, buildDate}|*} - object representing basic info about running Trilium version
     */
    this.getAppInfo = () => appInfo

    /**
     * This object contains "at your risk" and "no BC guarantees" objects for advanced use cases.
     *
     * @type {{becca: Becca}}
     */
    this.__private = {
        becca
    }
}

module.exports = BackendScriptApi;
