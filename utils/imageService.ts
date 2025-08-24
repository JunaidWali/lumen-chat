import * as ImageManipulator from "expo-image-manipulator";
import * as ImagePicker from "expo-image-picker";

export interface ImagePickerResult {
  uri: string;
  width: number;
  height: number;
  type: string;
}

class ImageService {
  async requestPermissions(): Promise<boolean> {
    try {
      const libraryPermission =
        await ImagePicker.requestMediaLibraryPermissionsAsync();
      const cameraPermission =
        await ImagePicker.requestCameraPermissionsAsync();

      return (
        libraryPermission.status === "granted" &&
        cameraPermission.status === "granted"
      );
    } catch (error) {
      console.error("Error requesting image permissions:", error);
      return false;
    }
  }

  async pickFromLibrary(): Promise<ImagePickerResult[]> {
    try {
      const hasPermission = await this.requestPermissions();
      if (!hasPermission) {
        throw new Error("Image library permission not granted");
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ["images"],
        allowsMultipleSelection: true,
        quality: 0.8,
        allowsEditing: false,
      });

      if (result.canceled) {
        return [];
      }

      return result.assets.map((asset) => ({
        uri: asset.uri,
        width: asset.width,
        height: asset.height,
        type: asset.type || "image",
      }));
    } catch (error) {
      console.error("Failed to pick images from library:", error);
      throw error;
    }
  }

  async takePhoto(): Promise<ImagePickerResult | null> {
    try {
      const hasPermission = await this.requestPermissions();
      if (!hasPermission) {
        throw new Error("Camera permission not granted");
      }

      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ["images"],
        quality: 0.8,
        allowsEditing: true,
        aspect: [1, 1],
      });

      if (result.canceled) {
        return null;
      }

      const asset = result.assets[0];
      return {
        uri: asset.uri,
        width: asset.width,
        height: asset.height,
        type: asset.type || "image",
      };
    } catch (error) {
      console.error("Failed to take photo:", error);
      throw error;
    }
  }

  async compressImage(uri: string, maxWidth: number = 1024): Promise<string> {
    try {
      const result = await ImageManipulator.manipulateAsync(
        uri,
        [{ resize: { width: maxWidth } }],
        {
          compress: 0.7,
          format: ImageManipulator.SaveFormat.JPEG,
        }
      );

      return result.uri;
    } catch (error) {
      console.error("Failed to compress image:", error);
      return uri; // Return original if compression fails
    }
  }

  async getImageDimensions(
    uri: string
  ): Promise<{ width: number; height: number }> {
    try {
      const result = await ImageManipulator.manipulateAsync(uri, [], {});
      return { width: result.width, height: result.height };
    } catch (error) {
      console.error("Failed to get image dimensions:", error);
      return { width: 0, height: 0 };
    }
  }

  isImageUri(uri: string): boolean {
    const imageExtensions = [".jpg", ".jpeg", ".png", ".gif", ".bmp", ".webp"];
    const lowercaseUri = uri.toLowerCase();
    return imageExtensions.some((ext) => lowercaseUri.includes(ext));
  }
}

export const imageService = new ImageService();
