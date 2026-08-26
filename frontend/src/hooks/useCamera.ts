import { useState, useEffect, useRef, useCallback } from 'react';

export type FacingMode = 'user' | 'environment';

export function useCamera() {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const isRequesting = useRef(false);
  const [error, setError] = useState<string | null>(null);
  const [facingMode, setFacingMode] = useState<FacingMode>('user');
  const [hasMultipleCameras, setHasMultipleCameras] = useState<boolean>(false);

  // Check for multiple video inputs
  const checkDevices = useCallback(async () => {
    try {
      const devices = await navigator.mediaDevices.enumerateDevices();
      const videoInputs = devices.filter(device => device.kind === 'videoinput');
      setHasMultipleCameras(videoInputs.length > 1);
    } catch (err) {
      console.error('Error enumerating devices', err);
    }
  }, []);

  const parseError = (err: unknown): string => {
    if (typeof err === 'object' && err !== null && 'name' in err) {
      const e = err as Error;
      if (e.name === 'NotAllowedError' || e.name === 'PermissionDeniedError') {
        return 'Izin kamera ditolak oleh pengguna atau sistem.';
      }
      if (e.name === 'NotFoundError' || e.name === 'DevicesNotFoundError') {
        return 'Kamera tidak ditemukan pada perangkat ini.';
      }
      if (e.name === 'NotReadableError' || e.name === 'TrackStartError') {
        return 'Kamera sedang digunakan oleh aplikasi lain atau terjadi kesalahan hardware.';
      }
      if (e.name === 'OverconstrainedError') {
        return 'Resolusi kamera yang diminta tidak didukung.';
      }
      return e.message || 'Gagal mengakses kamera.';
    }
    return 'Gagal mengakses kamera.';
  };

  const requestPermission = useCallback(async (mode: FacingMode = facingMode) => {
    if (isRequesting.current) return;
    isRequesting.current = true;
    try {
      // Clean up previous stream before requesting a new one
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
        streamRef.current = null;
      }

      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: { ideal: 1920 },
          height: { ideal: 1080 },
          facingMode: mode
        },
        audio: false
      });
      
      setStream(mediaStream);
      streamRef.current = mediaStream;
      setHasPermission(true);
      setError(null);
      setFacingMode(mode);
      
      checkDevices();
    } catch (err: unknown) {
      setHasPermission(false);
      setError(parseError(err));
    } finally {
      isRequesting.current = false;
    }
  }, [facingMode, checkDevices]);

  const switchCamera = useCallback(() => {
    if (!hasMultipleCameras) return;
    const newMode = facingMode === 'user' ? 'environment' : 'user';
    requestPermission(newMode);
  }, [facingMode, hasMultipleCameras, requestPermission]);

  const stopCamera = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
      setStream(null);
      if (videoRef.current) {
        videoRef.current.srcObject = null;
      }
    }
  }, []);

  const capturePhoto = useCallback((): string | null => {
    if (!videoRef.current || videoRef.current.readyState !== videoRef.current.HAVE_ENOUGH_DATA) {
      return null;
    }
    
    const canvas = document.createElement('canvas');
    canvas.width = videoRef.current.videoWidth;
    canvas.height = videoRef.current.videoHeight;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return null;
    
    // Mirror the canvas if facingMode is 'user' so that the final captured image
    // exactly matches the mirrored preview the user sees on screen.
    if (facingMode === 'user') {
      ctx.translate(canvas.width, 0);
      ctx.scale(-1, 1);
    }
    ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
    
    // JPEG keeps the iPad memory footprint manageable during multi-shot sessions.
    return canvas.toDataURL('image/jpeg', 0.92);
  }, [facingMode]);

  // Sync stream to video element
  useEffect(() => {
    if (videoRef.current && stream) {
      videoRef.current.srcObject = stream;
      videoRef.current.play().catch(err => {
        if (err.name !== 'AbortError') {
          console.error('Video play error:', err);
        }
      });
    }
  }, [stream]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, [stopCamera]);

  return {
    videoRef,
    hasPermission,
    requestPermission,
    stopCamera,
    capturePhoto,
    switchCamera,
    facingMode,
    hasMultipleCameras,
    error
  };
}
