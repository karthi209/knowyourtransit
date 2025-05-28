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
      className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-gradient-to-b from-gray-950 via-gray-900 to-gray-950 transition-opacity duration-500"
      style={{ opacity: fadeOut ? 0 : 1 }}
    >
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {/* Radial Gradient */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-gray-900/60 via-gray-900/80 to-gray-950" />
        {/* Blurred Gradient 1 (Top Left) */}
        <div className="absolute -top-1/2 -left-1/2 w-full h-full bg-gradient-to-br from-purple-400/10 via-pink-400/10 to-blue-400/10 blur-[100px] rotate-12" />
        {/* Blurred Gradient 2 (Bottom Right) */}
        <div className="absolute -bottom-1/2 -right-1/2 w-full h-full bg-gradient-to-tl from-blue-400/10 via-purple-400/10 to-pink-400/10 blur-[100px] -rotate-12" />
      </div>
      <div className="relative z-10 flex flex-col items-center space-y-8">
        {/* Icons */}
        <div className="flex items-center space-x-16">
          <div className="transform hover:scale-105 transition-transform duration-300">
            <img 
              src="/metro.svg" 
              alt="Metro" 
              className="h-28 w-28 object-contain opacity-80"
            />
          </div>
          <div className="transform hover:scale-105 transition-transform duration-300">
            <img 
              src="/railway.svg" 
              alt="Railway" 
              className="h-28 w-28 object-contain opacity-80"
            />
          </div>
        </div>

        {/* Title */}
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold text-purple-400 tracking-wide animate-fade-in font-geist">
            Chennai Transit Map
          </h1>
          <h2 className="text-xl font-bold text-gray-300 animate-fade-in font-geist" style={{ animationDelay: '0.1s' }}>
            சென்னை போக்குவரத்து வரைபடம்
          </h2>
        </div>

        {/* Loading Bar */}
        <div className="w-60 space-y-1">
          <div className="h-0.5 bg-gray-700/50 rounded-full overflow-hidden">
            <div 
              className="h-full bg-purple-400 rounded-full transition-all duration-300 ease-out"
              style={{ width: `${loadingProgress}%` }}
            />
          </div>
          <p className="text-sm text-gray-400 text-center font-geist">
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

        /* Add Geist font */
        @import url('https://fonts.googleapis.com/css2?family=Geist:wght@100..900&display=swap');

        .font-geist {
          font-family: "Geist", sans-serif;
        }

        /* Ensure other text elements use Geist if not explicitly styled */
        body {
          font-family: "Geist", sans-serif;
        }

        h1, h2, p, span, div {
           font-family: inherit; /* Inherit font from parent, primarily body */
        }

        /* Specific overrides if necessary */
        .station-panel, .line-panel {
            font-family: "Geist", sans-serif; /* Explicitly set for panels if needed */
        }

      `}</style>
    </div>
  );
};

export default WelcomeAnimation; 