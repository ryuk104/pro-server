
module.exports = async (req, res, next) => {
  if (req.channel.server) {
    res.json({
      name: req.channel.name,
      channelId: req.channel.channelId,
      server_id: req.channel.server_id,
    });
  } else {
    res.json({
      recipients: req.channel.recipients,
      channelId: req.channel.channelId,
    });
  }
};
/*
router.get("/", route({ permission: "VIEW_CHANNEL" }), async (req: Request, res: Response) => {
	const { channel_id } = req.params;

	const channel = await Channel.findOneOrFail({ where: { id: channel_id } });

	return res.send(channel);
});
*/ 