import express from "express";

import { DeviceInfoService } from './services/device-info';

const router = express.Router();

// Middleware
const { authenticate } = require("../../middlewares/authenticate");


// register device
router.post("/",
  authenticate(),
  require("./registerDevice")
);

/*
router.post("/",
  require("./createDeviceInfo"),
  //createDeviceInfo,
  //@Body(ValidationPipe) createDeviceInfoDto: CreateDeviceInfoDto,
  //@GetAuthUser() authUser: AuthUserDto,
  //Promise<DeviceInfoResponseDto> {
  //return this.deviceInfoService.create(createDeviceInfoDto, authUser);
  );

router.patch("/",
  require("./updateDeviceInfo"),
  //updateDeviceInfo,
  //@Body(ValidationPipe) updateDeviceInfoDto: UpdateDeviceInfoDto,
  //@GetAuthUser() authUser: AuthUserDto,
  //Promise<DeviceInfoResponseDto> {
  //return this.deviceInfoService.update(authUser.id, updateDeviceInfoDto);
  );
  */




export default router;




  
