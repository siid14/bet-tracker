import React, { useState, useEffect, useRef } from "react";
import { compressImage } from "../utils/ImageCompression";

const LazyImage = ({ src, alt, className = "", onLoad, onError, ...props }) => {
  const [imageState, setImageState] = useState("loading"); // loading, loaded, error
  const [compressedSrc, setCompressedSrc] = useState("");
  const imgRef = useRef(null);
  const observerRef = useRef(null);

  useEffect(() => {
    // Handle case where no src is provided
    if (!src) {
      setImageState("error");
      if (onError) {
        onError(new Error("No image source provided"));
      }
      return;
    }

    // Set up intersection observer
    const observerOptions = {
      root: null,
      rootMargin: "50px",
      threshold: 0.1,
    };

    const handleIntersection = (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          loadImage();
          // Disconnect observer after loading starts
          if (observerRef.current) {
            observerRef.current.disconnect();
          }
        }
      });
    };

    observerRef.current = new IntersectionObserver(
      handleIntersection,
      observerOptions
    );

    if (imgRef.current) {
      observerRef.current.observe(imgRef.current);
    }

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, [src]);

  const loadImage = async () => {
    try {
      setImageState("loading");
      const compressed = await compressImage(src, {
        quality: 0.8,
        maxWidth: 800,
        maxHeight: 600,
      });
      setCompressedSrc(compressed);
      setImageState("loaded");
      if (onLoad) {
        onLoad();
      }
    } catch (error) {
      console.error("Error loading/compressing image:", error);
      setImageState("error");
      if (onError) {
        onError(error);
      }
    }
  };

  const getImageClasses = () => {
    let classes = `lazy-image ${className}`;

    switch (imageState) {
      case "loading":
        classes += " loading";
        break;
      case "loaded":
        classes += " loaded";
        break;
      case "error":
        classes += " error";
        break;
      default:
        break;
    }

    return classes.trim();
  };

  return (
    <img
      ref={imgRef}
      src={imageState === "loaded" ? compressedSrc : ""}
      alt={alt}
      className={getImageClasses()}
      data-testid="lazy-image"
      style={{
        backgroundColor: imageState === "loading" ? "#f3f4f6" : "transparent",
        minHeight: imageState === "loading" ? "100px" : "auto",
        display: imageState === "error" ? "none" : "block",
      }}
      {...props}
    />
  );
};

export default LazyImage;
