import Server from "../../models/Servers";

module.exports = async (req, res, next) => {
  res.json({
    name: req.server.name,
    avatar: req.server.avatar,
    default_channel_id: req.server.default_channel_id,
    server_id: req.server.server_id,
    created: req.server.created,
    banner: req.server.banner,
  })

}


  /*
  try{
    const { server_id } = req.params;
    //let name;

    //const servername = await Server.find({ name })
    //const avatar = await Server.find({avatar: server_id})
    //const default_channel_id = await Server.find({default_channel_id: server_id})
    const serversserver_id = await Server.find({ server_id: server_id })
    //const created = await Server.find({created: server_id})
    //const banner = await Server.find({banner: server_id})

  

  return res.status(200).json({
    type: "success",
      data:{
        name: req.Server.name,
        serversserver_id,
        //avatar,
        //default_channel_id,
        //server_id: serversserver_id,
        //created: created,
        //banner: banner
      }
    });

  } catch (error) {
      next(error);
    }
  };
/*
 res.json({
   name: req.servers.name,
   avatar: req.servers.avatar,
   default_channel_id: req.servers.default_channel_id,
   server_id: req.servers.server_id,
   created: req.servers.created,
   banner: req.servers.banner,
 })
*/


