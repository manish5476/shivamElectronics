// src/api/AuthService.ts
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios, { AxiosInstance, AxiosResponse } from 'axios';
import { router } from 'expo-router'; // Import router from expo-router
import { appMessageService } from './AppMessageService';
import { environment } from './config/environment';

export interface LoginResponse {
  token: string;
  refresh_token?: string;
  data: {
    user: any; // Define a more specific user interface if possible
  };
}

class AuthService {
  private tokenKey = 'authToken';
  private userKey = 'user';
  private baseUrl = environment.apiUrl;

  // IMPORTANT: Use a separate Axios instance for Auth-related API calls (login, signup)
  // This prevents circular dependency with BaseApiService's interceptors.
  private authHttp: AxiosInstance;

  constructor() {
    this.authHttp = axios.create({
      baseURL: this.baseUrl,
      headers: {
        'Content-Type': 'application/json',
      },
      timeout: 10000,
    });
  }

  // --- AsyncStorage Wrapper Methods ---
  public async setItem(key: string, value: any): Promise<void> {
    try {
      await AsyncStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
      console.error(`AuthService - Error saving item to AsyncStorage for key: ${key}`, error);
    }
  }

  public async getItem<T>(key: string): Promise<T | null> {
    try {
      const item = await AsyncStorage.getItem(key);
      return item ? (JSON.parse(item) as T) : null;
    } catch (error) {
      console.error(`AuthService - Error parsing item from AsyncStorage for key: ${key}`, error);
      await this.removeItem(key); // Clear potentially corrupted data
      return null;
    }
  }

  public async removeItem(key: string): Promise<void> {
    try {
      await AsyncStorage.removeItem(key);
    } catch (error) {
      console.error(`AuthService - Error removing item from AsyncStorage for key: ${key}`, error);
    }
  }
  // --- End AsyncStorage Wrapper Methods ---

  public async getToken(): Promise<string | null> {
    const stored = await this.getItem<string>(this.tokenKey);
    return stored;
  }

  public async getUser(): Promise<any | null> {
    const stored = await this.getItem<any>(this.userKey);
    return stored;
  }

  private async handleAuthTokens(response: LoginResponse): Promise<void> {
    await this.setItem(this.tokenKey, response.token);
    await this.setItem(this.userKey, response.data.user);
    console.log('AuthService: Tokens and user data stored.');
  }

  public async login(data: any): Promise<LoginResponse | null> {
    try {
      const response: AxiosResponse<LoginResponse> = await this.authHttp.post<LoginResponse>(`${this.baseUrl}/v1/users/login`, data);
      await this.handleAuthTokens(response.data);
      appMessageService.handleResponse(response, 'Login Successful', 'You have been successfully logged in.');

      // Navigate to the main app route (e.g., your tabs) after successful login
      router.replace('/home'); // Assuming you have an app/home.tsx or app/(tabs) as your authenticated entry
      // If your protected routes are within app/(tabs), you might navigate to '/(tabs)' or a specific tab like '/(tabs)/index'
      // Example: router.replace('/(tabs)');
      return response.data;
    } catch (error: any) {
      appMessageService.handleResponse(error, 'Login Failed', 'Invalid credentials or server error.');
      console.error('AuthService - Login error:', error);
      return null;
    }
  }

  public async resetPassword(data: { password: string; passwordConfirm: string }): Promise<LoginResponse | null> {
    try {
      // NOTE: For password reset, the token is often part of the URL (e.g., from an email link)
      // or passed as a query parameter. Ensure your backend handles this correctly.
      // If the token is received externally (e.g., from a deep link), you'd pass it into this function.
      // If it's a token *already saved in AsyncStorage* that needs to be used for reset, get it here.
      // This implementation assumes the token is embedded in the URL as you had in Angular.
      const token = await this.getItem<string>(this.tokenKey); // Assuming the token for reset is in storage.
      if (!token) {
        appMessageService.showError('Reset Password Failed', 'No valid token found for password reset.');
        return null;
      }
      const response: AxiosResponse<LoginResponse> = await this.authHttp.patch<LoginResponse>(`${this.baseUrl}/v1/users/resetPassword/${token}`, data);
      await this.handleAuthTokens(response.data); // Log the user in after password reset (if it returns a new token)
      appMessageService.showSuccess('Password Reset', 'Your password has been successfully reset.');
      router.replace('/home'); // Or to a success screen, then login
      return response.data;
    } catch (error: any) {
      appMessageService.handleResponse(error, 'Reset Failed', 'Invalid token or server error.');
      console.error('AuthService - Reset password error:', error);
      return null;
    }
  }

  public async forgotPassword(email: string): Promise<any> {
    try {
      const response: AxiosResponse<any> = await this.authHttp.post(`${this.baseUrl}/v1/users/forgotPassword`, { email });
      appMessageService.showSuccess('Forgot Password', 'Password reset email sent. Please check your inbox.');
      return response.data;
    } catch (error: any) {
      appMessageService.handleResponse(error, 'Forgot Password Failed', 'Failed to send password reset email.');
      console.error('AuthService - Forgot password error:', error);
      throw error;
    }
  }

  public async updatePassword(data: { currentPassword: string; password: string; passwordConfirm: string }): Promise<LoginResponse | null> {
    try {
      // This call typically needs an authenticated user, so it should use BaseApiService's HTTP instance,
      // but for consistency with other auth calls, we'll keep it here.
      // If it requires the Auth header, BaseApiService's interceptors would handle it,
      // but we are using `authHttp` here which does NOT add headers.
      // If this endpoint requires authentication, you need to configure `authHttp` with an interceptor as well,
      // or move this specific call to a different service that uses BaseApiService's `http`.
      // For now, I'm assuming your backend handles `updatePassword` without a bearer token if `authHttp` is used,
      // or it might require one, in which case this logic needs careful review.
      // A common pattern is that 'updatePassword' for an *authenticated* user would go through `BaseApiService`.
      // Let's assume for *this* `AuthService` instance, we are only doing actions that *don't* require the token directly via interceptor.
      const response: AxiosResponse<LoginResponse> = await this.authHttp.patch<LoginResponse>(`${this.baseUrl}/v1/users/updatePassword`, data);
      await this.handleAuthTokens(response.data);
      appMessageService.showSuccess('Password Updated', 'Your password has been successfully updated.');
      return response.data;
    } catch (error: any) {
      appMessageService.handleResponse(error, 'Update Failed', 'Could not update password.');
      console.error('AuthService - Update password error:', error);
      return null;
    }
  }

  public async signUp(data: any): Promise<LoginResponse | null> {
    try {
      const response: AxiosResponse<LoginResponse> = await this.authHttp.post<LoginResponse>(`${this.baseUrl}/v1/users/signup`, data);
      await this.handleAuthTokens(response.data);
      appMessageService.showSuccess('Sign Up Successful', 'Your account has been created.');
      router.replace('/home'); // Navigate to the main app route
      return response.data;
    } catch (error: any) {
      appMessageService.handleResponse(error, 'Sign Up Failed', 'Failed to create account.');
      console.error('AuthService - Signup error:', error);
      return null;
    }
  }

  public async isAuthenticated(): Promise<boolean> {
    const token = await this.getToken();
    if (!token) {
      return false;
    }
    return !this.isTokenExpired(token);
  }

  private isTokenExpired(token: string): boolean {
    try {
      const payloadBase64 = token.split('.')[1];
      if (!payloadBase64) {
        console.error('AuthService - Token payload missing.');
        return true;
      }
      const payload = JSON.parse(atob(payloadBase64));
      if (typeof payload.exp !== 'number') {
        console.error('AuthService - Token expiration time (exp) is missing or invalid.');
        return true;
      }
      const isExpired = payload.exp * 1000 < Date.now();
      return isExpired;
    } catch (error) {
      console.error('AuthService - Error decoding or checking token expiration:', error);
      return true;
    }
  }

  public async logout(): Promise<void> {
    await this.removeItem(this.tokenKey);
    await this.removeItem(this.userKey);
    console.log('AuthService: User logged out.');

    // Navigate to the login screen using Expo Router's router.replace
    router.replace('/login'); // Assuming your login screen is at app/login.tsx
  }
}

export const authService = new AuthService();
// // src/api/AuthService.ts
// import AsyncStorage from '@react-native-async-storage/async-storage';
// import { CommonActions } from '@react-navigation/native'; // For navigation (if using React Navigation)
// import axios, { AxiosResponse } from 'axios';
// import { appMessageService } from './AppMessageService';
// import { environment } from './config/environment';

// // Define the navigation type for type safety
// type NavigationType = {
//   dispatch: (action: CommonActions.Action) => void;
//   // Add other navigation methods if needed for other scenarios
// };

// let navigationRef: NavigationType | null = null;

// // Function to set the navigation reference from your App's root navigator
// export const setNavigationRef = (ref: any) => { // Use 'any' if you don't want to type-check the full ref object
//   navigationRef = ref;
// };

// export interface LoginResponse {
//   token: string;
//   refresh_token?: string;
//   data: {
//     user: any; // Define a more specific user interface if possible
//   };
// }

// class AuthService {
//   private tokenKey = 'authToken';
//   private userKey = 'user';
//   private baseUrl = environment.apiUrl;
//   private http = axios.create({ baseURL: environment.apiUrl }); // Separate axios instance without interceptors for login/signup if needed, otherwise use BaseApiService's

//   // Constructor is not strictly necessary if you just want static methods or a singleton instance
//   constructor() {
//     // If this service needs its own interceptors, configure them here
//     // For simplicity, using a plain axios instance here for authentication calls
//     // because BaseApiService's interceptor relies on `authService.getToken()`, which would create a circular dependency.
//     // However, if you want BaseApiService to handle all requests including login,
//     // you'd need a different strategy for token retrieval in the interceptor.
//   }

//   // --- AsyncStorage Wrapper Methods ---
//   public async setItem(key: string, value: any): Promise<void> {
//     try {
//       await AsyncStorage.setItem(key, JSON.stringify(value));
//     } catch (error) {
//       console.error(`AuthService - Error saving item to AsyncStorage for key: ${key}`, error);
//     }
//   }

//   public async getItem<T>(key: string): Promise<T | null> {
//     try {
//       const item = await AsyncStorage.getItem(key);
//       return item ? (JSON.parse(item) as T) : null;
//     } catch (error) {
//       console.error(`AuthService - Error parsing item from AsyncStorage for key: ${key}`, error);
//       await this.removeItem(key); // Clear potentially corrupted data
//       return null;
//     }
//   }

//   public async removeItem(key: string): Promise<void> {
//     try {
//       await AsyncStorage.removeItem(key);
//     } catch (error) {
//       console.error(`AuthService - Error removing item from AsyncStorage for key: ${key}`, error);
//     }
//   }
//   // --- End AsyncStorage Wrapper Methods ---

//   public async getToken(): Promise<string | null> {
//     const stored = await this.getItem<string>(this.tokenKey);
//     return stored;
//   }

//   public async getUser(): Promise<any | null> {
//     const stored = await this.getItem<any>(this.userKey);
//     return stored;
//   }

//   private async handleAuthTokens(response: LoginResponse): Promise<void> {
//     await this.setItem(this.tokenKey, response.token);
//     await this.setItem(this.userKey, response.data.user);
//     console.log('AuthService: Tokens and user data stored.');
//     // You might also dispatch an action to a global state manager (Redux, Zustand, Context) here
//   }

//   public async login(data: any): Promise<LoginResponse | null> {
//     try {
//       const response: AxiosResponse<LoginResponse> = await this.http.post<LoginResponse>(`${this.baseUrl}/v1/users/login`, data);
//       await this.handleAuthTokens(response.data);
//       appMessageService.handleResponse(response, 'Login Successful', 'You have been successfully logged in.');
//       console.log('AuthService: User logged in.',response.data);
      
//       return response.data;
//     } catch (error: any) { // Use 'any' for the catch error or AxiosError
//       appMessageService.handleResponse(error, 'Login Failed', 'Invalid credentials or server error.');
//       console.error('AuthService - Login error:', error);
//       return null;
//     }
//   }

//   public async resetPassword(data: { password: string; passwordConfirm: string }): Promise<LoginResponse | null> {
//     try {
//       const token = await this.getItem<string>(this.tokenKey); // Assuming this token is used for password reset (e.g., from email link)
//       if (!token) {
//         appMessageService.showError('Reset Password Failed', 'No authentication token found. Please login again.');
//         return null;
//       }
//       const response: AxiosResponse<LoginResponse> = await this.http.patch<LoginResponse>(`${this.baseUrl}/v1/users/resetPassword/${token}`, data);
//       await this.handleAuthTokens(response.data);
//       appMessageService.showSuccess('Password Reset', 'Your password has been successfully reset.');
//       return response.data;
//     } catch (error: any) {
//       appMessageService.handleResponse(error, 'Reset Failed', 'Invalid token or server error.');
//       console.error('AuthService - Reset password error:', error);
//       return null;
//     }
//   }

//   public async forgotPassword(email: string): Promise<any> {
//     try {
//       const response: AxiosResponse<any> = await this.http.post(`${this.baseUrl}/v1/users/forgotPassword`, { email });
//       appMessageService.showSuccess('Forgot Password', 'Password reset email sent. Please check your inbox.');
//       return response.data;
//     } catch (error: any) {
//       appMessageService.handleResponse(error, 'Forgot Password Failed', 'Failed to send password reset email.');
//       console.error('AuthService - Forgot password error:', error);
//       throw error; // Re-throw to be handled by caller if needed
//     }
//   }

//   public async updatePassword(data: { currentPassword: string; password: string; passwordConfirm: string }): Promise<LoginResponse | null> {
//     try {
//       const response: AxiosResponse<LoginResponse> = await this.http.patch<LoginResponse>(`${this.baseUrl}/v1/users/updatePassword`, data);
//       await this.handleAuthTokens(response.data);
//       appMessageService.showSuccess('Password Updated', 'Your password has been successfully updated.');
//       return response.data;
//     } catch (error: any) {
//       appMessageService.handleResponse(error, 'Update Failed', 'Could not update password.');
//       console.error('AuthService - Update password error:', error);
//       return null;
//     }
//   }

//   public async signUp(data: any): Promise<LoginResponse | null> {
//     try {
//       const response: AxiosResponse<LoginResponse> = await this.http.post<LoginResponse>(`${this.baseUrl}/v1/users/signup`, data);
//       await this.handleAuthTokens(response.data);
//       appMessageService.showSuccess('Sign Up Successful', 'Your account has been created.');
//       return response.data;
//     } catch (error: any) {
//       appMessageService.handleResponse(error, 'Sign Up Failed', 'Failed to create account.');
//       console.error('AuthService - Signup error:', error);
//       return null;
//     }
//   }

//   public async isAuthenticated(): Promise<boolean> {
//     const token = await this.getToken();
//     if (!token) {
//       return false;
//     }
//     return !this.isTokenExpired(token);
//   }

//   private isTokenExpired(token: string): boolean {
//     try {
//       const payloadBase64 = token.split('.')[1];
//       if (!payloadBase64) {
//         console.error('AuthService - Token payload missing.');
//         return true;
//       }
//       const payload = JSON.parse(atob(payloadBase64));
//       // Check if 'exp' (expiration time) exists and is a number
//       if (typeof payload.exp !== 'number') {
//         console.error('AuthService - Token expiration time (exp) is missing or invalid.');
//         return true;
//       }
//       const isExpired = payload.exp * 1000 < Date.now();
//       return isExpired;
//     } catch (error) {
//       console.error('AuthService - Error decoding or checking token expiration:', error);
//       return true;
//     }
//   }

//   public async logout(): Promise<void> {
//     await this.removeItem(this.tokenKey);
//     await this.removeItem(this.userKey);
//     console.log('AuthService: User logged out.');

//     // Reset navigation stack to login screen
//     if (navigationRef) {
//       navigationRef.dispatch(
//         CommonActions.reset({
//           index: 0,
//           routes: [{ name: 'Login' }], // Replace 'Login' with your actual login screen route name
//         })
//       );
//     } else {
//       console.warn('Navigation reference not set in AuthService. Cannot navigate to login.');
//       // In a real app, you might use a global event emitter or a state management library
//       // to trigger navigation from a component level.
//     }
//   }
// }

// export const authService = new AuthService();