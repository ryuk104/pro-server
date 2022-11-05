import express from "express";
const router = express.Router();
import { User, UserSettings } from "@fosscord/util";


export interface UserSettingsSchema extends Partial<UserSettings> {}

router.patch("/", route({ body: "UserSettingsSchema" }), async (req, res) => {
	const body = req.body as UserSettings;
	if (body.locale === "en") body.locale = "en-US"; // fix discord client crash on unkown locale

	const user = await User.findOneOrFail({ id: req.user_id, bot: false });
	user.settings = { ...user.settings, ...body };
	await user.save();

	res.sendStatus(204);
});

router.get("/email-settings", (req, res) => {
	// TODO:
	res.json({
		categories: {
			social: true,
			communication: true,
			tips: false,
			updates_and_announcements: false,
			recommendations_and_events: false
		},
		initialized: false
	}).status(200);
});
export default router;
