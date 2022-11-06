import express from "express";
const router = express.Router();
//import { Role, Guild, Snowflake, Config, getRights, Member, Channel, DiscordApiErrors, handleFile } from "@fosscord/util";
//import { ChannelModifySchema } from "../channels";
//import { DiscordApiErrors, emitEvent, getPermission, getRights, Guild, GuildUpdateEvent, handleFile, Member } from "@fosscord/util";
//import "missing-native-js-functions";
//import { GuildCreateSchema } from "../index";

// Middleware
import { authenticate } from "../../middlewares/authenticate";
import permissions from '../../utils/rolePermConstants';
import checkRolePerms from '../../middlewares/checkRolePermissions';
import rateLimit from '../../middlewares/rateLimit';

// Policies
import UserPresentVerification from '../../middlewares/UserPresentVerification'
import serverPolicy from "../../policies/ServerPolicies";

import servers from "../../models/Servers";


/*
export interface GuildCreateSchema {
	//@maxLength 100
	name: string;
	region?: string;
	icon?: string | null;
	channels?: ChannelModifySchema[];
	guild_template_code?: string;
	system_channel_id?: string;
	rules_channel_id?: string;
}

export interface GuildUpdateSchema extends Omit<GuildCreateSchema, "channels"> {
	banner?: string | null;
	splash?: string | null;
	description?: string;
	features?: string[];
	verification_level?: number;
	default_message_notifications?: number;
	system_channel_flags?: number;
	explicit_content_filter?: number;
	public_updates_channel_id?: string;
	afk_timeout?: number;
	afk_channel_id?: string;
	preferred_locale?: string;
}

router.get("/", route({}), async (req: Request, res: Response) => {
	const { guild_id } = req.params;

	const [guild, member] = await Promise.all([
		Guild.findOneOrFail({ id: guild_id }),
		Member.findOne({ guild_id: guild_id, id: req.user_id })
	]);
	if (!member) throw new HTTPError("You are not a member of the guild you are trying to access", 401);

	// @ts-ignore
	guild.joined_at = member?.joined_at;

	return res.send(guild);
});

router.patch("/", route({ body: "GuildUpdateSchema"}), async (req: Request, res: Response) => {
	const body = req.body as GuildUpdateSchema;
	const { guild_id } = req.params;
	
	
	const rights = await getRights(req.user_id);
	const permission = await getPermission(req.user_id, guild_id);
	
	if (!rights.has("MANAGE_GUILDS")||!permission.has("MANAGE_GUILD"))
		throw DiscordApiErrors.MISSING_PERMISSIONS.withParams("MANAGE_GUILD");
	
	// TODO: guild update check image

	if (body.icon) body.icon = await handleFile(`/icons/${guild_id}`, body.icon);
	if (body.banner) body.banner = await handleFile(`/banners/${guild_id}`, body.banner);
	if (body.splash) body.splash = await handleFile(`/splashes/${guild_id}`, body.splash);

	var guild = await Guild.findOneOrFail({
		where: { id: guild_id },
		relations: ["emojis", "roles", "stickers"]
	});
	// TODO: check if body ids are valid
	guild.assign(body);

	const data = guild.toJSON();
	// TODO: guild hashes
	// TODO: fix vanity_url_code, template_id
	delete data.vanity_url_code;
	delete data.template_id;

	await Promise.all([guild.save(), emitEvent({ event: "GUILD_UPDATE", data, guild_id } as GuildUpdateEvent)]);

	return res.json(data);
});


//TODO: create default channel

router.post("/", route({ body: "GuildCreateSchema", right: "CREATE_GUILDS" }), async (req: Request, res: Response) => {
	const body = req.body as GuildCreateSchema;

	const { maxGuilds } = Config.get().limits.user;
	const guild_count = await Member.count({ id: req.user_id });
	const rights = await getRights(req.user_id);
	if ((guild_count >= maxGuilds)&&!rights.has("MANAGE_GUILDS")) {
		throw DiscordApiErrors.MAXIMUM_GUILDS.withParams(maxGuilds);
	}

	const guild = await Guild.createGuild({ ...body, owner_id: req.user_id });

	const { autoJoin } = Config.get().guild;
	if (autoJoin.enabled && !autoJoin.guilds?.length) {
		// @ts-ignore
		await Config.set({ guild: { autoJoin: { guilds: [guild.id] } } });
	}

	await Member.addToGuild(req.user_id, guild.id);

	res.status(201).json({ id: guild.id });
});

*/

// Create
router.post('/',
  authenticate(),
  rateLimit({name: 'create_server', expire: 60, requestsLimit: 10 }),
  serverPolicy.createServer,
  require("./createServer")
);

// Update
router.patch('/:server_id',
  authenticate(true),
  serverPolicy.updateServer,
  UserPresentVerification,
  require("./updateServer")
);


// mute server
router.put('/:server_id/mute',
  authenticate(),
  UserPresentVerification,
  require("./muteServer")
);

// Get Server
router.get('/:server_id',
  //authenticate(false),
  UserPresentVerification,
  require("./getServer")
);


// Leave Server
router.delete('/:server_id',
  authenticate(),
  UserPresentVerification,
  rateLimit({name: 'leave_server', expire: 60, requestsLimit: 10 }),
  require("./leaveServer")
);

// Delete server
/*
router.post('/:server_id/delete',
  authenticate(),
  UserPresentVerification,
  rateLimit({name: 'delete_server', expire: 60, requestsLimit: 10 }),
  require("./deleteServer")
);
*/

// kick member
router.delete('/:server_id/members/:id',
  authenticate(true),
  UserPresentVerification,
  checkRolePerms('Kick', permissions.roles.KICK_USER),
  require("./kickMember")
);

// banned members
//http://192.168.1.8/api/servers/6583302963345756160/bans
router.get('/:server_id/bans',
  authenticate(true),
  UserPresentVerification,
  checkRolePerms('Ban', permissions.roles.BAN_USER),
  require("./bannedMembers")
)

// ban member
// http://192.168.1.8/api/servers/6583302963345756160/bans/184288888616859408
router.put('/:server_id/bans/:id',
  authenticate(true),
  UserPresentVerification,
  checkRolePerms('Ban', permissions.roles.BAN_USER),
  require("./banMember")
)

// un ban member
// http://192.168.1.8/api/servers/6583302963345756160/bans/184288888616859408
router.delete('/:server_id/bans/:id',
  authenticate(true),
  UserPresentVerification,
  checkRolePerms('Ban', permissions.roles.BAN_USER),
  require("./unBanMember")
)


// Channels
//router.use('/', require('./channels'));

// Invites
//router.use('/', require('./invites'));

// roles
//router.use('/', require('./roles'));

export default router;
