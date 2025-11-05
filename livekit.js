// livekit.js
const { AccessToken } = require('livekit-server-sdk');

const LIVEKIT_API_KEY = 'devkey';
const LIVEKIT_API_SECRET = 'secret';
const LIVEKIT_URL = 'ws://127.0.0.1:7880';

function createAgentToken(identity = 'ai-agent') {
  const at = new AccessToken(LIVEKIT_API_KEY, LIVEKIT_API_SECRET, { identity });
  at.addGrant({ roomJoin: true, room: 'salon-room', roomAdmin: true });
  return at.toJwt();
}

module.exports = { createAgentToken, LIVEKIT_URL };
