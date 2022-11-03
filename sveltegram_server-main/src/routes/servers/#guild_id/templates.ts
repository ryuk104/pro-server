import { route } from "@fosscord/api";
import { generateCode, Guild, HTTPError, OrmUtils, Template } from "@fosscord/util";
import { Request, Response, Router } from "express";

const router: Router = Router();

const TemplateGuildProjection: (keyof Guild)[] = [
	"name",
	"description",
	"region",
	"verification_level",
	"default_message_notifications",
	"explicit_content_filter",
	"preferred_locale",
	"afk_timeout",
	"roles",
	// "channels",
	"afk_channel_id",
	"system_channel_id",
	"system_channel_flags",
	"icon"
];

router.get("/", route({}), async (req: Request, res: Response) => {
	const { guild_id } = req.params;

	let templates = await Template.find({ where: { source_guild_id: guild_id } });

	return res.json(templates);
});

router.post("/", route({ body: "TemplateCreateSchema", permission: "MANAGE_GUILD" }), async (req: Request, res: Response) => {
	const { guild_id } = req.params;
	const guild = await Guild.findOneOrFail({ where: { id: guild_id }, select: TemplateGuildProjection });
	const exists = await Template.findOneOrFail({ where: { id: guild_id } }).catch((e) => {});
	if (exists) throw new HTTPError("Template already exists", 400);

	const template = await OrmUtils.mergeDeep(new Template(), {
		...req.body,
		code: generateCode(),
		creator_id: req.user_id,
		created_at: new Date(),
		updated_at: new Date(),
		source_guild_id: guild_id,
		serialized_source_guild: guild
	}).save();

	res.json(template);
});

router.delete("/:code", route({ permission: "MANAGE_GUILD" }), async (req: Request, res: Response) => {
	const { code, guild_id } = req.params;

	const template = await Template.delete({
		code,
		source_guild_id: guild_id
	});

	res.json(template);
});

router.put("/:code", route({ permission: "MANAGE_GUILD" }), async (req: Request, res: Response) => {
	const { code, guild_id } = req.params;
	const guild = await Guild.findOneOrFail({ where: { id: guild_id }, select: TemplateGuildProjection });

	const template = await OrmUtils.mergeDeep(new Template(), { code, serialized_source_guild: guild }).save();

	res.json(template);
});

router.patch("/:code", route({ body: "TemplateModifySchema", permission: "MANAGE_GUILD" }), async (req: Request, res: Response) => {
	const { code, guild_id } = req.params;
	const { name, description } = req.body;

	const template = await OrmUtils.mergeDeep(new Template(), {
		code,
		name: name,
		description: description,
		source_guild_id: guild_id
	}).save();

	res.json(template);
});

export default router;
