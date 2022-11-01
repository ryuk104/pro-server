async create(createDeviceInfoDto: CreateDeviceInfoDto, authUser: AuthUserDto): Promise<DeviceInfoResponseDto> {
    const res = await this.deviceRepository.findOne({
      where: {
        deviceId: createDeviceInfoDto.deviceId,
        userId: authUser.id,
      },
    });

    if (res) {
      Logger.log('Device Info Exist', 'createDeviceInfo');
      return mapDeviceInfoResponse(res);
    }

    const deviceInfo = new DeviceInfoEntity();
    deviceInfo.deviceId = createDeviceInfoDto.deviceId;
    deviceInfo.deviceType = createDeviceInfoDto.deviceType;
    deviceInfo.userId = authUser.id;

    const newDeviceInfo = await this.deviceRepository.save(deviceInfo);

    return mapDeviceInfoResponse(newDeviceInfo);
  }