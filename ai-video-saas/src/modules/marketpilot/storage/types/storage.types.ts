export interface UploadOptions {
  contentType?: string;
  metadata?: Record<string, string>;
}

export interface StorageProvider {
  /**
   * Uploads a local file to the cloud storage provider.
   * @param localFilePath Path to the file on the local disk.
   * @param destinationPath The path in the cloud bucket (e.g., workspaces/{ws_id}/campaigns/{cmp_id}/asset.png).
   * @param options Additional upload options like Content-Type and metadata.
   * @returns The storage URL (e.g. gs://bucket/... or https://...)
   */
  uploadFile(localFilePath: string, destinationPath: string, options?: UploadOptions): Promise<string>;

  /**
   * Generates a pre-signed URL to temporarily grant access to a private asset.
   */
  getSignedUrl(destinationPath: string, expiresInMinutes?: number): Promise<string>;

  /**
   * Deletes a file from the cloud bucket.
   */
  deleteFile(destinationPath: string): Promise<boolean>;
}
