import { useState, useEffect } from "react";
import { getRotationDegrees, getLastStartDeg } from "../libs/myFunctions";

const TimerIcon = ({ size = 22, /* type = 'smooth', */ className = '', style, seconds = 0 }) => {
  const [currentDegs, setCurrentDegs] = useState(0)
  const [lastStartDeg, setLastStartDeg] = useState(0)
  // const getAnimation = () => {
  //   if (type === 'stopped') return 'none';
    
  //   switch(type) {
  //     case 'smooth':
  //       return 'timer-rotate-smooth 30s linear infinite';
  //     case 'steps':
  //       return 'timer-rotate-steps 30s ease-in-out infinite';
  //     default:
  //       return 'timer-rotate-smooth 30s linear infinite';
  //   }
  // }

  useEffect(() => {
    if(seconds === 0) {
      // Reset: calcular el múltiplo de 360 más cercano
      setCurrentDegs(prev => {
        const newStartDeg = getLastStartDeg(prev)
        setLastStartDeg(newStartDeg)
        return newStartDeg
      })
    } else {
      // Calcular nueva rotación basada en segundos
      setCurrentDegs(() => {
        const step = Math.floor(seconds / 2.5)
        return lastStartDeg + step * 30
      })
    }
  }, [seconds, lastStartDeg])


  return (
    <>
      <svg
        width={size}
        height={size}
        viewBox="0 0 100 120"
        className={className}
        style={{ display: 'block', ...style }}
      >
        <rect
          x="40"
          y="2"
          width="20"
          height="10"
          rx="3"
          fill="currentColor"
        />
        
        <circle
          cx="50"
          cy="65"
          r="42"
          fill="none"
          stroke="currentColor"
          strokeWidth="10"
        />

        <circle cx="50" cy="65" r="5" fill="currentColor" />

        <line
          x1="50"
          y1="65"
          x2="50"
          y2="32"
          stroke="currentColor"
          strokeWidth="6"
          strokeLinecap="round"
          style={{
            transformOrigin: '50px 65px',
            // animation: getAnimation(),
            // transform: type === 'stopped' ? `rotate(${currentDegs}deg)` : undefined,
            // transition: type === 'stopped' ? 'transform 0.8s ease-out' : 'none',
            transform: `rotate(${currentDegs}deg)`,
            transition: 'transform 0.2s ease-in'
          }}
        />
      </svg>

      {/* <style>{`
        @keyframes timer-rotate-smooth {
          from { transform: rotate(${initialDegs}deg); }
          to { transform: rotate(${initialDegs + 360}deg); }
        }

        @keyframes timer-rotate-steps {
          0%, 7%   { transform: rotate(${initialDegs + 0}deg); }
          8.33%, 15.33% { transform: rotate(${initialDegs + 30}deg); }
          16.66%, 23.66% { transform: rotate(${initialDegs + 60}deg); }
          25%, 32% { transform: rotate(${initialDegs + 90}deg); }
          33.33%, 40.33% { transform: rotate(${initialDegs + 120}deg); }
          41.66%, 48.66% { transform: rotate(${initialDegs + 150}deg); }
          50%, 57% { transform: rotate(${initialDegs + 180}deg); }
          58.33%, 65.33% { transform: rotate(${initialDegs + 210}deg); }
          66.66%, 73.66% { transform: rotate(${initialDegs + 240}deg); }
          75%, 82% { transform: rotate(${initialDegs + 270}deg); }
          83.33%, 90.33% { transform: rotate(${initialDegs + 300}deg); }
          91.66%, 98.66% { transform: rotate(${initialDegs + 330}deg); }
          100% { transform: rotate(${initialDegs + 360}deg); }
        }
      `}</style> */}
    </>
  );
};

export default TimerIcon