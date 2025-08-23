import { useState, useEffect } from "react";

/**
 * Custom hook to detect mobile devices and screen sizes
 * Provides responsive breakpoints and mobile-specific features
 */
const useMobileDetection = () => {
  const [screenSize, setScreenSize] = useState({
    width: typeof window !== "undefined" ? window.innerWidth : 0,
    height: typeof window !== "undefined" ? window.innerHeight : 0,
  });

  const [isMobile, setIsMobile] = useState(false);
  const [isTablet, setIsTablet] = useState(false);
  const [isTouch, setIsTouch] = useState(false);

  useEffect(() => {
    const checkDeviceType = () => {
      const width = window.innerWidth;
      const height = window.innerHeight;

      setScreenSize({ width, height });

      // Mobile detection (phones)
      setIsMobile(width <= 768);

      // Tablet detection
      setIsTablet(width > 768 && width <= 1024);

      // Touch device detection
      setIsTouch("ontouchstart" in window || navigator.maxTouchPoints > 0);
    };

    // Initial check
    checkDeviceType();

    // Add event listener for window resize
    const handleResize = () => {
      checkDeviceType();
    };

    window.addEventListener("resize", handleResize);

    // Cleanup
    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  // Utility functions
  const isSmallMobile = screenSize.width <= 480;
  const isLargeMobile = screenSize.width > 480 && screenSize.width <= 768;
  const isDesktop = screenSize.width > 1024;

  return {
    screenSize,
    isMobile,
    isTablet,
    isTouch,
    isSmallMobile,
    isLargeMobile,
    isDesktop,
  };
};

export default useMobileDetection;
