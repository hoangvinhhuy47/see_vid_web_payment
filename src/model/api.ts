export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
  statusCode: number;
}

export interface ErrorDetails {
  code: string;
  message: string;
  details?: Record<string, unknown>;
}
