import { useEffect } from 'react';
import { createStompClient } from '../socket/stompClient';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function useAttendanceStomp(onEvent: (msg: any) => void) {
  useEffect(() => {
    const client = createStompClient();
    client.onConnect = () => {
      client.subscribe('/user/queue/attendance', (msg) => onEvent(msg));
    };
    client.activate();

    // cleanup은 동기 처리 (Promise 반환 금지)
    return () => { void client.deactivate(); };
  }, [onEvent]);
}