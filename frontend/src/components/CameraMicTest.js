import React, { useState, useEffect, useRef } from 'react';


function CameraMicTest() {
  const [stream, setStream] = useState(null);
  const [error, setError] = useState('');
  const [audioLevel, setAudioLevel] = useState(0);
  const videoRef = useRef(null);
  const audioContext = useRef(null);
  const analyser = useRef(null);

  useEffect(() => {
    async function getMedia() {
      try {
        const mediaStream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
        setStream(mediaStream);
        if (videoRef.current) {
          videoRef.current.srcObject = mediaStream;
        }

        // Ses seviyesini ölçmek için AudioContext ve Analyser oluştur
        audioContext.current = new (window.AudioContext || window.webkitAudioContext)();
        analyser.current = audioContext.current.createAnalyser();
        const source = audioContext.current.createMediaStreamSource(mediaStream);
        source.connect(analyser.current);
        analyser.current.fftSize = 256;
        const bufferLength = analyser.current.frequencyBinCount;
        const dataArray = new Uint8Array(bufferLength);

        // Periyodik olarak ses seviyesini kontrol et
        const checkAudioLevel = () => {
          analyser.current.getByteFrequencyData(dataArray);
          let sum = dataArray.reduce((a, b) => a + b, 0);
          let avg = sum / dataArray.length;
          setAudioLevel(avg);
          requestAnimationFrame(checkAudioLevel);
        };

        checkAudioLevel();

      } catch (err) {
        setError('Kamera veya mikrofon erişiminde hata: ' + err.message);
        console.error('Kamera veya mikrofon erişim hatası:', err);
      }
    }

    getMedia();

    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
      if (audioContext.current) {
        audioContext.current.close();
      }
    };
  }, []);

  return (
    <div>
      <h2>Kamera ve Mikrofon Testi</h2>
      {error && <p className="error">{error}</p>}
      <video ref={videoRef} autoPlay playsInline muted style={{ width: '300px' }} />

      <div>
        <h3>Mikrofon Seviyesi:</h3>
        <div className="audio-meter">
          <div className="audio-level" style={{ width: `${audioLevel}%` }}></div>
        </div>
      </div>
    </div>
  );
}

export default CameraMicTest;