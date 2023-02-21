import express from "express";
const router = express.Router();






  router.get("/",
  require("./getServerInfo"),
  //getServerInfo
  //return await this.serverInfoService.getServerInfo();
  )


  router.get('/version',
  require("./getServerInfo")
  //getServerVersion
  //return serverVersion;
  )

  router.get('/stats',
  require("./getStats")
  )
  //getStats
  //return await this.serverInfoService.getStats();
  
