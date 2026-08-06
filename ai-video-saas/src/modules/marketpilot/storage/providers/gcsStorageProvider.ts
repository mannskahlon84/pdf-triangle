import { StorageProvider, UploadOptions } from "../types/storage.types";

export class GCSStorageProvider implements StorageProvider {
  private bucketName: string;

  constructor(bucketName: string = "marketpilot-assets") {
    this.bucketName = bucketName;
  }

  public async uploadFile(localFilePath: string, destinationPath: string, options?: UploadOptions): Promise<string> {
    // In Phase 1, we mock the physical upload
    console.log(`[GCS Mock] Uploading ${localFilePath} to gs://${this.bucketName}/${destinationPath}`);
    if (options?.metadata) {
      console.log(`[GCS Mock] Attaching metadata:`, options.metadata);
    }
    
    // Simulating upload delay
    await new Promise(resolve => setTimeout(resolve, 100));

    return `gs://${this.bucketName}/${destinationPath}`;
  }

  public async getSignedUrl(destinationPath: string, expiresInMinutes: number = 60): Promise<string> {
    // Mocking signed URL generation
    console.log(`[GCS Mock] Generating signed URL for gs://${this.bucketName}/${destinationPath} (expires in ${expiresInMinutes}m)`);
    return `https://storage.googleapis.com/${this.bucketName}/${destinationPath}?signature=mock_sig&expires=${Date.now() + expiresInMinutes * 60000}`;
  }

  public async deleteFile(destinationPath: string): Promise<boolean> {
    console.log(`[GCS Mock] Deleting gs://${this.bucketName}/${destinationPath}`);
    return true;
  }
}
