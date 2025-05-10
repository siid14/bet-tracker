import React, { useEffect, useState } from "react";
import { safeLoadImage } from "../utils/SafeLoader";

const FALLBACK_IMAGE =
  "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgZmlsbD0iI2YxZjFmMSIvPjx0ZXh0IHg9IjUwJSIgeT0iNTAlIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMTYiIGZpbGw9IiM5OTkiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGRvbWluYW50LWJhc2VsaW5lPSJtaWRkbGUiPkltYWdlIE5vdCBGb3VuZDwvdGV4dD48L3N2Zz4=";

const ImageModal = ({ isOpen, imageUrl, onClose, language, translations }) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [optimizedUrl, setOptimizedUrl] = useState("");

  // Handle keyboard events for the modal
  const handleKeyDown = (e) => {
    if (e.key === "Escape") {
      onClose();
    }
  };

  // Load and optimize the image when the modal opens
  useEffect(() => {
    if (isOpen && imageUrl) {
      setLoading(true);
      setError(false);

      // Generate optimized image URL if needed
      // This assumes you have a backend service or CDN that can serve optimized images
      // For client-side only, we can use the original URL but would track loading state
      const imgUrl = imageUrl.includes("?")
        ? `${imageUrl}&quality=80&width=800`
        : `${imageUrl}?quality=80&width=800`;

      setOptimizedUrl(imgUrl);

      // Use the SafeLoader utility to load the image with proper error handling
      safeLoadImage(
        imgUrl,
        () => {
          setLoading(false);
        },
        (error) => {
          console.error("Error loading image:", error);
          setLoading(false);
          setError(true);
        }
      );
    }

    // Set focus on the modal when it opens and handle keyboard navigation
    if (isOpen) {
      const closeButton = document.querySelector(".image-modal-close");
      if (closeButton) closeButton.focus();

      // Add event listener for key presses
      document.addEventListener("keydown", handleKeyDown);

      // Disable scrolling on the body
      document.body.style.overflow = "hidden";
    }

    return () => {
      // Clean up
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "auto";
    };
  }, [isOpen, imageUrl]);

  // Don't render anything if the modal is not open
  if (!isOpen) return null;

  return (
    <div
      className="image-modal-overlay"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
      data-testid="image-modal"
    >
      <div className="image-modal-content" onClick={(e) => e.stopPropagation()}>
        <button
          className="image-modal-close"
          onClick={onClose}
          aria-label={translations?.closeImage || "Close image"}
          tabIndex={0}
          id="modal-title"
          data-testid="modal-close-button"
        >
          {translations?.closeImage || "Close"} &times;
        </button>

        {loading && (
          <div className="image-loading-spinner" data-testid="image-loading">
            <div className="spinner"></div>
            <p>{translations?.loadingImage || "Loading image..."}</p>
          </div>
        )}

        {error && (
          <div className="image-error" data-testid="image-error">
            <p>{translations?.imageError || "Unable to load image"}</p>
            <button onClick={onClose} className="error-close-button">
              {translations?.closeImage || "Close"}
            </button>
          </div>
        )}

        {!loading && !error && (
          <img
            src={optimizedUrl}
            alt="Bet Proof"
            className="image-modal-img"
            data-testid="modal-image"
            onError={(e) => {
              console.error("Error loading image:", imageUrl);
              setError(true);
              e.target.onerror = null;
              e.target.src = FALLBACK_IMAGE;
            }}
          />
        )}
      </div>
    </div>
  );
};

export default ImageModal;
