import asset from '../../../models/photo/asset';
import User from '../../../models/user';




module.exports = async (req, res, next) => {


  const { assetId } = req.params;

  asset.findOne(assetId)
  if (!asset) {
    return res
    .status(404)
    .json({ message: "Invalid ID" });
  } else {
    asset.findOneAndDelete(assetId);
    res.json("deleted")

  }

/*
    try {
        await Photo.findOneAndDelete({_id:id})
        return response.status(200).json({message:'Deleted'})
    } catch (error) {
        return response.status(400).json({error})
    }
    */
}

  
/*

    const target = assetIds.ids;
    for (const assetId of target) {
      const res = await this.assetRepository.delete({
        id: assetId,
        userId: authUser.id,
      });

      if (res.affected) {
        result.push({
          id: assetId,
          status: DeleteAssetStatusEnum.SUCCESS,
        });
      } else {
        result.push({
          id: assetId,
          status: DeleteAssetStatusEnum.FAILED,
        });
      }
    }

    return result;
  }

  */





