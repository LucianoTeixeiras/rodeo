import _ from 'lodash';
import reduxUtil from '../../services/redux-util';

// Don't share with other windows
// Setting this means these actions will not be broadcast
const sender = 'self',
  prefixType = reduxUtil.fromFilenameToPrefix(__filename);

function createCommand(groupId, id, payload) {
  return {type: prefixType + 'COMMAND', groupId, id, payload, meta: {sender}};
}

export default {
  createCommand
};
