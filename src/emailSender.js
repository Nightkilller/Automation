import fs from 'fs';
import path from 'path';
import { Resend } from 'resend';

/**
 * Sends the generated slides as PNG attachments to the configured email.
 * @param {string} topic - The topic name.
 * @param {Array<string>} imagePaths - Array of absolute paths of images to attach.
 * @returns {Promise<Object>} Resend sending response.
 */
export async function sendCarouselEmail(topic, imagePaths) {
  const apiKey = process.env.RESEND_API_KEY;
  const toEmail = process.env.TO_EMAIL;
  const fromEmail = process.env.FROM_EMAIL || 'onboarding@resend.dev';

  if (!apiKey || !toEmail) {
    throw new Error('Missing environment variables: RESEND_API_KEY and TO_EMAIL are required.');
  }

  const resend = new Resend(apiKey);
  console.log(`[EMAIL] Preparing email delivery to "${toEmail}" with ${imagePaths.length} attachments.`);

  const attachments = imagePaths.map(filePath => {
    const fileContent = fs.readFileSync(filePath);
    return {
      filename: path.basename(filePath),
      content: fileContent // Resend SDK supports Buffer
    };
  });

  const { data, error } = await resend.emails.send({
    from: fromEmail,
    to: toEmail,
    subject: `Today's Tech Carousel: ${topic}`,
    html: `
      <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; border: 1px solid #eee; padding: 20px; border-radius: 8px;">
        <h2 style="color: #1a1a1a; border-bottom: 2px solid #e55a5a; padding-bottom: 10px;">CarouselForge Automation</h2>
        <p>Hi there,</p>
        <p>Today's AI/Tech carousel has been successfully generated for the topic: <strong>${topic}</strong>.</p>
        <p>We've attached <strong>${imagePaths.length} high-DPI slides (1080x1350px)</strong> to this email, ready for you to download and upload directly to Instagram or other social platforms.</p>
        <div style="background-color: #fdfaf0; border-left: 4px solid #e55a5a; padding: 15px; margin: 20px 0; border-radius: 4px;">
          <p style="margin: 0; font-weight: bold;">Topic Details:</p>
          <p style="margin: 5px 0 0 0; color: #555;">${topic}</p>
        </div>
        <p>Best regards,<br/><strong>CarouselForge Bot</strong></p>
        <hr style="border: 0; border-top: 1px solid #eee; margin-top: 30px;" />
        <p style="font-size: 11px; color: #999; text-align: center; margin: 0;">This is an automated daily email. To stop this workflow, disable the GitHub Actions cron scheduler.</p>
      </div>
    `,
    attachments
  });

  if (error) {
    throw new Error(`Resend API Error: ${JSON.stringify(error)}`);
  }

  console.log('[EMAIL] Carousel email sent successfully.', data);
  return data;
}

/**
 * Sends a notification email when the orchestrator fails.
 * @param {string} errorMessage - Error stack or details.
 */
export async function sendFailureEmail(errorMessage) {
  const apiKey = process.env.RESEND_API_KEY;
  const toEmail = process.env.TO_EMAIL;
  const fromEmail = process.env.FROM_EMAIL || 'onboarding@resend.dev';

  if (!apiKey || !toEmail) {
    console.error('[EMAIL] Cannot send failure email: RESEND_API_KEY or TO_EMAIL not defined.');
    return;
  }

  const resend = new Resend(apiKey);
  console.log('[EMAIL] Sending failure alert email...');

  const { data, error } = await resend.emails.send({
    from: fromEmail,
    to: toEmail,
    subject: `⚠️ CarouselForge Automation Failed - ${new Date().toLocaleDateString()}`,
    html: `
      <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; border: 1px solid #f5c6cb; padding: 20px; border-radius: 8px; background-color: #fdf3f3;">
        <h2 style="color: #721c24; border-bottom: 2px solid #f5c6cb; padding-bottom: 10px; margin-top: 0;">⚠️ CarouselForge Run Failure</h2>
        <p>The daily execution failed during runtime. Please inspect the log below to address the issue:</p>
        <pre style="background-color: #ffffff; color: #721c24; padding: 15px; border-radius: 4px; border: 1px solid #ebccd1; overflow-x: auto; font-family: monospace; font-size: 13px;">${errorMessage}</pre>
        <p>You can check your GitHub Repository Actions tab for details.</p>
        <hr style="border: 0; border-top: 1px solid #ebccd1; margin-top: 30px;" />
        <p style="font-size: 11px; color: #999; text-align: center; margin: 0;">Sent automatically by CarouselForge error handler.</p>
      </div>
    `
  });

  if (error) {
    console.error('[EMAIL] Failed sending failure alert email:', error);
  } else {
    console.log('[EMAIL] Failure alert email sent successfully.', data);
  }
}
