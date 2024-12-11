import React, { useEffect, useRef, useState } from 'react';
import Peer from 'simple-peer';
import io from 'socket.io-client';

const socket = io('http://localhost:5001', { autoConnect: false });

function VideoCall({ socket }) {
  const [myId, setMyId] = useState('');
  const [stream, setStream] = useState(null);
  const [receivingCall, setReceivingCall] = useState(false);
  const [caller, setCaller] = useState('');
  const [callerSignal, setCallerSignal] = useState(null);
  const [callAccepted, setCallAccepted] = useState(false);
  const [callEnded, setCallEnded] = useState(false);
  const [otherUserId, setOtherUserId] = useState(''); // Aramak istediğiniz kullanıcının ID'si için
  const [iceServers, setIceServers] = useState([]); // ICE sunucuları için state
  const myVideo = useRef();
  const userVideo = useRef();
  const connectionRef = useRef();

  useEffect(() => {
    // Kullanıcının kamerasını ve mikrofonunu al
    navigator.mediaDevices.getUserMedia({ video: true, audio: true })
      .then((stream) => {
        setStream(stream);
        if (myVideo.current) {
          myVideo.current.srcObject = stream;
        }
      })
      .catch((err) => console.error("Error accessing media devices:", err));

    socket.on('connect', () => {
      setMyId(socket.id);
      console.log('Socket ID:', socket.id);
    });

    socket.on('iceServers', (servers) => {
      console.log('Alınan ICE sunucuları:', servers);
      setIceServers(servers);
    });

    socket.on('callUser', (data) => {
      console.log('callUser olayı alındı:', data);
      setReceivingCall(true);
      setCaller(data.from);
      setCallerSignal(data.signal);
    });

    socket.on('connect_error', (err) => {
      console.error('Socket connection error:', err);
    });

    socket.on('disconnect', (reason) => {
      console.log('Socket disconnected:', reason);
    });

    return () => {
      socket.off('connect');
      socket.off('callUser');
      socket.off('iceServers');
      socket.off('connect_error');
      socket.off('disconnect');
    };
  }, [socket]);

  const callUser = (id) => {
    console.log("Aranacak ID:", id);
    console.log("ICE Sunucuları:", iceServers);
    console.log('Aranacak kullanıcının IDsi : ', id, "arayan numara : ", myId);
    const peer = new Peer({
      initiator: true,
      trickle: false,
      stream: stream,
      config: { iceServers }
    });

    peer.on('signal', (data) => {
      console.log('Aranacak kullanıcının IDsi : ', id, "arayan numara : ", myId, "signal data : ", data);
      socket.emit('callUser', {
        userToCall: id, // Aranacak kullanıcının ID'si
        signalData: data,
        from: myId, // Arayan kullanıcının ID'si
      });
    });

    peer.on('stream', (stream) => {
      if (userVideo.current) {
        userVideo.current.srcObject = stream;
      }
    });

    socket.on('callAccepted', (signal) => {
      console.log('Çağrı kabul edildi:', signal);
      setCallAccepted(true);
      peer.signal(signal);
    });

    connectionRef.current = peer;
  };

  const answerCall = () => {
    console.log("Çağrı cevaplanıyor, arayan:", caller);
    console.log("ICE Sunucuları:", iceServers); 
    setCallAccepted(true);
    const peer = new Peer({
      initiator: false,
      trickle: false,
      stream: stream,
      config: { iceServers }
    });

    peer.on('signal', (data) => {
      socket.emit('answerCall', { signal: data, to: caller });
    });

    peer.on('stream', (stream) => {
      if (userVideo.current) {
        userVideo.current.srcObject = stream;
      }
    });

    peer.signal(callerSignal);
    connectionRef.current = peer;
  };

  const leaveCall = () => {
    setCallEnded(true);
    if (connectionRef.current) {
      connectionRef.current.destroy();
      connectionRef.current = null;
    }

    setCallAccepted(false);
    setReceivingCall(false);
    setCaller("");
    setCallerSignal(null);
    setOtherUserId("");

    if (stream) {
      stream.getTracks().forEach((track) => track.stop());
      setStream(null);
    }

    if (myVideo.current) {
      myVideo.current.srcObject = null;
    }
    if (userVideo.current) {
      userVideo.current.srcObject = null;
    }

    if (!socket.connected) {
      socket.connect();
    }
  };

  return (
    <div className="video-call-container">
      <h2>Görüntülü Görüşme</h2>

      {/* Video akışları için alanlar */}
      <div className="videos">
        {stream && (
          <video playsInline muted ref={myVideo} autoPlay style={{ width: '300px' }} />
        )}
        {callAccepted && !callEnded && (
          <video playsInline ref={userVideo} autoPlay style={{ width: '300px' }} />
        )}
      </div>

      {/* Kullanıcı ID'leri ve Arama Butonu */}
      <div>
        <h3>Your ID: {myId}</h3>
        <input
          type="text"
          placeholder="Aranacak Kullanıcı ID"
          value={otherUserId} // Zaten tanımladığınız state değişkenini kullanın
          onChange={(e) => setOtherUserId(e.target.value)} // Zaten tanımladığınız state set fonksiyonunu kullanın
        />
        <button onClick={() => callUser(otherUserId)}>Ara</button>
      </div>

      {/* Gelen Arama Bildirimi */}
      <div>
        {receivingCall && !callAccepted && (
          <div>
            <h3>{caller} is calling...</h3>
            <button onClick={answerCall}>Cevapla</button>
          </div>
        )}
        {callAccepted && !callEnded && (
          <button onClick={leaveCall}>Görüşmeyi Sonlandır</button>
        )}
      </div>
    </div>
  );
}

export default VideoCall;