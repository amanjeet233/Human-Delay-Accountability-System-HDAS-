'use client';

import { useCallback } from 'react';
import { apiClient, ApiResponse, FeatureDisabledResponse } from '../apiClient';
import { useFeatureFlags } from '../featureFlagContext';

type HttpMethod = 'GET' | 'POST' | 'PUT' | 'DELETE';

interface UseApiOptions {
  featureFlag?: string;
  onSuccess?: (data: any) => void;
  onError?: (err: any) => void;
}

export const useApi = () => {
  const { isEnabled } = useFeatureFlags();

  const request = useCallback(
    async <T = any>(
      method: HttpMethod,
      url: string,
      data?: any,
      options?: UseApiOptions
    ): Promise<T> => {
      const { featureFlag, onSuccess, onError } = options ?? {};

      // Feature-flag guard
      if (featureFlag && !isEnabled(featureFlag)) {
        const disabled: FeatureDisabledResponse = {
          error: 'FEATURE_DISABLED',
          message: 'Feature Coming Soon',
        };
        // Throw a structured error so callers can handle it consistently
        const err = new Error(disabled.message) as any;
        err.response = { status: 403, data: disabled };
        throw err;
      }

      try {
        let res;
        switch (method) {
          case 'GET':
            res = await apiClient.get<T>(url, data);
            break;
          case 'POST':
            res = await apiClient.post<T>(url, data);
            break;
          case 'PUT':
            res = await apiClient.put<T>(url, data);
            break;
          case 'DELETE':
            res = await apiClient.delete<T>(url);
            break;
          default:
            throw new Error(`Unsupported method: ${method}`);
        }

        onSuccess?.(res.data);
        return res.data;
      } catch (e: any) {
        onError?.(e);
        throw e;
      }
    },
    [isEnabled]
  );

  // Convenience methods
  const get = useCallback(<T = any>(url: string, params?: any, opts?: UseApiOptions) => request<T>('GET', url, params, opts), [request]);
  const post = useCallback(<T = any>(url: string, data?: any, opts?: UseApiOptions) => request<T>('POST', url, data, opts), [request]);
  const put = useCallback(<T = any>(url: string, data?: any, opts?: UseApiOptions) => request<T>('PUT', url, data, opts), [request]);
  const del = useCallback(<T = any>(url: string, opts?: UseApiOptions) => request<T>('DELETE', url, undefined, opts), [request]);

  return { get, post, put, delete: del, request };
};
