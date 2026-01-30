declare module 'pdf2pic' {
  interface ConvertOptions {
    density?: number;
    saveFilename?: string;
    savePath?: string;
    format?: 'png' | 'jpg' | 'jpeg';
    width?: number;
    height?: number;
    quality?: number;
  }

  interface ConvertResult {
    name: string;
    size: number;
    path: string;
    page: number;
  }

  interface Convert {
    (pageNumber: number, options?: { responseType: 'image' | 'base64' }): Promise<ConvertResult>;
    bulk(pages: number | number[], options?: { responseType: 'image' | 'base64' }): Promise<ConvertResult[]>;
    setGMClass(gmClass: any): void;
  }

  export function fromPath(pdfPath: string, options?: ConvertOptions): Convert;
  export function fromBuffer(pdfBuffer: Buffer, options?: ConvertOptions): Convert;
  export function fromBase64(base64String: string, options?: ConvertOptions): Convert;
}
