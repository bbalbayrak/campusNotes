import { BadRequestException } from '@nestjs/common';

export const multerOptions = {
  fileFilter: (req, file, cb) => {
    const allowedMimeTypes = [
      'application/pdf',
      'image/jpeg',
      'image/png',
      'image/webp',
    ];

    if (!allowedMimeTypes.includes(file.mimetype)) {
      return cb(
        new BadRequestException('Only PDF and image files are allowed'),
        false,
      );
    }

    cb(null, true);
  },
  limits: {
    fileSize: 5 * 1024 * 1024, // 5 MB
  },
};
