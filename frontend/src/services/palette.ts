import apiClient from "./auth";
import axios from "axios";

export interface PaletteFile {
  id: number;
  file_name: string;
  file_type: {
    id: number;
    name: string;
    file_extension: string;
  };
  download_url: string;
  created_at: string;
  updated_at: string;
}

export interface UserPalette {
  id: number;
  name: string;
  primary: string;
  secondary: string | null;
  tertiary: string | null;
  created_at: string;
  updated_at: string;
  files: PaletteFile[];
  status: 'processing' | 'completed' | 'error';
  error_message?: string;
}

export interface BackendPalette {
  [slug: string]: {
    name: string;
    shades: {
      [k in "100" | "200" | "300" | "400" | "500" | "600" | "700" | "800" | "900"]: {
        rgb: [number, number, number];
        hex: string;
        hsb: [number, number, number];  // HSB values [hue, saturation, brightness]
        cmyk: [number, number, number, number];  // CMYK values [cyan, magenta, yellow, key/black]
      };
    };
  };
}

export interface CreatePaletteData {
  name: string;
  primary: string;
  secondary?: string;
  tertiary?: string;
}

export const fetchPalettePreview = async (payload: {
  primary: string;
  secondary: string;
  tertiary?: string;
  include_tertiary?: boolean;
}) => {
  try {
    const { data } = await apiClient.post<BackendPalette>(
      "/generator/palettes/preview/",
      payload,
      {
        timeout: 10000, // 10 second timeout
        skipAuthRefresh: true // Skip auth refresh for this request
      }
    );
    return data;
  } catch (error) {
    console.error("Error fetching palette preview:", error);
    if (axios.isAxiosError(error)) {
      if (error.response) {
        // The request was made and the server responded with a status code
        // that falls out of the range of 2xx
        console.error("Response data:", error.response.data);
        console.error("Response status:", error.response.status);
        console.error("Response headers:", error.response.headers);
      } else if (error.request) {
        // The request was made but no response was received
        console.error("No response received:", error.request);
      } else {
        // Something happened in setting up the request that triggered an Error
        console.error("Error:", error.message);
      }
    }
    throw error; // Re-throw to be handled by the component
  }
};

export const fetchUserPalettes = async (): Promise<UserPalette[]> => {
  try {
    const response = await apiClient.get("/generator/palettes/");
    // Ensure we always return an array, even if the response is empty or null/undefined
    if (Array.isArray(response.data)) {
      return response.data;
    } else if (response.data && typeof response.data === 'object') {
      // If the response is an object, try to extract results if it's paginated
      return response.data.results || [response.data];
    }
    console.warn('Unexpected API response format:', response.data);
    return [];
  } catch (error) {
    console.error("Error fetching user palettes:", error);
    throw error;
  }
};

export const downloadPaletteFiles = async (paletteId: number): Promise<Blob> => {
  try {
    const response = await apiClient.get(`/generator/palettes/${paletteId}/download/`, {
      responseType: 'blob'
    });
    return response.data;
  } catch (error) {
    console.error("Error downloading palette files:", error);
    throw error;
  }
};

export const downloadPaletteFile = async (fileId: number): Promise<Blob> => {
  try {
    const response = await apiClient.get(`/generator/palette-files/${fileId}/download/`, {
      responseType: 'blob'
    });
    return response.data;
  } catch (error) {
    console.error("Error downloading palette file:", error);
    throw error;
  }
};

export const deletePalette = async (paletteId: number): Promise<void> => {
  try {
    await apiClient.delete(`/generator/palettes/${paletteId}/`);
  } catch (error) {
    console.error("Error deleting palette:", error);
    throw error;
  }
};

export const createPalette = async (paletteData: CreatePaletteData): Promise<UserPalette> => {
  try {
    console.log('Creating palette with data:', paletteData);
    const response = await apiClient.post<UserPalette>("/generator/palettes/", paletteData);
    console.log('Palette created successfully:', response.data);
    return response.data;
  } catch (error: any) {
    console.error("Error creating palette:", error);
    
    if (error.response) {
      // Handle axios error with response
      console.error('Error response data:', error.response.data);
      console.error('Error status:', error.response.status);
      console.error('Error headers:', error.response.headers);
      
      // If there's a validation error, include the details in the error message
      if (error.response.data) {
        const errorData = error.response.data;
        let errorMessage = 'Failed to create palette';
        
        if (typeof errorData === 'string') {
          errorMessage = errorData;
        } else if (typeof errorData === 'object') {
          const errorMessages = Object.entries(errorData)
            .map(([field, errors]) => {
              if (Array.isArray(errors)) {
                return `${field}: ${errors.join(' ')}`;
              }
              return `${field}: ${String(errors)}`;
            })
            .join('\n');
          errorMessage = `Failed to create palette: ${errorMessages}`;
        }
        
        throw new Error(errorMessage);
      }
    } else if (error.request) {
      // The request was made but no response was received
      console.error('No response received:', error.request);
      throw new Error('No response received from the server. Please check your connection.');
    } else {
      // Something happened in setting up the request
      console.error('Error message:', error.message);
      throw new Error(error.message || 'An unknown error occurred while creating the palette.');
    }
    
    // If we get here, rethrow the original error
    throw error;
  }
};

export const downloadAnonymousPalette = async (payload: {
  name: string;
  primary: string;
  secondary: string;
  tertiary?: string;
  include_tertiary?: boolean;
}): Promise<Blob> => {
  try {
    const response = await apiClient.post(
      "/generator/palettes/download-anonymous/",
      payload,
      {
        responseType: 'blob',
        skipAuthRefresh: true
      }
    );
    return response.data;
  } catch (error) {
    console.error("Error downloading anonymous palette:", error);
    throw error;
  }
};
