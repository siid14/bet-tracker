import React, { useState, useEffect, useRef } from "react";
import { compressImage } from "../utils/ImageCompression";

const LOADING_PLACEHOLDER =
  "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgZmlsbD0iI2Y1ZjVmNSIvPjxyZWN0IHg9IjcwIiB5PSI4MCIgd2lkdGg9IjYwIiBoZWlnaHQ9IjQwIiBmaWxsPSIjZTBlMGUwIj48YW5pbWF0ZSBhdHRyaWJ1dGVOYW1lPSJvcGFjaXR5IiB2YWx1ZXM9IjAuMzsxOzAuMyIgZHVyPSIycyIgcmVwZWF0Q291bnQ9ImluZGVmaW5pdGUiIC8+PC9yZWN0Pjwvc3ZnPg==";
const ERROR_PLACEHOLDER =
  "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgZmlsbD0iI2YxZjFmMSIvPjx0ZXh0IHg9IjUwJSIgeT0iNTAlIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMTYiIGZpbGw9IiM5OTkiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGRvbWluYW50LWJhc2VsaW5lPSJtaWRkbGUiPkltYWdlIE5vdCBGb3VuZDwvdGV4dD48L3N2Zz4=";

/**
 * A component for lazy loading and displaying images with compression
 *
 * @param {Object} props - Component props
 * @param {string} props.src - The image source URL
 * @param {string} props.alt - Alt text for the image
 * @param {number} props.quality - JPEG quality (0 to 1)
 * @param {number} props.maxWidth - Maximum width for compression
 * @param {string} props.className - CSS class for the image
 * @param {string} props.loadingPlaceholder - Custom loading placeholder
 * @param {string} props.errorPlaceholder - Custom error placeholder
 * @param {function} props.onLoad - Callback when image is loaded
 * @param {function} props.onError - Callback when image fails to load
 */
const LazyImage = ({
  src,
  alt = "",
  quality = 0.8,
  maxWidth = 800,
  className = "",
  loadingPlaceholder = LOADING_PLACEHOLDER,
  errorPlaceholder = ERROR_PLACEHOLDER,
  onLoad,
  onError,
  ...props
}) => {
  const [currentSrc, setCurrentSrc] = useState(loadingPlaceholder);
  const [status, setStatus] = useState("loading");
  const [isInView, setIsInView] = useState(false);
  const imgRef = useRef(null);

  useEffect(() => {
    if (!src) {
      setStatus("error");
      setCurrentSrc(errorPlaceholder);
      if (onError) onError(new Error("No image source provided"));
      return;
    }

    // Set up intersection observer for lazy loading
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsInView(true);
          observer.disconnect();
        }
      },
      { threshold: 0.1, rootMargin: "200px" } // Start loading when within 200px of viewport
    );

    if (imgRef.current) {
      observer.observe(imgRef.current);
    }

    return () => {
      observer.disconnect();
    };
  }, [src]);

  // Load and compress the image when it comes into view
  useEffect(() => {
    if (!isInView || !src) return;

    setStatus("loading");

    // Use compression utility
    compressImage(src, {
      maxWidth,
      quality,
      format: src.toLowerCase().endsWith(".png") ? "image/png" : "image/jpeg",
    })
      .then((compressedSrc) => {
        setCurrentSrc(compressedSrc);
        setStatus("loaded");
        if (onLoad) onLoad();
      })
      .catch((error) => {
        console.error("Failed to load image:", error);
        setCurrentSrc(errorPlaceholder);
        setStatus("error");
        if (onError) onError(error);
      });
  }, [isInView, src, maxWidth, quality, onLoad, onError]);

  return (
    <img
      ref={imgRef}
      src={currentSrc}
      alt={alt}
      className={`lazy-image ${className} ${status}`}
      data-testid="lazy-image"
      {...props}
    />
  );
};

export default LazyImage;
