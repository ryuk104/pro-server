import { Devices } from '../../models/Devices';

module.exports = async (req, res, next) => {

  const res = await Devices.findOne({
        deviceId: createDeviceInfoDto.deviceId,
        userId: req.user.id,
    });

    if (res) {
      console.log('Device Info Exist', 'createDeviceInfo');
    }

    const deviceInfo = new DeviceInfoEntity();
    deviceInfo.deviceId = createDeviceInfoDto.deviceId;
    deviceInfo.deviceType = createDeviceInfoDto.deviceType;
    deviceInfo.userId = authUser.id;

    const newDeviceInfo = await Devices.save(deviceInfo);

  }
