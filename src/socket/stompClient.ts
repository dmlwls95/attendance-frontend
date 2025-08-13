import { Client } from '@stomp/stompjs';
import APIConfig from '../configs/API.config';

function toWs(url: string) {
  return url.replace(/^http:\/\//i, 'ws://').replace(/^https:\/\//i, 'wss://');
}

export function createStompClient() {
  const token = localStorage.getItem('token') ?? '';
  const client = new Client({
    brokerURL: `${toWs(APIConfig)}/ws`, // ✅ ws(s) + /ws/websocket
    connectHeaders: { Authorization: `Bearer ${token}` },
    reconnectDelay: 5000,
    heartbeatIncoming: 10000,
    heartbeatOutgoing: 10000,
    // debug: console.log,
  });
  return client;
}
