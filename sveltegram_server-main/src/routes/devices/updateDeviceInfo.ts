import { Devices } from '../../models/Devices';

module.exports = async (req, res, next) => {
Devices.findOne({ deviceId: updateDevice, userId: req.user.id})

if (!deviceInfo) {
  console.log('Device Not Found');
}

const res = await Devices.update(
  {
    id: deviceInfo.id,
  },
);

if (res.affected == 1) {
  const updatedDeviceInfo = await Devices.findOne({
    deviceId: updateDeviceInfoDto.deviceId, 
    userId: userId ,
  });

  if (!updatedDeviceInfo) {
    throw new NotFoundException('Device Not Found');
  }

} else {
  console.log('Bad Request');
}

}


    
  