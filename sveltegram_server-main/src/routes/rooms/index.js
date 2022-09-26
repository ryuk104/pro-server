import express from "express";
const router = express.Router({mergeParams: true});

const {get} = require('../../services/rediss');
const {activeUsersInRoom} = require('../../services/ws');
const {isAdmin, addAdmin, removeAdmin, identityIsAdmin} = require('./auth');


const verifyAdmin = async (req, res, next) => {
  if (await isAdmin(req)) {
    next();
    return;
  }
  res.sendStatus(403);
};

const cors = require('cors');
const logger = require('morgan');

const {ssr} = require('./ssr');

require('../../services/initDb')();

const metricsRouter = require('./metrics');
const adminRouter = require('./admin');

import {roomAuthenticator, identityAuthenticator} from './auth';
import {controller} from './controller';
import roomKeyRouter from './roomKey';

//app.use(logger('dev'));
//app.use(cors());
//app.use(express.json({limit: '500kb'}));
//app.use(ssr);

//app.use('/', indexRouter);
//app.use('/metrics', metricsRouter);

/*
app.use(
  '/api/v1/',
  controller(
    'rooms',
    roomAuthenticator,
    id => id,
    () => 'room-info'
  )
);
*/



//roomkeys
//router.use('/rooms/:id/roomKey', roomKeyRouter);

/*
router.post('/:id/roomKey', verifyModerator, async function (req, res) {
  const roomId = req.params.id;
  await set(`rooms/${roomId}/roomKey`, req.body);
  res.json({success: true});
});

router.get('/:id/roomKey', verifyRoomKeyAccess, async (req, res) => {
  const roomId = req.params.id;
  const key = await get(`rooms/${roomId}/roomKey`);
  res.json(key);
});
*/

//liveroom
router.get('/:id/live', async (req, res) => {
  let roomId = req.params.id;
  let peerIds = await activeUsersInRoom(roomId);
  console.log(`user ids in room ${roomId}`, peerIds);
  let users = await Promise.all(peerIds.map(id => get(`identities/${id}`)));
  console.log(`users in room ${roomId}`, users);
  res.json(users);
});



router.use('/api/v1/', controller('identities', identityAuthenticator));




//admin routes
router.use('/api/v1/admin/', adminRouter);

router.get('/admin/:identity', async (req, res) => {
  res.json({admin: await identityIsAdmin([req.params.identity])});
});

router.post('/admin/:identity', verifyAdmin, async (req, res) => {
  const serverAdminId = req.params.identity;
  await addAdmin(serverAdminId);
  res.json({success: true});
});

router.delete('/admin/:identity', verifyAdmin, async (req, res) => {
  const serverAdminId = req.params.identity;
  await removeAdmin(serverAdminId);
  res.json({success: true});
});

export default router;