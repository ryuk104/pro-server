async update(userId: string, updateDeviceInfoDto: UpdateDeviceInfoDto): Promise<DeviceInfoResponseDto> {
    const deviceInfo = await this.deviceRepository.findOne({
      where: { deviceId: updateDeviceInfoDto.deviceId, userId: userId },
    });

    if (!deviceInfo) {
      throw new NotFoundException('Device Not Found');
    }

    const res = await this.deviceRepository.update(
      {
        id: deviceInfo.id,
      },
      updateDeviceInfoDto,
    );

    if (res.affected == 1) {
      const updatedDeviceInfo = await this.deviceRepository.findOne({
        where: { deviceId: updateDeviceInfoDto.deviceId, userId: userId },
      });

      if (!updatedDeviceInfo) {
        throw new NotFoundException('Device Not Found');
      }

      return mapDeviceInfoResponse(updatedDeviceInfo);
    } else {
      throw new BadRequestException('Bad Request');
    }
  }