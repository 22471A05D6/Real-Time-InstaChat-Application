// frontend/src/pages/VideoCallPage.jsx
import { useEffect, useRef } from 'react';

export default function VideoCallPage({ roomID }) {
  const containerRef = useRef(null);

  useEffect(() => {
    const appID = 1576726020; // replace with yours
    const serverSecret = '20269e7d7408b605899b9ee995546857'; // replace with yours
    const userID = 'user_' + Date.now();
    const userName = userID;

    const kitToken = window.ZegoUIKitPrebuilt.generateKitTokenForTest(
      appID,
      serverSecret,
      roomID,
      userID,
      userName
    );

    const zp = window.ZegoUIKitPrebuilt.create(kitToken);
    zp.joinRoom({
      container: containerRef.current,
      scenario: {
        mode: window.ZegoUIKitPrebuilt.VideoConference
      },
      showPreJoinView: false
    });
  }, [roomID]);

  return (
    <div>
      <h2 className="text-center mt-3">📹 Video Call</h2>
      <div ref={containerRef} style={{ width: '100%', height: '600px' }} />
    </div>
  );
}
