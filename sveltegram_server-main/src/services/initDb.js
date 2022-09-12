const {get, set} = require('./rediss');
const {serverAdminId} = require('../routes/rooms/config');

const {addAdmin} = require('../routes/rooms/auth');

const initDb = async () => {
  if (serverAdminId && serverAdminId.length > 0) {
    await addAdmin(serverAdminId);
  }
};

module.exports = initDb;
