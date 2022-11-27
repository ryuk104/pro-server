import {Channels} from "../models/Channels";
import servers from "../models/Servers";
import { ServerRoles } from "../models/ServerRoles";
import { ServerMembers } from "../models/ServerMembers";
import redis from "../services/redis/redis";
import { getServerChannel, addServer, getServer, addChannel } from "../services/redis/newRedisWrapper";
import User from "../models/user";

//check if user is in the server.
const UserPresentVerification = async (req, res, next) => {
  const serverID = req.params.server_id;
  const channelId = req.params.channel_id || req.params.channelId;

  


  // check if server is in cache
  const cacheServer = JSON.parse((await getServer(serverID))[0] || null);

  if (cacheServer) {
    // check if member is in cache
    const cacheMember = JSON.parse((await redis.getServerMember(User.id, serverID)).Results || null);
    if (cacheMember) {
      req.permissions = cacheMember.permissions;
      req.highestRolePosition = cacheMember.highestRolePosition;
      req.server = cacheServer;
      if (channelId) {
        // check if channel is in cache
        const cacheChannel = JSON.parse((await getServerChannel(channelId))[0] || null);
        if (cacheChannel && cacheChannel.server_id && cacheChannel.server_id === serverID) {
          req.channel = cacheChannel;
          return next()
        }
      } else {
        return next();
      }
    }
  }





  const server = await servers.findOne({ server_id: serverID }).select("+verified").lean();
  if (!server) {
    return res.status(404).json({
      message: "Server doesn't exist!"
    });
  }
  await addServer(server.server_id, server);

  const member = await ServerMembers.findOne({
    server: server._id,
    member: User._id
  }, {_id: 0}).select('roles').lean();

  if (!member){
    return res.status(404).json({
      message: "Member doesn't exist in the server!"
    });
  }

  let permissions = 0;
  let highestRolePosition = 0;

  if (member.roles && member.roles.length) {
    const roles = await ServerRoles.find({id: {$in: member.roles}}, {_id: 0}).select('permissions order').lean();
    highestRolePosition = Math.min(...roles.map(r => r.order));

    for (let index = 0; index < roles.length; index++) {
      const perm = roles[index].permissions;
      if (perm) {
        permissions = permissions | perm;
      }
    }
  }

  // add default role
  const defaultRole = await ServerRoles.findOne({default: true, server: server._id}, {_id: 0}).select('permissions').lean();
  permissions = permissions| defaultRole.permissions;

  req.permissions = permissions;
  req.highestRolePosition = highestRolePosition;
  await redis.addServerMember(User._id, server.server_id, JSON.stringify({permissions, highestRolePosition}));
  

  if (channelId) {
    // check if channel exists in the server
    const channel = await Channels.findOne({server_id: serverID, channelId: channelId}).lean()
    if (!channel) {
      console.log("urafuckingdumbass")
      return res.status(404).json({
        message: "ChannelID is invalid or does not exist in the server."
      });
    }
    await addChannel(channelId, Object.assign({}, channel, {server: undefined, server_id: server.server_id}), User.id );
    req.channel = channel;
  }

  // used to convert ObjectID to string
  req.server = JSON.parse(JSON.stringify(server));
  next();
};

export default UserPresentVerification;

