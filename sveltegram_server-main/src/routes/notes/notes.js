const express = require("express");
const router = express.Router();
const noteService = require('../../services/notes');
const treeService = require('../../services/tree');
const sql = require('../../services/sql');
const utils = require('../../services/utils');
const log = require('../../services/log');
const TaskContext = require('../../services/task_context');
const fs = require('fs');
const noteRevisionService = require("../../services/note_revisions");
const becca = require("../../becca/becca");

router.get ("/getNote", (req, res) => {
    const noteId = req.params.noteId;
    const note = becca.getNote(noteId);

    if (!note) {
        return [404, "Note " + noteId + " has not been found."];
    }

    const pojo = note.getPojo();

    if (note.isStringNote()) {
        pojo.content = note.getContent();

        if (note.type === 'file' && pojo.content.length > 10000) {
            pojo.content = pojo.content.substr(0, 10000)
                + `\r\n\r\n... and ${pojo.content.length - 10000} more characters.`;
        }
    }

    const contentMetadata = note.getContentMetadata();

    pojo.contentLength = contentMetadata.contentLength;

    pojo.combinedUtcDateModified = note.utcDateModified > contentMetadata.utcDateModified ? note.utcDateModified : contentMetadata.utcDateModified;
    pojo.combinedDateModified = note.utcDateModified > contentMetadata.utcDateModified ? note.dateModified : contentMetadata.dateModified;

    return pojo;
});


router.post ("/createNote", (req, res) => {
    const params = Object.assign({}, req.body); // clone
    params.parentNoteId = req.params.parentNoteId;

    const { target, targetBranchId } = req.query;

    const { note, branch } = noteService.createNewNoteWithTarget(target, targetBranchId, params);

    return {
        note,
        branch
    };
});

router.put ("/updateNoteContent", (req, res) => {
    const {content} = req.body;
    const {noteId} = req.params;

    return noteService.updateNoteContent(noteId, content);
});

router.delete ("/deleteNote", (req, res) => {
    const noteId = req.params.noteId;
    const taskId = req.query.taskId;
    const eraseNotes = req.query.eraseNotes === 'true';
    const last = req.query.last === 'true';

    // note how deleteId is separate from taskId - single taskId produces separate deleteId for each "top level" deleted note
    const deleteId = utils.randomString(10);

    const note = becca.getNote(noteId);

    const taskContext = TaskContext.getInstance(taskId, 'delete-notes');

    note.deleteNote(deleteId, taskContext);

    if (eraseNotes) {
        noteService.eraseNotesWithDeleteId(deleteId);
    }

    if (last) {
        taskContext.taskSucceeded();
    }
});

router.put ("/undeleteNote", (req, res) => {
    const taskContext = TaskContext.getInstance(utils.randomString(10), 'undeleteNotes');

    noteService.undeleteNote(req.params.noteId, taskContext);

    taskContext.taskSucceeded();
});

router.put ("/sortChildNotes", (req, res) => {
    const noteId = req.params.noteId;
    const {sortBy, sortDirection, foldersFirst} = req.body;

    log.info(`Sorting '${noteId}' children with ${sortBy} ${sortDirection}, foldersFirst=${foldersFirst}`);

    const reverse = sortDirection === 'desc';

    treeService.sortNotes(noteId, sortBy, reverse, foldersFirst);
});

router.put ("/protectNote", (req, res) => {
    const noteId = req.params.noteId;
    const note = becca.notes[noteId];
    const protect = !!parseInt(req.params.isProtected);
    const includingSubTree = !!parseInt(req.query.subtree);

    const taskContext = new TaskContext(utils.randomString(10), 'protectNotes', {protect});

    noteService.protectNoteRecursively(note, protect, includingSubTree, taskContext);

    taskContext.taskSucceeded();
});

router.put ("/setNoteTypeMime", (req, res) => {
    // can't use [] destructuring because req.params is not iterable
    const {noteId} = req.params;
    const {type, mime} = req.body;

    const note = becca.getNote(noteId);
    note.type = type;
    note.mime = mime;
    note.save();
});

router.post ("/getRelationMap", (req, res) => {
    const {relationMapNoteId, noteIds} = req.body;

    const resp = {
        // noteId => title
        noteTitles: {},
        relations: [],
        // relation name => inverse relation name
        inverseRelations: {
            'internalLink': 'internalLink'
        }
    };

    if (noteIds.length === 0) {
        return resp;
    }

    const questionMarks = noteIds.map(noteId => '?').join(',');

    const relationMapNote = becca.getNote(relationMapNoteId);

    const displayRelationsVal = relationMapNote.getLabelValue('displayRelations');
    const displayRelations = !displayRelationsVal ? [] : displayRelationsVal
        .split(",")
        .map(token => token.trim());

    const hideRelationsVal = relationMapNote.getLabelValue('hideRelations');
    const hideRelations = !hideRelationsVal ? [] : hideRelationsVal
        .split(",")
        .map(token => token.trim());

    const foundNoteIds = sql.getColumn(`SELECT noteId FROM notes WHERE isDeleted = 0 AND noteId IN (${questionMarks})`, noteIds);
    const notes = becca.getNotes(foundNoteIds);

    for (const note of notes) {
        resp.noteTitles[note.noteId] = note.title;

        resp.relations = resp.relations.concat(note.getRelations()
            .filter(relation => !relation.isAutoLink() || displayRelations.includes(relation.name))
            .filter(relation => displayRelations.length > 0
                ? displayRelations.includes(relation.name)
                : !hideRelations.includes(relation.name))
            .filter(relation => noteIds.includes(relation.value))
            .map(relation => ({
                attributeId: relation.attributeId,
                sourceNoteId: relation.noteId,
                targetNoteId: relation.value,
                name: relation.name
            })));

        for (const relationDefinition of note.getRelationDefinitions()) {
            const def = relationDefinition.getDefinition();

            if (def.inverseRelation) {
                resp.inverseRelations[relationDefinition.getDefinedName()] = def.inverseRelation;
            }
        }
    }

    return resp;
});

router.put ("/changeTitle", (req, res) => {
    const noteId = req.params.noteId;
    const title = req.body.title;

    const note = becca.getNote(noteId);

    if (!note) {
        return [404, `Note '${noteId}' has not been found`];
    }

    if (!note.isContentAvailable()) {
        return [400, `Note '${noteId}' is not available for change`];
    }

    const noteTitleChanged = note.title !== title;

    if (noteTitleChanged) {
        noteService.saveNoteRevisionIfNeeded(note);
    }

    note.title = title;

    note.save();

    if (noteTitleChanged) {
        noteService.triggerNoteTitleChanged(note);
    }

    return note;
});

router.post ("/duplicateSubtree", (req, res) => {
    const {noteId, parentNoteId} = req.params;

    return noteService.duplicateSubtree(noteId, parentNoteId);
});

router.post ("/eraseDeletedNotesNow", (req, res) => {
    noteService.eraseDeletedNotesNow();
});

router.post ("/getDeleteNotesPreview", (req, res) => {
    const {branchIdsToDelete, deleteAllClones} = req.body;

    const noteIdsToBeDeleted = new Set();
    const branchCountToDelete = {}; // noteId => count (integer)

    function branchPreviewDeletion(branch) {
        branchCountToDelete[branch.branchId] = branchCountToDelete[branch.branchId] || 0;
        branchCountToDelete[branch.branchId]++;

        const note = branch.getNote();

        if (deleteAllClones || note.getParentBranches().length <= branchCountToDelete[branch.branchId]) {
            noteIdsToBeDeleted.add(note.noteId);

            for (const childBranch of note.getChildBranches()) {
                branchPreviewDeletion(childBranch);
            }
        }
    }

    for (const branchId of branchIdsToDelete) {
        const branch = becca.getBranch(branchId);

        if (!branch) {
            log.error(`Branch ${branchId} was not found and delete preview can't be calculated for this note.`);

            continue;
        }

        branchPreviewDeletion(branch);
    }

    let brokenRelations = [];

    if (noteIdsToBeDeleted.size > 0) {
        sql.fillParamList(noteIdsToBeDeleted);

        brokenRelations = sql.getRows(`
            SELECT attr.noteId, attr.name, attr.value
            FROM attributes attr
                     JOIN param_list ON param_list.paramId = attr.value
            WHERE attr.isDeleted = 0
              AND attr.type = 'relation'`).filter(attr => !noteIdsToBeDeleted.has(attr.noteId));
    }

    return {
        noteIdsToBeDeleted: Array.from(noteIdsToBeDeleted),
        brokenRelations
    };
});

router.post ("/uploadModifiedFile", (req, res) => {
    const noteId = req.params.noteId;
    const {filePath} = req.body;

    const note = becca.getNote(noteId);

    if (!note) {
        return [404, `Note '${noteId}' has not been found`];
    }

    log.info(`Updating note '${noteId}' with content from ${filePath}`);

    note.saveNoteRevision();

    const fileContent = fs.readFileSync(filePath);

    if (!fileContent) {
        return [400, `File ${fileContent} is empty`];
    }

    note.setContent(fileContent);
});

router.get ("/getBacklinkCount", (req, res) => {
    const {noteId} = req.params;

    const note = becca.getNote(noteId);

    if (!note) {
        return [404, "Not found"];
    }
    else {
        return {
            count: note.getTargetRelations().length
        };
    }
});

module.exports = router
