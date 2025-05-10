/**
 * Utility functions for image compression and optimization
 */

/**
 * Compress an image using a canvas element
 * @param {string|File} source - The image source URL or File object
 * @param {Object} options - Compression options
 * @param {number} options.maxWidth - Maximum width of the compressed image
 * @param {number} options.maxHeight - Maximum height of the compressed image
 * @param {number} options.quality - JPEG quality (0 to 1)
 * @param {string} options.format - Output format ('image/jpeg', 'image/webp', 'image/png')
 * @returns {Promise} A promise that resolves with the compressed image data URL
 */
export const compressImage = (source, options = {}) => {
  const {
    maxWidth = 800,
    maxHeight = 800,
    quality = 0.8,
    format = "image/jpeg",
  } = options;

  return new Promise((resolve, reject) => {
    // Handle different source types
    const loadImage = (src) => {
      return new Promise((resolveImg, rejectImg) => {
        const img = new Image();
        img.onload = () => resolveImg(img);
        img.onerror = (e) =>
          rejectImg(new Error("Failed to load image for compression"));

        if (typeof src === "string") {
          img.src = src;
        } else if (src instanceof File) {
          const reader = new FileReader();
          reader.onload = (e) => {
            img.src = e.target.result;
          };
          reader.onerror = () =>
            rejectImg(new Error("Failed to read image file"));
          reader.readAsDataURL(src);
        } else {
          rejectImg(new Error("Invalid image source"));
        }
      });
    };

    // Process the loaded image
    loadImage(source)
      .then((img) => {
        // Calculate new dimensions
        let width = img.width;
        let height = img.height;

        // Maintain aspect ratio while resizing
        if (width > maxWidth) {
          height = Math.round(height * (maxWidth / width));
          width = maxWidth;
        }

        if (height > maxHeight) {
          width = Math.round(width * (maxHeight / height));
          height = maxHeight;
        }

        // Create canvas for resizing
        const canvas = document.createElement("canvas");
        canvas.width = width;
        canvas.height = height;

        // Draw and compress the image
        const ctx = canvas.getContext("2d");
        ctx.drawImage(img, 0, 0, width, height);

        // Convert to desired format with quality setting
        const dataUrl = canvas.toDataURL(format, quality);
        resolve(dataUrl);
      })
      .catch((error) => {
        console.error("Image compression failed:", error);
        reject(error);
      });
  });
};

/**
 * Lazily load and compress an image when it's in the viewport
 * @param {string} src - The image source URL
 * @param {function} onLoad - Callback when image is loaded and compressed
 * @param {Object} options - Compression options (see compressImage)
 * @returns {function} Cleanup function to disconnect the observer
 */
export const lazyLoadAndCompressImage = (src, onLoad, options = {}) => {
  if (!src) return () => {};

  // Create an invisible img element to detect when the image is in view
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          // Start loading and compressing the image
          compressImage(src, options)
            .then((compressedImageUrl) => {
              if (onLoad) onLoad(compressedImageUrl);
              observer.disconnect();
            })
            .catch((error) => {
              console.error("Lazy loading and compression failed:", error);
              if (onLoad) onLoad(src); // Fallback to original source
              observer.disconnect();
            });
        }
      });
    },
    { threshold: 0.1 }
  );

  // Observe a placeholder element
  const placeholder = document.createElement("div");
  placeholder.style.height = "1px";
  placeholder.style.width = "1px";
  placeholder.style.position = "absolute";
  placeholder.style.opacity = "0";
  document.body.appendChild(placeholder);
  observer.observe(placeholder);

  // Return cleanup function
  return () => {
    observer.disconnect();
    if (document.body.contains(placeholder)) {
      document.body.removeChild(placeholder);
    }
  };
};

/**
 * Preload critical images
 * @param {Array} imageSources - Array of image URLs to preload
 * @param {boolean} compress - Whether to compress the images while preloading
 * @param {Object} options - Compression options
 * @returns {Promise} A promise that resolves when all images are preloaded
 */
export const preloadImages = (imageSources, compress = false, options = {}) => {
  if (!Array.isArray(imageSources) || imageSources.length === 0) {
    return Promise.resolve([]);
  }

  const preloadPromises = imageSources.map((src) => {
    if (compress) {
      return compressImage(src, options);
    } else {
      return new Promise((resolve, reject) => {
        const img = new Image();
        img.onload = () => resolve(src);
        img.onerror = () =>
          reject(new Error(`Failed to preload image: ${src}`));
        img.src = src;
      });
    }
  });

  return Promise.all(preloadPromises);
};
