module.exports = async (req, res, next) => {
    const album = await this._getAlbum({ authUser, albumId });
    await this._albumRepository.delete(album);
};

    
async delete(album: AlbumEntity): Promise<void> {
  await this.albumRepository.delete({ id: album.id, ownerId: album.ownerId });
}