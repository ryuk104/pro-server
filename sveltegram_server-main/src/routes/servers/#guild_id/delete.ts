import { route } from "@fosscord/api";
import { emitEvent, Guild, GuildDeleteEvent, HTTPError } from "@fosscord/util";
import { Request, Response, Router } from "express";

const router = Router();

// discord prefixes this route with /delete instead of using the delete method
// docs are wrong https://discord.com/developers/docs/resources/guild#delete-guild
router.post("/", route({}), async (req: Request, res: Response) => {
	let { guild_id } = req.params;

	const guild = await Guild.findOneOrFail({ where: { id: guild_id }, select: ["owner_id"] });
	if (guild.owner_id !== req.user_id) throw new HTTPError("You are not the owner of this guild", 401);

	await Promise.all([
		Guild.delete({ id: guild_id }), // this will also delete all guild related data
		emitEvent({
			event: "GUILD_DELETE",
			data: {
				id: guild_id
			},
			guild_id: guild_id
		} as GuildDeleteEvent)
	]);

	return res.sendStatus(204);
});

export default router;
