import { Channel, emitEvent, GuildDeleteEvent, Guild, Member, Message, Role, Invite, Emoji } from "@fosscord/util";
import { Router, Request, Response } from "express";
import { HTTPError } from "lambert-server";
import { route } from "@fosscord/api";
import deleteServer from "../../utils/deleteServer";

const router = Router();

module.exports = async (req, res, next) => {
  // check if its the creator and delete the server.
  if (req.server.creator !== req.user._id) {
    return res.status(403).json({message: "Only the creator of the servers can delete servers."});
  }
  deleteServer(req.io, req.server.server_id, req.server, (err, status) => {
    if (err) return res.status(403).json({message: err.message});
    if (!status) return res.status(403).json({message: "Something went wrong. Try again later."});
    res.json({ status: "Done!" });
  })
  
};

// discord prefixes this route with /delete instead of using the delete method
// docs are wrong https://discord.com/developers/docs/resources/guild#delete-guild
router.post("/", route({}), async (req: Request, res: Response) => {
	var { guild_id } = req.params;

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
