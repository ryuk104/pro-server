import asset from '../../../models/photo/asset';
import fs from "fs"


module.exports = async (req, res, next) => {

  try {
    let fileReadStream = null;
    const assets = asset.find({asset: req.asset.id});

    // Download Video
    if (assets.type === "VIDEO") {
      const { size } = await assets.fileInfo(asset.originalPath);

      res.set({
        'Content-Type': asset.mimeType,
        'Content-Length': size,
      });

      await fs.access(asset.originalPath,;
      fileReadStream = createReadStream(asset.originalPath);
    } else {
      // Download Image
      if (!query.isThumb) {
        /**
         * Download Image Original File
         */
        const { size } = await fileInfo(asset.originalPath);

        res.set({
          'Content-Type': asset.mimeType,
          'Content-Length': size,
        });

        await fs.access(asset.originalPath, constants.R_OK | constants.W_OK);
        fileReadStream = createReadStream(asset.originalPath);
      } else {
        /**
         * Download Image Resize File
         */
        if (!asset.resizePath) {
          throw new NotFoundException('resizePath not set');
        }

        const { size } = await fileInfo(asset.resizePath);

        res.set({
          'Content-Type': 'image/jpeg',
          'Content-Length': size,
        });

        await fs.access(asset.resizePath, constants.R_OK | constants.W_OK);
        fileReadStream = createReadStream(asset.resizePath);
      }
    }

    return new StreamableFile(fileReadStream);
  } catch (e) {
    console.error(`Error download asset ${e}`, 'downloadFile');
  }

}


