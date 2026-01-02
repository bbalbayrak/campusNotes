import { Injectable } from '@nestjs/common';
import * as fs from 'fs';
import * as path from 'path';
import * as pdfPoppler from 'pdf-poppler';
import * as sharp from 'sharp';

@Injectable()
export class PreviewService {
  async generatePreview(pdfBuffer: Buffer, fileId: string) {
    const tempDir = path.join(process.cwd(), 'tmp', fileId);
    fs.mkdirSync(tempDir, { recursive: true });

    const pdfPath = path.join(tempDir, 'source.pdf');
    fs.writeFileSync(pdfPath, pdfBuffer);

    await pdfPoppler.convert(pdfPath, {
      format: 'png',
      out_dir: tempDir,
      out_prefix: 'page',
      page: 1,
    });

    const imagePath = path.join(tempDir, 'page-1.png');

    const optimized = await sharp(imagePath)
      .resize(800)
      .png({ quality: 80 })
      .toBuffer();

    return optimized;
  }
}
