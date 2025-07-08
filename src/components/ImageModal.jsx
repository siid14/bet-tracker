import React, { useState, useEffect } from "react";
import { compressImage } from "../utils/ImageCompression";

const ImageModal = ({ isOpen, imageUrl, onClose, language, translations }) => {
  const [imageState, setImageState] = useState("loading"); // loading, loaded, error
  const [compressedSrc, setCompressedSrc] = useState("");

  useEffect(() => {
    if (!isOpen || !imageUrl) {
      setImageState("loading");
      setCompressedSrc("");
      return;
    }

    const loadImage = async () => {
      try {
        setImageState("loading");
        const compressed = await compressImage(imageUrl, {
          quality: 0.8,
          maxWidth: 1200,
          maxHeight: 800,
        });
        setCompressedSrc(compressed);
        setImageState("loaded");
      } catch (error) {
        console.error("Error loading/compressing image:", error);
        setImageState("error");
      }
    };

    loadImage();
  }, [isOpen, imageUrl]);

  useEffect(() => {
    const handleEscape = (event) => {
      if (event.key === "Escape") {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener("keydown", handleEscape);
      document.body.style.overflow = "hidden";
    }

    return () => {
      document.removeEventListener("keydown", handleEscape);
      document.body.style.overflow = "unset";
    };
  }, [isOpen, onClose]);

  if (!isOpen) {
    return null;
  }

  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div
      className="image-modal-overlay"
      onClick={handleOverlayClick}
      data-testid="image-modal"
    >
      <div className="image-modal-content">
        <button
          onClick={onClose}
          className="image-modal-close"
          aria-label={translations.closeImage}
          data-testid="modal-close-button"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-6 w-6"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>

        {imageState === "loading" && (
          <div
            className="flex items-center justify-center p-8 min-h-64"
            data-testid="image-loading"
          >
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-gray-600">
                {translations.loadingImage || "Loading image..."}
              </p>
            </div>
          </div>
        )}

        {imageState === "error" && (
          <div
            className="flex items-center justify-center p-8 min-h-64"
            data-testid="image-error"
          >
            <div className="text-center">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-16 w-16 text-red-500 mx-auto mb-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"
                />
              </svg>
              <p className="text-red-600">
                {translations.imageError || "Unable to load image"}
              </p>
            </div>
          </div>
        )}

        {imageState === "loaded" && compressedSrc && (
          <img
            src={compressedSrc}
            alt="Bet proof"
            className="image-modal-img"
            data-testid="modal-image"
          />
        )}
      </div>
    </div>
  );
};

export default ImageModal;
