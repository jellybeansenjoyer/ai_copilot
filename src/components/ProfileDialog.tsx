'use client';

import { useRef, useState } from 'react';
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
    const stream = await navigator.mediaDevices.getUserMedia({ video: true });
    const video = document.createElement('video');
    video.srcObject = stream;
    video.play();

    const canvas = document.createElement('canvas');
    document.body.appendChild(video);

    setTimeout(() => {
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      canvas.getContext('2d')?.drawImage(video, 0, 0);
      canvas.toBlob((blob) => {
        if (blob) {
          const newFile = new File([blob], 'captured.jpg', { type: 'image/jpeg' });
          setFile(newFile);
          setPreview(URL.createObjectURL(blob));
        }
        stream.getTracks().forEach((t) => t.stop());
        video.remove();
      });
    }, 2000); // Wait 2s before taking snapshot
  };

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
    if (!session?.user || !session?.accessToken) {
        alert('Session expired or unauthorized');
        return;
      }
    console.log('Image uploaded:', imageUrl);
    console.log('Name:', session.accessToken);
    // TODO: Replace with your actual profile update API call
    await fetch('http://localhost:2999/user/profile', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json',
        Authorization: `Bearer ${session.accessToken}`,
       },
      body: JSON.stringify({ "name":name, "picture":imageUrl }),
    });
    onClose();
    router.push('/dashboard');
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center backdrop-blur-sm z-50">
      <div className="bg-white rounded-2xl shadow-2xl p-6 w-[400px]">
        <h2 className="text-xl font-bold text-center mb-4">Profile Details</h2>

        <div className="w-32 h-32 mx-auto mb-4 bg-gray-100 rounded-md overflow-hidden flex items-center justify-center">
          {preview ? <img src={preview} alt="preview" className="w-full h-full object-cover" /> : <span className="text-gray-400">No Image</span>}
        </div>

        <div className="flex gap-3 justify-center mb-4">
          <button
            onClick={handleCameraClick}
            className="flex items-center gap-2 border px-3 py-2 rounded-md hover:bg-gray-100"
          >
            <Camera size={16} /> Click Picture
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
