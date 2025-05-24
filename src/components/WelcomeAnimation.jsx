import React, { useEffect, useState } from 'react';

const WelcomeAnimation = ({ onAnimationComplete }) => {
  const [show, setShow] = useState(true);
  const [fadeOut, setFadeOut] = useState(false);
  const [loadingProgress, setLoadingProgress] = useState(0);

  useEffect(() => {
    // Simulate loading progress
    const progressInterval = setInterval(() => {
      setLoadingProgress(prev => {
        if (prev >= 100) {
          clearInterval(progressInterval);
          return 100;
        }
        return prev + 2;
      });
    }, 50);

    const timer = setTimeout(() => {
      setFadeOut(true);
      setTimeout(() => {
        setShow(false);
        onAnimationComplete();
      }, 500); // Fade out duration
    }, 3000); // Show duration

    return () => {
      clearTimeout(timer);
      clearInterval(progressInterval);
    };
  }, [onAnimationComplete]);

  if (!show) return null;

  return (
    <div 
      className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-black transition-opacity duration-500"
      style={{ opacity: fadeOut ? 0 : 1 }}
    >
      <div className="flex flex-col items-center space-y-12">
        {/* Icons */}
        <div className="flex items-center space-x-16">
          <div className="transform hover:scale-105 transition-transform duration-300">
            <img 
              src="/metro.svg" 
              alt="Metro" 
              className="h-24 w-24 object-contain invert"
            />
          </div>
          <div className="transform hover:scale-105 transition-transform duration-300">
            <img 
              src="/railway.svg" 
              alt="Railway" 
              className="h-24 w-24 object-contain invert"
            />
          </div>
        </div>

        {/* Title */}
        <div className="text-center space-y-4">
          <h1 className="text-3xl font-bold text-white animate-fade-in">
            Chennai Transit Map
          </h1>
          <h2 className="text-2xl font-bold text-white/80 animate-fade-in" style={{ animationDelay: '0.1s' }}>
            சென்னை போக்குவரத்து வரைபடம்
          </h2>
        </div>

        {/* Loading Bar */}
        <div className="w-72 space-y-2">
          <div className="h-0.5 bg-white/10 rounded-full overflow-hidden">
            <div 
              className="h-full bg-white rounded-full transition-all duration-300 ease-out"
              style={{ width: `${loadingProgress}%` }}
            />
          </div>
          <p className="text-sm text-white/40 text-center font-mono">
            Loading map data... {loadingProgress}%
          </p>
        </div>
      </div>

      <style jsx="true">{`
        @keyframes fade-in {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .animate-fade-in {
          animation: fade-in 0.8s ease-out forwards;
        }

        /* Add custom fonts */
        @import url('https://fonts.googleapis.com/css2?family=Cabin:wght@400;500;600;700&family=Noto+Sans+Tamil:wght@400;500;600;700&display=swap');

        h1, h2, p {
          font-family: "Cabin", "Noto Sans Tamil", serif;
        }
      `}</style>
    </div>
  );
};

export default WelcomeAnimation; 