import { Client } from "@stomp/stompjs";
import SockJS from 'sockjs-client';
import APIConfig from "../configs/API.config";

export function createStompClient() {
    const token = localStorage.getItem('token') ?? '';
    const client = new Client({
        webSocketFactory: () => new SockJS(`${APIConfig}/ws`),
        connectHeaders: { Authorization: `Bearer ${token}` },
        debug: () => {},             // 필요 시 console.log
        reconnectDelay: 5000,        // 자동 재연결(ms)
        heartbeatIncoming: 10000,
        heartbeatOutgoing: 10000,
    });
    return client;
}