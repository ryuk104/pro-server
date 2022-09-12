const express = require("express");
const router = express.Router();
const passwordService = require('../../services/password');

router.post ("/changePassword", (req, res) => {
    if (passwordService.isPasswordSet()) {
        return passwordService.changePassword(req.body.current_password, req.body.new_password);
    }
    else {
        return passwordService.setPassword(req.body.new_password);
    }
});

router.post ("/resetPassword", (req, res) => {
    // protection against accidental call (not a security measure)
    if (req.query.really !== "yesIReallyWantToResetPasswordAndLoseAccessToMyProtectedNotes") {
        return [400, "Incorrect password reset confirmation"];
    }

    return passwordService.resetPassword();
});


module.exports = router;
