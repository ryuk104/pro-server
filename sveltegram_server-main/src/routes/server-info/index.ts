import express from "express";
const router = express.Router();



import { Authenticated } from '../../decorators/authenticated.decorator';



  router.get("/",
  require("./getServerInfo"),
  //getServerInfo
  return await this.serverInfoService.getServerInfo();
  )


  router.get('/version',
  require("./getServerInfo")
  //getServerVersion
    return serverVersion;
  )

  @Authenticated({ admin: true },
  router.get('/stats',
  require("./getStats")
  )
  //getStats
  //return await this.serverInfoService.getStats();
  })
