const IMAGE_MAP = {
  ai: 'https://images.unsplash.com/photo-1677442136019-21780efad99a?auto=format&fit=crop&w=800&q=80',
  coding: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?auto=format&fit=crop&w=800&q=80',
  security: 'https://images.unsplash.com/photo-1563986768609-322da13575f3?auto=format&fit=crop&w=800&q=80',
  hardware: 'https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?auto=format&fit=crop&w=800&q=80',
  cloud: 'https://images.unsplash.com/photo-1600132806370-bf17e65e942f?auto=format&fit=crop&w=800&q=80',
  mobile: 'https://images.unsplash.com/photo-1510557880182-3d4d3cba35a5?auto=format&fit=crop&w=800&q=80',
  business: 'https://images.unsplash.com/photo-1519389950473-47ba0277781c?auto=format&fit=crop&w=800&q=80',
  general: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=800&q=80'
};

/**
 * Renders the HTML content for a single slide.
 * @param {Object} slide - The slide data.
 * @param {number} slideNumber - 1-based index of the current slide.
 * @param {number} totalSlides - The total number of slides.
 * @returns {string} Fully styled HTML string.
 */
export function renderSlideHTML(slide, slideNumber, totalSlides) {
  const handle = process.env.IG_HANDLE || '@dailytechdropss';
  const isFirst = slideNumber === 1;
  const isLast = slideNumber === totalSlides;

  // Determine slide type structure
  let bodyContent = '';
  if (slide.type === 'title') {
    bodyContent = `
      <div class="slide-title-container">
        <h1 class="title-heading">${escapeHtml(slide.heading)}</h1>
        ${slide.subheading ? `<div class="title-divider"></div><h2 class="title-subheading">${escapeHtml(slide.subheading)}</h2>` : ''}
      </div>
    `;
  } else if (slide.type === 'cta') {
    bodyContent = `
      <div class="slide-cta-container">
        <h1 class="cta-heading">${escapeHtml(slide.heading)}</h1>
        ${slide.subheading ? `<h2 class="cta-subheading">${escapeHtml(slide.subheading)}</h2>` : ''}
        <div class="cta-badge">Save this post</div>
      </div>
    `;
  } else {
    // Default body slide
    const category = (slide.category || 'general').toLowerCase();
    const imageUrl = IMAGE_MAP[category] || IMAGE_MAP.general;
    bodyContent = `
      <div class="slide-body-container">
        <h2 class="body-heading">${escapeHtml(slide.heading)}</h2>
        <div class="slide-image-container">
          <img src="${imageUrl}" class="slide-image" alt="${category}" />
        </div>
        <p class="slide-description">${escapeHtml(slide.description)}</p>
      </div>
    `;
  }

  // Swipe hint logic: on last slide show custom Swipe element, and on first slide standard Swipe
  let footerRightContent = '';
  if (isLast) {
    footerRightContent = `
      <div class="swipe-hint">
        <span>SHARE</span>
        <div class="swipe-arrow"></div>
      </div>
    `;
  } else {
    footerRightContent = `
      <div class="swipe-hint">
        <span>SWIPE</span>
        <div class="swipe-arrow"></div>
      </div>
    `;
  }

  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Slide ${slideNumber}</title>
  <!-- Load fonts via Google Fonts CDN -->
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700;800&family=Lora:ital,wght@0,400..700;1,400..700&display=swap" rel="stylesheet">
  <style>
    * {
      box-sizing: border-box;
      margin: 0;
      padding: 0;
    }

    body {
      width: 1080px;
      height: 1350px;
      display: flex;
      justify-content: center;
      align-items: center;
      background-color: #f0f4f8; /* light blue-gray outer background */
      overflow: hidden;
    }

    /* Container mimicking a grid-paper page */
    .slide-canvas {
      position: relative;
      width: 1080px;
      height: 1350px;
      padding: 90px 100px 100px 140px; /* offset left to clear notebook red line */
      background-color: #ffffff; /* pure white paper background */
      background-image: 
        linear-gradient(rgba(0, 110, 220, 0.12) 1.5px, transparent 1.5px),
        linear-gradient(90deg, rgba(0, 110, 220, 0.12) 1.5px, transparent 1.5px);
      background-size: 50px 50px;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      border: 1px solid #d2e4f5;
    }

    /* Spiral Notebook Binding (3D Rings on the left) */
    .spiral-binding {
      position: absolute;
      left: 72px; /* positioned right over the binder crease */
      top: 60px;
      bottom: 60px;
      width: 36px;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      align-items: center;
      z-index: 100;
    }

    .spiral-ring {
      width: 30px;
      height: 14px;
      background: linear-gradient(180deg, #d0d0d0 0%, #ffffff 30%, #a8a8a8 75%, #707070 100%);
      border: 1.5px solid #4a4a4a;
      border-radius: 7px;
      box-shadow: 1px 2px 3px rgba(0, 0, 0, 0.25);
      position: relative;
    }

    /* Small punched hole in paper behind ring */
    .spiral-ring::before {
      content: '';
      position: absolute;
      left: 10px;
      top: 50%;
      transform: translateY(-50%);
      width: 8px;
      height: 8px;
      background-color: #2b2a26;
      border-radius: 50%;
      z-index: -1;
    }

    /* Red notebook margin line */
    .slide-canvas::before {
      content: '';
      position: absolute;
      top: 0;
      bottom: 0;
      left: 140px; /* shift margin line to accommodate spirals */
      width: 2px;
      background-color: rgba(220, 80, 80, 0.4);
      z-index: 2;
    }

    /* Header styling */
    .header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      z-index: 10;
    }

    .handle-text {
      font-family: 'Inter', -apple-system, sans-serif;
      font-weight: 800;
      font-size: 22px;
      letter-spacing: 0.05em;
      color: #1e1e1e;
      text-transform: uppercase;
    }

    .avatar-circle {
      width: 48px;
      height: 48px;
      border-radius: 50%;
      background: linear-gradient(135deg, #e55a5a 0%, #f39c12 100%);
      border: 2.5px solid #1e1e1e;
      display: flex;
      align-items: center;
      justify-content: center;
      font-family: 'Inter', sans-serif;
      font-weight: 800;
      font-size: 18px;
      color: #ffffff;
      box-shadow: 2px 2px 0px rgba(0, 0, 0, 0.15);
    }

    /* Content Area */
    .content-area {
      flex: 1;
      display: flex;
      flex-direction: column;
      justify-content: center;
      padding-top: 40px;
      padding-bottom: 80px;
      z-index: 5;
    }

    /* Title Slide Layout */
    .slide-title-container {
      text-align: left;
    }

    .title-heading {
      font-family: 'Lora', 'Georgia', serif;
      font-size: 80px;
      font-weight: 700;
      line-height: 1.15;
      color: #1a1a1a;
      margin-bottom: 30px;
    }

    .title-divider {
      width: 120px;
      height: 6px;
      background-color: #e55a5a;
      margin-bottom: 35px;
    }

    .title-subheading {
      font-family: 'Inter', -apple-system, sans-serif;
      font-size: 32px;
      font-weight: 600;
      color: #555555;
      line-height: 1.4;
    }

    /* Body Slide Layout with Images and Paragraphs */
    .slide-body-container {
      text-align: left;
      display: flex;
      flex-direction: column;
      height: 100%;
    }

    .body-heading {
      font-family: 'Lora', 'Georgia', serif;
      font-size: 44px; /* slightly smaller to fit elements nicely */
      font-weight: 700;
      line-height: 1.2;
      color: #1a1a1a;
      margin-bottom: 25px;
    }

    .slide-image-container {
      width: 100%;
      height: 480px; /* generous height for tech image display */
      border: 3px solid #1e1e1e;
      border-radius: 12px;
      overflow: hidden;
      box-shadow: 6px 6px 0px rgba(30, 30, 30, 0.15);
      margin-bottom: 30px;
    }

    .slide-image {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }

    .slide-description {
      font-family: 'Lora', 'Georgia', serif; /* serif font matching the screenshot */
      font-size: 28px;
      font-weight: 400;
      line-height: 1.65;
      color: #2b2b2b;
      text-align: justify;
    }

    /* CTA Slide Layout */
    .slide-cta-container {
      text-align: center;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
    }

    .cta-heading {
      font-family: 'Lora', 'Georgia', serif;
      font-size: 64px;
      font-weight: 700;
      line-height: 1.2;
      color: #1a1a1a;
      margin-bottom: 25px;
    }

    .cta-subheading {
      font-family: 'Inter', sans-serif;
      font-size: 30px;
      font-weight: 600;
      color: #555555;
      margin-bottom: 45px;
    }

    .cta-badge {
      font-family: 'Inter', sans-serif;
      font-size: 22px;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.1em;
      background-color: #1a1a1a;
      color: #fbfaf7;
      padding: 18px 45px;
      border-radius: 4px;
      box-shadow: 4px 4px 0px rgba(0, 0, 0, 0.15);
    }

    /* Footer styling */
    .footer {
      display: flex;
      justify-content: space-between;
      align-items: center;
      z-index: 10;
    }

    .page-number {
      font-family: 'Inter', -apple-system, sans-serif;
      font-size: 20px;
      font-weight: 600;
      color: #777777;
    }

    .swipe-hint {
      display: flex;
      align-items: center;
      gap: 12px;
      font-family: 'Inter', -apple-system, sans-serif;
      font-weight: 800;
      font-size: 20px;
      letter-spacing: 0.05em;
      color: #1e1e1e;
    }

    .swipe-arrow {
      position: relative;
      width: 45px;
      height: 2px;
      background-color: #1e1e1e;
    }

    .swipe-arrow::after {
      content: '';
      position: absolute;
      right: 0;
      top: -5px;
      width: 10px;
      height: 10px;
      border-top: 2px solid #1e1e1e;
      border-right: 2px solid #1e1e1e;
      transform: rotate(45deg);
    }
  </style>
</head>
<body>
  <div class="slide-canvas">
    <!-- Spiral binder rings on the left side of the notebook -->
    <div class="spiral-binding">
      <div class="spiral-ring"></div>
      <div class="spiral-ring"></div>
      <div class="spiral-ring"></div>
      <div class="spiral-ring"></div>
      <div class="spiral-ring"></div>
      <div class="spiral-ring"></div>
      <div class="spiral-ring"></div>
      <div class="spiral-ring"></div>
      <div class="spiral-ring"></div>
      <div class="spiral-ring"></div>
      <div class="spiral-ring"></div>
      <div class="spiral-ring"></div>
      <div class="spiral-ring"></div>
      <div class="spiral-ring"></div>
      <div class="spiral-ring"></div>
      <div class="spiral-ring"></div>
      <div class="spiral-ring"></div>
      <div class="spiral-ring"></div>
      <div class="spiral-ring"></div>
      <div class="spiral-ring"></div>
    </div>
    <div class="header">
      <div class="handle-text">${escapeHtml(handle)}</div>
      <div class="avatar-circle">${escapeHtml(handle.charAt(1).toUpperCase() || 'C')}</div>
    </div>
    <div class="content-area">
      ${bodyContent}
    </div>
    <div class="footer">
      <div class="page-number">${slideNumber}/${totalSlides}</div>
      ${footerRightContent}
    </div>
  </div>
</body>
</html>
  `;
}

/**
 * Escapes special HTML characters to prevent rendering bugs.
 * @param {string} unsafe - Raw string.
 * @returns {string} Escaped HTML string.
 */
function escapeHtml(unsafe) {
  if (typeof unsafe !== 'string') return '';
  return unsafe
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}
