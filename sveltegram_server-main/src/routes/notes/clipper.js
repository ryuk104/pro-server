const express = require("express");
const router = express.Router();
const attributeService = require("../../services/attributes");
const noteService = require('../../services/notes');
const dateNoteService = require('../../services/date_notes');
const dateUtils = require('../../services/date_utils');
const imageService = require('../../services/image');
const appInfo = require('../../services/app_info');
const ws = require('../../services/ws');
const log = require('../../services/log');
const utils = require('../../services/utils');
const path = require('path');
const Attribute = require('../../becca/entities/attribute');
const htmlSanitizer = require('../../services/html_sanitizer');
const {formatAttrForSearch} = require("../../services/attribute_formatter");


router.get ("/findClippingNote", (req, res, todayNote, pageUrl ) => {
    const notes = todayNote.searchNotesInSubtree(
        formatAttrForSearch({
            type: 'label',
            name: "pageUrl",
            value: pageUrl
        }, true)
    );

    for (const note of notes) {
        if (note.getOwnedLabelValue('clipType') === 'clippings') {
            return note;
        }
    }

    return null;
});

router.get ("/getClipperInboxNote", (req, res) => {
    let clipperInbox = attributeService.getNoteWithLabel('clipperInbox');

    if (!clipperInbox) {
        clipperInbox = dateNoteService.getDayNote(dateUtils.localNowDate());
    }

    return clipperInbox;
});

router.post ("/addClipping", (req, res) => {
    const {title, content, pageUrl, images} = req.body;

    const clipperInbox = getClipperInboxNote();

    let clippingNote = findClippingNote(clipperInbox, pageUrl);

    if (!clippingNote) {
        clippingNote = noteService.createNewNote({
            parentNoteId: clipperInbox.noteId,
            title: title,
            content: '',
            type: 'text'
        }).note;

        clippingNote.setLabel('clipType', 'clippings');
        clippingNote.setLabel('pageUrl', pageUrl);
        clippingNote.setLabel('iconClass', 'bx bx-globe');
    }

    const rewrittenContent = processContent(images, clippingNote, content);

    const existingContent = clippingNote.getContent();

    clippingNote.setContent(existingContent + (existingContent.trim() ? "<br/>" : "") + rewrittenContent);

    return {
        noteId: clippingNote.noteId
    };
});

router.post ("/createNote", (req, res) => {
    let {title, content, pageUrl, images, clipType} = req.body;

    if (!title || !title.trim()) {
        title = "Clipped note from " + pageUrl;
    }

    const clipperInbox = getClipperInboxNote();

    const {note} = noteService.createNewNote({
        parentNoteId: clipperInbox.noteId,
        title,
        content,
        type: 'text'
    });

    note.setLabel('clipType', clipType);

    if (pageUrl) {
        note.setLabel('pageUrl', pageUrl);
        note.setLabel('iconClass', 'bx bx-globe');
    }

    const rewrittenContent = processContent(images, note, content);

    note.setContent(rewrittenContent);

    return {
        noteId: note.noteId
    };
});

router.get ("/processContent", (req, res, images, note, content) => {
    let rewrittenContent = htmlSanitizer.sanitize(content);

    if (images) {
        for (const {src, dataUrl, imageId} of images) {
            const filename = path.basename(src);

            if (!dataUrl || !dataUrl.startsWith("data:image")) {
                const excerpt = dataUrl
                    ? dataUrl.substr(0, Math.min(100, dataUrl.length))
                    : "null";

                log.info("Image could not be recognized as data URL: " + excerpt);
                continue;
            }

            const buffer = Buffer.from(dataUrl.split(",")[1], 'base64');

            const {note: imageNote, url} = imageService.saveImage(note.noteId, buffer, filename, true);

            new Attribute({
                noteId: imageNote.noteId,
                type: 'label',
                name: 'archived'
            }).save(); // so that these image notes don't show up in search / autocomplete

            new Attribute({
                noteId: note.noteId,
                type: 'relation',
                name: 'imageLink',
                value: imageNote.noteId
            }).save();

            log.info(`Replacing '${imageId}' with '${url}' in note '${note.noteId}'`);

            rewrittenContent = utils.replaceAll(rewrittenContent, imageId, url);
        }
    }

    // fallback if parsing/downloading images fails for some reason on the extension side (
    rewrittenContent = noteService.downloadImages(note.noteId, rewrittenContent);

    return rewrittenContent;
});

router.post ("/openNote", (req, res) => {
    if (utils.isElectron()) {
        ws.sendMessageToAllClients({
            type: 'openNote',
            noteId: req.params.noteId
        });

        return {
            result: 'ok'
        };
    }
    else {
        return {
            result: 'open-in-browser'
        }
    }
});

router.get ("/handshake", (req, res) => {
    return {
        appName: "trilium",
        protocolVersion: appInfo.clipperProtocolVersion
    }
});



module.exports = router;
