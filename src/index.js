import fs from 'fs';
import 'dotenv/config'; // loads .env variables locally
import { pickTopic } from './topicPicker.js';
import { generateSlides } from './contentGenerator.js';
import { renderSlidesToImages } from './slideRenderer.js';
import { sendCarouselEmail, sendFailureEmail } from './emailSender.js';
import { saveTopicToHistory } from './history.js';

/**
 * Main orchestration function running the CarouselForge pipeline.
 */
async function main() {
  console.log('==================================================');
  console.log(`[ORCHESTRATOR] Starting CarouselForge run: ${new Date().toISOString()}`);
  console.log('==================================================');

  let topicObj = null;
  let imagePaths = [];

  try {
    // 1. Pick a news item or a tech concept
    topicObj = await pickTopic();
    console.log(`[ORCHESTRATOR] Topic Selected: "${topicObj.seed}" (Type: ${topicObj.type})`);

    // 2. Call Groq to generate slide titles & bullet points
    const slideContent = await generateSlides(topicObj);

    // 3. Render slides using Puppeteer to PNG images
    imagePaths = await renderSlidesToImages(slideContent.slides);
    console.log(`[ORCHESTRATOR] Generated ${imagePaths.length} slide images.`);

    // 4. Send email with attached slides via Resend
    await sendCarouselEmail(slideContent.topic, imagePaths, slideContent.instagram_caption);

    // 5. Log topic to history file for de-duplication
    saveTopicToHistory(topicObj);

    // 6. Cleanup output directory files
    await cleanUpFiles(imagePaths);

    console.log('==================================================');
    console.log('[ORCHESTRATOR] Run completed successfully!');
    console.log('==================================================');
  } catch (error) {
    console.error('==================================================');
    console.error('[ORCHESTRATOR] CRITICAL PIPELINE FAILURE:', error);
    console.error('==================================================');

    // Attempt to notify the user via email on failure
    try {
      const errorDetails = error.stack || error.toString();
      await sendFailureEmail(errorDetails);
    } catch (emailErr) {
      console.error('[ORCHESTRATOR] Failed to send failure email:', emailErr);
    }

    // Attempt clean up of any images that were generated before failure
    if (imagePaths && imagePaths.length > 0) {
      await cleanUpFiles(imagePaths);
    }

    // Exit process with non-zero code so GitHub Actions logs the job as failed
    process.exit(1);
  }
}

/**
 * Safely deletes temporary images.
 * @param {Array<string>} paths - Absolute paths to files.
 */
async function cleanUpFiles(paths) {
  console.log(`[CLEANUP] Cleaning up ${paths.length} temporary files...`);
  for (const filePath of paths) {
    try {
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
        console.log(`[CLEANUP] Deleted temporary file: ${filePath}`);
      }
    } catch (err) {
      console.error(`[CLEANUP] Failed to delete ${filePath}:`, err);
    }
  }
}

// Run the main program
main();
