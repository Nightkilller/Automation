import fs from 'fs';
import path from 'path';
import puppeteer from 'puppeteer';
import { renderSlideHTML } from './template.js';

/**
 * Renders an array of slide objects into PNG images using Puppeteer.
 * @param {Array} slidesArray - Array of slide content JSON objects.
 * @returns {Promise<Array<string>>} Array of absolute paths of the generated images.
 */
export async function renderSlidesToImages(slidesArray) {
  const outputDir = path.resolve('output');
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  console.log(`Launching Puppeteer to render ${slidesArray.length} slides...`);

  // Launch browser with configurations optimized for headless CI environments
  const browser = await puppeteer.launch({
    headless: true,
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-dev-shm-usage', // prevents resources issues in low-memory environments
      '--font-render-hinting=none' // keeps font weights rendering consistently
    ]
  });

  const imagePaths = [];

  try {
    const page = await browser.newPage();
    // 1080x1350 is standard Instagram Portrait ratio.
    // deviceScaleFactor: 2 outputs high-DPI (retina) images for crisp text.
    await page.setViewport({
      width: 1080,
      height: 1350,
      deviceScaleFactor: 2
    });

    for (let i = 0; i < slidesArray.length; i++) {
      const slide = slidesArray[i];
      const slideNumber = i + 1;
      const htmlContent = renderSlideHTML(slide, slideNumber, slidesArray.length);

      // Load HTML content and wait for network/external resources (fonts) to load
      await page.setContent(htmlContent, { waitUntil: 'networkidle0' });

      // Explicitly wait for the Google Fonts API fonts to finish loading
      await page.evaluate(async () => {
        await document.fonts.ready;
      });

      const outputPath = path.join(outputDir, `slide-${slideNumber}.png`);
      await page.screenshot({
        path: outputPath,
        type: 'png',
        omitBackground: false
      });

      imagePaths.push(outputPath);
      console.log(`[RENDERER] Successfully rendered slide ${slideNumber}/${slidesArray.length} to ${outputPath}`);
    }
  } catch (error) {
    console.error('[RENDERER] Slide rendering failed:', error);
    throw error;
  } finally {
    await browser.close();
    console.log('[RENDERER] Browser closed.');
  }

  return imagePaths;
}
