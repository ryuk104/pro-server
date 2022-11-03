import { getVoiceRegions, route } from "@fosscord/api";
import { getIpAdress, Guild } from "@fosscord/util";
import { Request, Response, Router } from "express";

const router = Router();

router.get("/", route({}), async (req: Request, res: Response) => {
	const { guild_id } = req.params;
	const guild = await Guild.findOneOrFail({ where: { id: guild_id } });
	//TODO we should use an enum for guild's features and not hardcoded strings
	return res.json(await getVoiceRegions(getIpAdress(req), guild.features.includes("VIP_REGIONS")));
});

export default router;
