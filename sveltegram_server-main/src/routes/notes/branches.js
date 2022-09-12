const express = require("express");
const router = express.Router();

const sql = require('../../services/sql');
const utils = require('../../services/utils');
const entityChangesService = require('../../services/entity_changes');
const treeService = require('../../services/tree');
const noteService = require('../../services/notes');
const becca = require('../../becca/becca');
const TaskContext = require('../../services/task_context');
const branchService = require("../../services/branches");
const log = require("../../services/log.js");

/**
 * Code in this file deals with moving and cloning branches. Relationship between note and parent note is unique
 * for not deleted branches. There may be multiple deleted note-parent note relationships.
 */

 router.put ("/moveBranchToParent", (req, res) => {
    const {branchId, parentBranchId} = req.params;

    const parentBranch = becca.getBranch(parentBranchId);
    const branchToMove = becca.getBranch(branchId);

    if (!parentBranch || !branchToMove) {
        return [400, `One or both branches ${branchId}, ${parentBranchId} have not been found`];
    }

    return branchService.moveBranchToBranch(branchToMove, parentBranch, branchId);
});

router.put ("/moveBranchBeforeNote", (req, res) => {
    const {branchId, beforeBranchId} = req.params;

    const branchToMove = becca.getBranch(branchId);
    const beforeBranch = becca.getBranch(beforeBranchId);

    if (!branchToMove) {
        return [404, `Can't find branch ${branchId}`];
    }

    if (!beforeBranch) {
        return [404, `Can't find branch ${beforeBranchId}`];
    }

    const validationResult = treeService.validateParentChild(beforeBranch.parentNoteId, branchToMove.noteId, branchId);

    if (!validationResult.success) {
        return [200, validationResult];
    }

    const originalBeforeNotePosition = beforeBranch.notePosition;

    // we don't change utcDateModified so other changes are prioritized in case of conflict
    // also we would have to sync all those modified branches otherwise hash checks would fail

    sql.execute("UPDATE branches SET notePosition = notePosition + 10 WHERE parentNoteId = ? AND notePosition >= ? AND isDeleted = 0",
        [beforeBranch.parentNoteId, originalBeforeNotePosition]);

    // also need to update becca positions
    const parentNote = becca.getNote(beforeBranch.parentNoteId);

    for (const childBranch of parentNote.getChildBranches()) {
        if (childBranch.notePosition >= originalBeforeNotePosition) {
            childBranch.notePosition += 10;
        }
    }

    if (branchToMove.parentNoteId === beforeBranch.parentNoteId) {
        branchToMove.notePosition = originalBeforeNotePosition;
        branchToMove.save();
    }
    else {
        const newBranch = branchToMove.createClone(beforeBranch.parentNoteId, originalBeforeNotePosition);
        newBranch.save();

        branchToMove.markAsDeleted();
    }

    treeService.sortNotesIfNeeded(parentNote.noteId);

    // if sorting is not needed then still the ordering might have changed above manually
    entityChangesService.addNoteReorderingEntityChange(parentNote.noteId);

    log.info(`Moved note ${branchToMove.noteId}, branch ${branchId} before note ${beforeBranch.noteId}, branch ${beforeBranchId}`);

    return { success: true };
});

router.put ("/moveBranchAfterNote", (req, res) => {
    const {branchId, afterBranchId} = req.params;

    const branchToMove = becca.getBranch(branchId);
    const afterNote = becca.getBranch(afterBranchId);

    const validationResult = treeService.validateParentChild(afterNote.parentNoteId, branchToMove.noteId, branchId);

    if (!validationResult.success) {
        return [200, validationResult];
    }

    const originalAfterNotePosition = afterNote.notePosition;

    // we don't change utcDateModified so other changes are prioritized in case of conflict
    // also we would have to sync all those modified branches otherwise hash checks would fail
    sql.execute("UPDATE branches SET notePosition = notePosition + 10 WHERE parentNoteId = ? AND notePosition > ? AND isDeleted = 0",
        [afterNote.parentNoteId, originalAfterNotePosition]);

    // also need to update becca positions
    const parentNote = becca.getNote(afterNote.parentNoteId);

    for (const childBranch of parentNote.getChildBranches()) {
        if (childBranch.notePosition > originalAfterNotePosition) {
            childBranch.notePosition += 10;
        }
    }

    const movedNotePosition = originalAfterNotePosition + 10;

    if (branchToMove.parentNoteId === afterNote.parentNoteId) {
        branchToMove.notePosition = movedNotePosition;
        branchToMove.save();
    }
    else {
        const newBranch = branchToMove.createClone(afterNote.parentNoteId, movedNotePosition);
        newBranch.save();

        branchToMove.markAsDeleted();
    }

    treeService.sortNotesIfNeeded(parentNote.noteId);

    // if sorting is not needed then still the ordering might have changed above manually
    entityChangesService.addNoteReorderingEntityChange(parentNote.noteId);

    log.info(`Moved note ${branchToMove.noteId}, branch ${branchId} after note ${afterNote.noteId}, branch ${afterBranchId}`);

    return { success: true };
});

router.put ("/setExpanded", (req, res) => {
    const {branchId} = req.params;
    const expanded = parseInt(req.params.expanded);

    if (branchId !== 'root') {
        sql.execute("UPDATE branches SET isExpanded = ? WHERE branchId = ?", [expanded, branchId]);
        // we don't sync expanded label
        // also this does not trigger updates to the frontend, this would trigger too many reloads

        const branch = becca.branches[branchId];

        if (branch) {
            branch.isExpanded = !!expanded;
        }
    }
});

router.put ("/setExpandedForSubtree", (req, res) => {
    const {branchId} = req.params;
    const expanded = parseInt(req.params.expanded);

    let branchIds = sql.getColumn(`
        WITH RECURSIVE
        tree(branchId, noteId) AS (
            SELECT branchId, noteId FROM branches WHERE branchId = ?
            UNION
            SELECT branches.branchId, branches.noteId FROM branches
                JOIN tree ON branches.parentNoteId = tree.noteId
            WHERE branches.isDeleted = 0
        )
        SELECT branchId FROM tree`, [branchId]);

    // root is always expanded
    branchIds = branchIds.filter(branchId => branchId !== 'root');

    sql.executeMany(`UPDATE branches SET isExpanded = ${expanded} WHERE branchId IN (???)`, branchIds);

    for (const branchId of branchIds) {
        const branch = becca.branches[branchId];

        if (branch) {
            branch.isExpanded = !!expanded;
        }
    }

    return {
        branchIds
    };
});

router.delete ("/deleteBranch", (req, res) => {
    const last = req.query.last === 'true';
    const eraseNotes = req.query.eraseNotes === 'true';
    const branch = becca.getBranch(req.params.branchId);
    const taskContext = TaskContext.getInstance(req.query.taskId, 'delete-notes');

    const deleteId = utils.randomString(10);
    const noteDeleted = branch.deleteBranch(deleteId, taskContext);

    if (eraseNotes) {
        noteService.eraseNotesWithDeleteId(deleteId);
    }

    if (last) {
        taskContext.taskSucceeded();
    }

    return {
        noteDeleted: noteDeleted
    };
});

router.put ("/setPrefix", (req, res) => {
    const branchId = req.params.branchId;
    const prefix = utils.isEmptyOrWhitespace(req.body.prefix) ? null : req.body.prefix;

    const branch = becca.getBranch(branchId);
    branch.prefix = prefix;
    branch.save();
});



module.exports = router