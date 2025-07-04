'use client';

export default function VideoTestPage() {
  return (
    <div className="relative w-full h-screen overflow-hidden text-black">
      {/* Background Video */}
      <video
        className="fixed top-0 left-0 w-full h-full object-cover z-[-1]"
        autoPlay
        muted
        loop
        playsInline
      >
        <source src="/bg.mp4" type="video/mp4" />
      </video>

      {/* Content */}
      <div className="relative z-10 flex items-center justify-center h-full">
        <h1 className="text-5xl font-bold">Hello, Background Video!</h1>
      </div>
    </div>
  );
}
