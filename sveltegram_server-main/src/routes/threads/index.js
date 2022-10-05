import express from "express";
const router = express.Router();

import followMessage from './followMessage';
import getThreadsList from './getThreadMessages';
import getThreadMessages from './getThreadsList';
import unfollowMessage from './unfollowMessage';

//import './hooks';
//import './methods';
//import './server/settings';


//router.post("/notfi", notifyUsersOnReply)

router.post("/followmessage", followMessage)

//router.post("/reply", reply)

//router.post("/undoreply", undoreply)

//router.post("/follow", follow)

router.post("/unfollowmessage", unfollowMessage) 

//router.get("/readthread", readThread)

//router.get("/readAllThreads", readAllThreads)

router.get ("/getThreadMessages", getThreadMessages)

router.get("/getThreadsList", getThreadsList)




export default router;





