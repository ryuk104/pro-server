import express from "express";
const router = express.Router();


import { AuthUserDto, GetAuthUser } from '../../decorators/auth-user.decorator';
import { Authenticated } from '../../decorators/authenticated.decorator';
import { DeviceInfoService } from './device-info.service';

//Authenticated()

constructor(private readonly deviceInfoService: DeviceInfoService) {}

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
