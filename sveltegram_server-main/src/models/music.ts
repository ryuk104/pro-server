export class CreateArtistDto {
    name: string;
    addedBy: string;
  }
  

  export type CreatePlaylistDto = {
    author: string;
    name: string;
    private: boolean;
    tracks: {
      name: string;
      artist: string;
    }[];
  };
  
  export type UpdatePlaylistDto = Pick<CreatePlaylistDto, 'author'> & Partial<CreatePlaylistDto>;
  

  export class CreateTrackDto {
    name: string;
    artistId: string;
    playlistId: string;
    addedBy: string;
  }
  