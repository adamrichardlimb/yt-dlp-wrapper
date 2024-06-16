import { json, error, type RequestHandler } from '@sveltejs/kit';
import { exec } from 'child_process';
import path from 'path';
import fs from 'fs';
import { Readable } from 'stream';

// Ensure the downloads directory exists
const outputDir = 'static/downloads';
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

function execCommand(command: string): Promise<string> {
  return new Promise((resolve, reject) => {
    exec(command, (err, stdout, stderr) => {
      if (err) {
        console.error(`Error: ${err.message}`);
        reject(new Error('Failed to download video'));
        return;
      }
      if (stderr) {
        console.error(`stderr: ${stderr}`);
      }
      resolve(stdout);
    });
  });
}

export const POST: RequestHandler = async ({ request }) => {
  const { url } = await request.json() as { url: string };
  const outputPath = path.join(outputDir, '%(title)s.%(ext)s');
  const command = `yt-dlp -f 18 -o "${outputPath}" "${url}"`;

  try {
    const stdout = await execCommand(command);
    const match = stdout.match(/Destination: (.+)/);

    if (match) {
      const filePath = match[1];
      const relativePath = filePath.replace('static/', '/');

      // Read the file and send it back as a response
      const fileStream = fs.createReadStream(filePath);
      const headers = {
        'Content-Type': 'video/mp4',
        'Content-Disposition': `attachment; filename="${path.basename(filePath)}"`
      };
      return new Response(Readable.toWeb(fileStream) as ReadableStream, { headers });
    } else {
      throw error(500, 'Failed to process video download');
    }
  } catch (err: any) {
    console.error(`Error: ${err.message}`);
    throw error(500, err.message);
  }
};
