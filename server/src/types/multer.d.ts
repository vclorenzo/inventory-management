declare module "multer" {
  import { NextFunction, Request, Response } from "express";

  interface UploadedFileInfo {
    fieldname: string;
    originalname: string;
    encoding: string;
    mimetype: string;
  }

  interface Options {
    storage?: unknown;
    defParamCharset?: string;
    limits?: {
      fileSize?: number;
      files?: number;
    };
    fileFilter?: (
      req: Request,
      file: UploadedFileInfo,
      callback: (error: Error | null, acceptFile?: boolean) => void,
    ) => void;
  }

  type Middleware = (
    req: Request,
    res: Response,
    next: NextFunction,
  ) => void;

  interface Instance {
    single(fieldName: string): Middleware;
  }

  interface Factory {
    (options?: Options): Instance;
    memoryStorage(): unknown;
  }

  const multer: Factory;
  export default multer;
}
