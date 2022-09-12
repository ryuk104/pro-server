import {put, apiUrl} from './backend';
import {staticConfig} from './config';
import {use} from '../lib/state-tree';
import GetRequest, {getCache} from '../lib/GetRequest';
import {useStableObject} from '../lib/state-diff';
import Speakers from './room/Speakers';

export {RoomState, addModerator, removeModerator, emptyRoom};
export {addSpeaker, removeSpeaker} from './room/Speakers';
export {addPresenter, removePresenter} from './room/Presenters';

function RoomState({roomId, myIdentity, peerState, myPeerState}) {
  const path = roomId && `${apiUrl()}/rooms/${roomId}`;
  let {data, isLoading} = use(GetRequest, {path});
  let hasRoom = !!data;
  let room = data ?? emptyRoom;
  let {moderators, presenters, stageOnly} = room;
  let myId = myIdentity.publicKey;
  let accessRestricted = !!room.access?.identities;

  let speakers = use(Speakers, {
    roomId,
    hasRoom,
    room,
    peerState,
    myPeerState,
    myIdentity,
  });

  room = useStableObject({...room, speakers});

  let iAmModerator = moderators.includes(myId);
  let iAmSpeaker = !!stageOnly || speakers.includes(myId);
  let iAmPresenter = presenters.includes(myId);
  let iAmAuthorized =
    !accessRestricted || room.access?.identities.includes(myId);

  return {
    roomId,
    room,
    hasRoom,
    isRoomLoading: isLoading,
    iAmSpeaker,
    iAmModerator,
    iAmAuthorized,
    iAmPresenter,
  };
}

const emptyRoom = {
  name: '',
  description: '',
  ...(staticConfig.defaultRoom ?? null),
  speakers: [],
  moderators: [],
  presenters: [],
};

function getCachedRoom(roomId) {
  if (!roomId) return null;
  return getCache(`${apiUrl()}/rooms/${roomId}`).data;
}

async function addModerator(state, roomId, peerId) {
  let room = getCachedRoom(roomId);
  if (room === null) return false;
  let {moderators = []} = room;
  if (moderators.includes(peerId)) return true;
  let newRoom = {...room, moderators: [...moderators, peerId]};
  return await put(state, `/rooms/${roomId}`, newRoom);
}

async function removeModerator(state, roomId, peerId) {
  let room = getCachedRoom(roomId);
  if (room === null) return false;
  let {moderators = []} = room;
  if (!moderators.includes(peerId)) return true;
  let newRoom = {...room, moderators: moderators.filter(id => id !== peerId)};
  return await put(state, `/rooms/${roomId}`, newRoom);
}
