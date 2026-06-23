/**
 * Renders the HTML content for a single slide.
 * @param {Object} slide - The slide data.
 * @param {number} slideNumber - 1-based index of the current slide.
 * @param {number} totalSlides - The total number of slides.
 * @returns {string} Fully styled HTML string.
 */
export function renderSlideHTML(slide, slideNumber, totalSlides) {
  const handle = process.env.IG_HANDLE || '@carouselforge';
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
    const bulletsHtml = (slide.bullets || [])
      .map(b => `<li>${escapeHtml(b)}</li>`)
      .join('\n');
    bodyContent = `
      <div class="slide-body-container">
        <h2 class="body-heading">${escapeHtml(slide.heading)}</h2>
        <ul class="body-bullets">
          ${bulletsHtml}
        </ul>
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
      background-color: #f6f5f0;
      overflow: hidden;
    }

    /* Container mimicking a grid-paper page */
    .slide-canvas {
      position: relative;
      width: 1080px;
      height: 1350px;
      padding: 90px 100px 100px 140px; /* offset left to clear notebook red line */
      background-color: #fbfaf7;
      background-image: 
        linear-gradient(rgba(215, 210, 190, 0.45) 1px, transparent 1px),
        linear-gradient(90deg, rgba(215, 210, 190, 0.45) 1px, transparent 1px);
      background-size: 50px 50px;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      border: 1px solid #e3dec9;
    }

    /* Red notebook margin line */
    .slide-canvas::before {
      content: '';
      position: absolute;
      top: 0;
      bottom: 0;
      left: 90px;
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
      background-color: #e5dec9;
      border: 3px solid #1e1e1e;
      display: flex;
      align-items: center;
      justify-content: center;
      font-family: 'Inter', sans-serif;
      font-weight: 700;
      font-size: 18px;
      color: #1e1e1e;
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

    /* Body Slide Layout */
    .slide-body-container {
      text-align: left;
    }

    .body-heading {
      font-family: 'Lora', 'Georgia', serif;
      font-size: 52px;
      font-weight: 700;
      line-height: 1.25;
      color: #1a1a1a;
      margin-bottom: 45px;
      position: relative;
    }

    .body-bullets {
      list-style: none;
    }

    .body-bullets li {
      font-family: 'Inter', -apple-system, sans-serif;
      font-size: 28px;
      font-weight: 400;
      line-height: 1.6;
      color: #2b2b2b;
      margin-bottom: 30px;
      position: relative;
      padding-left: 45px;
    }

    .body-bullets li::before {
      content: '⚡';
      position: absolute;
      left: 0;
      top: 2px;
      font-size: 24px;
      color: #e55a5a;
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
