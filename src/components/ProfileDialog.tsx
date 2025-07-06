'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Camera, Upload } from 'lucide-react';
import { getSession } from 'next-auth/react';

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

  const [isCapturing, setIsCapturing] = useState(false);
  const [mediaStream, setMediaStream] = useState<MediaStream | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Handle upload click
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
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true });
        setMediaStream(stream);
        setIsCapturing(true);
      } catch (err) {
        alert('Could not access camera');
      }
    } else {
      const video = videoRef.current;
      if (!video) return;

      const canvas = document.createElement('canvas');
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const ctx = canvas.getContext('2d');
        if (ctx) {
        ctx.translate(canvas.width, 0);       // Move to the right edge
        ctx.scale(-1, 1);                     // Flip horizontally
        ctx.drawImage(video, 0, 0);           // Draw mirrored video frame
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

  // Attach stream to video once it's available and videoRef is mounted
  useEffect(() => {
    if (isCapturing && videoRef.current && mediaStream) {
      videoRef.current.srcObject = mediaStream;
      videoRef.current.play();
    }
  }, [mediaStream, isCapturing]);

  const handleSubmit = async () => {
    if (!file || !name) return alert('Please enter name and select image');

    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', 'reimage');

    const res = await fetch('https://api.cloudinary.com/v1_1/dhjoasasx/upload', {
      method: 'POST',
      body: formData,
    });

    const data = await res.json();
    const imageUrl = data.secure_url;

    const session = await getSession();
    if (!session?.accessToken) {
      alert('Session expired or unauthorized');
      return;
    }

    await fetch('https://ai-copilot-backend.onrender.com/sessions/user/profile', {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${session.accessToken}`,
      },
      body: JSON.stringify({ name, picture: imageUrl }),
    });

    onClose();
    router.push('/dashboard');
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center backdrop-blur-sm z-50">
      <div className="bg-white rounded-2xl shadow-2xl p-6 w-[420px]">
        <h2 className="text-xl font-bold text-center mb-4">Profile Details</h2>

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
            <img src={preview} alt="preview" className="w-full h-full object-cover" />
          ) : (
            <span className="text-gray-400">No Image</span>
          )}
        </div>

        <div className="flex gap-3 justify-center mb-4">
          <button
            onClick={handleCameraClick}
            className="flex items-center gap-2 border px-3 py-2 rounded-md hover:bg-gray-100"
          >
            <Camera size={16} /> {isCapturing ? 'Capture' : 'Click Picture'}
          </button>
          <button
            onClick={handleUploadClick}
            className="flex items-center gap-2 border px-3 py-2 rounded-md hover:bg-gray-100"
          >
            <Upload size={16} /> Upload Media
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            className="hidden"
          />
        </div>

        <label className="block text-sm mb-1">Full Name</label>
        <input
          type="text"
          className="w-full border px-3 py-2 rounded-md mb-4"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />

        <button
          onClick={handleSubmit}
          className="w-full bg-[#8a7cc7] text-white py-2 rounded-md hover:opacity-90"
        >
          Submit
        </button>
      </div>
    </div>
  );
}
