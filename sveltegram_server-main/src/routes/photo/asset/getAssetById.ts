import asset from '../../../models/photo/asset';
import User from '../../../models/user';



module.exports = async (req, res, next) => {
const { assetId } = req.params;

  asset.findById(assetId)
    .then(asset =>{
        res.json({asset})
    })
    .catch(err=>{
        console.log(err)
    })

  }



/*

  async getAllByDeviceId(userId: string, deviceId: string): Promise<string[]> {
    const rows = await this.assetRepository.find({
      where: {
        userId: userId,
        deviceId: deviceId,
      },
      select: ['deviceAssetId'],
    });
    const res: string[] = [];
    rows.forEach((v) => res.push(v.deviceAssetId));

    return res;
  }
  */
