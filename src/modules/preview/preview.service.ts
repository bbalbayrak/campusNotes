import { Injectable } from '@nestjs/common';
import * as fs from 'fs';
import * as path from 'path';
import { fromBuffer } from 'pdf2pic';
import * as sharp from 'sharp';

@Injectable()
export class PreviewService {
  async generatePreview(pdfBuffer: Buffer, fileId: string) {
    const tempDir = path.join(process.cwd(), 'tmp', fileId);
    fs.mkdirSync(tempDir, { recursive: true });

    const pdfPath = path.join(tempDir, 'source.pdf');
    fs.writeFileSync(pdfPath, pdfBuffer);

    const options = {
      density: 100,
      saveFilename: 'page',
      savePath: tempDir,
      format: 'png' as const,
      width: 2000,
      height: 2000,
    };

    const convert = fromBuffer(pdfBuffer, options);
    const result = await convert(1, { responseType: 'image' });

    const imagePath = result.path;

    const optimized = await sharp(imagePath)
      .resize(800)
      .png({ quality: 80 })
      .toBuffer();

    return optimized;
  }
}
