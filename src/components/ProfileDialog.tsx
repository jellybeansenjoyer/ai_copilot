'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { Camera, Loader2, Upload } from 'lucide-react';
import { getSession } from 'next-auth/react';
import { getApiBaseUrl } from '@/lib/api';
import { useAuth } from '@/context/AuthContext';

export default function ProfileDialog({
  email,
  onClose,
}: {
  email: string;
  onClose: () => void;
}) {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [name, setName] = useState('');
  const router = useRouter();
  const { refreshProfile } = useAuth();

  const [isCapturing, setIsCapturing] = useState(false);
  const [cameraOpening, setCameraOpening] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [mediaStream, setMediaStream] = useState<MediaStream | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const handleUploadClick = () => fileInputRef.current?.click();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0];
    if (selected) {
      setFile(selected);
      setPreview(URL.createObjectURL(selected));
    }
  };

  const handleCameraClick = async () => {
    if (!isCapturing) {
      setCameraOpening(true);
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true });
        setMediaStream(stream);
        setIsCapturing(true);
      } catch {
        alert('Could not access camera');
      } finally {
        setCameraOpening(false);
      }
    } else {
      const video = videoRef.current;
      if (!video) return;

      const canvas = document.createElement('canvas');
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.translate(canvas.width, 0);
        ctx.scale(-1, 1);
        ctx.drawImage(video, 0, 0);
      }

      canvas.toBlob((blob) => {
        if (blob) {
          const newFile = new File([blob], 'captured.jpg', { type: 'image/jpeg' });
          setFile(newFile);
          setPreview(URL.createObjectURL(blob));
        }
        mediaStream?.getTracks().forEach((track) => track.stop());
        setMediaStream(null);
        setIsCapturing(false);
      });
    }
  };

  useEffect(() => {
    if (isCapturing && videoRef.current && mediaStream) {
      videoRef.current.srcObject = mediaStream;
      videoRef.current.play();
    }
  }, [mediaStream, isCapturing]);

  const handleSubmit = async () => {
    if (!file || !name) return alert('Please enter name and select image');

    const cloud = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
    const preset = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET;
    if (!cloud || !preset) {
      alert(
        'Image upload is not configured. Set NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME and NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET.',
      );
      return;
    }

    setIsSaving(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('upload_preset', preset);

      const res = await fetch(`https://api.cloudinary.com/v1_1/${cloud}/upload`, {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();
      const imageUrl = data.secure_url;
      if (!imageUrl) {
        alert('Upload failed');
        return;
      }

      const session = await getSession();
      if (!session?.accessToken) {
        alert('Session expired or unauthorized');
        return;
      }

      const patchRes = await fetch(`${getApiBaseUrl()}/user/profile`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${session.accessToken}`,
        },
        body: JSON.stringify({ name, picture: imageUrl }),
      });

      if (!patchRes.ok) {
        alert('Could not save profile');
        return;
      }

      await refreshProfile();
      onClose();
      router.refresh();
    } catch {
      alert('Something went wrong. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  const busy = isSaving || cameraOpening;
  const captureLabel = cameraOpening
    ? 'Opening camera…'
    : isCapturing
      ? 'Capture'
      : 'Click Picture';

  return (
    <div className="fixed inset-0 flex items-center justify-center backdrop-blur-sm z-50">
      <div className="relative bg-white rounded-2xl shadow-2xl p-6 w-[420px]">
        {isSaving && (
          <div
            className="absolute inset-0 z-10 flex flex-col items-center justify-center gap-2 rounded-2xl bg-white/80"
            aria-busy="true"
            aria-label="Saving profile"
          >
            <Loader2 className="h-8 w-8 animate-spin text-[#8a7cc7]" />
            <p className="text-sm text-gray-600">Uploading and saving…</p>
          </div>
        )}

        <h2 className="text-xl font-bold text-center mb-4">Profile Details</h2>
        <p className="text-xs text-center text-gray-500 mb-2">{email}</p>

        <div className="w-64 h-64 mx-auto mb-4 bg-gray-100 rounded-md overflow-hidden flex items-center justify-center">
          {isCapturing ? (
            <video
              ref={videoRef}
              className="w-full h-full object-cover scale-x-[-1]"
              autoPlay
              muted
              playsInline
            />
          ) : preview ? (
            <Image
              src={preview}
              alt="Preview"
              width={256}
              height={256}
              unoptimized
              className="w-full h-full object-cover"
            />
          ) : (
            <span className="text-gray-400">No Image</span>
          )}
        </div>

        <div className="flex gap-3 justify-center mb-4">
          <button
            type="button"
            onClick={handleCameraClick}
            disabled={busy}
            className="flex items-center gap-2 border px-3 py-2 rounded-md hover:bg-gray-100 disabled:opacity-50"
          >
            {cameraOpening ? (
              <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
            ) : (
              <Camera size={16} />
            )}
            {captureLabel}
          </button>
          <button
            type="button"
            onClick={handleUploadClick}
            disabled={busy}
            className="flex items-center gap-2 border px-3 py-2 rounded-md hover:bg-gray-100 disabled:opacity-50"
          >
            <Upload size={16} /> Upload Media
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            className="hidden"
            disabled={busy}
          />
        </div>

        <label className="block text-sm mb-1">Full Name</label>
        <input
          type="text"
          className="w-full border px-3 py-2 rounded-md mb-4 disabled:bg-gray-100"
          value={name}
          onChange={(e) => setName(e.target.value)}
          disabled={busy}
        />

        <button
          type="button"
          onClick={handleSubmit}
          disabled={busy}
          className="w-full bg-[#8a7cc7] text-white py-2 rounded-md hover:opacity-90 disabled:opacity-50 inline-flex items-center justify-center gap-2"
        >
          {isSaving && <Loader2 className="h-4 w-4 animate-spin" aria-hidden />}
          {isSaving ? 'Saving…' : 'Submit'}
        </button>
      </div>
    </div>
  );
}
