import axiosInstance, { baseAPI } from './axios';

/**
 * Common GET API function
 * @param token - Bearer auth token (optional)
 * @param data - Query parameters object
 * @param url - API endpoint URL or full URL
 */
export async function _getAPI(token: any, data: any, url: string): Promise<any> {
  const config = token
    ? {
        headers: { Authorization: `Bearer ${token}` },
      }
    : {};

  const query = data ? new URLSearchParams(data).toString() : '';
  const requestUrl = query ? `${url || baseAPI}?${query}` : url || baseAPI;

  return await axiosInstance
    .get(requestUrl, config)
    .then((response) => {
      return response.data;
    })
    .then((data) => {
      //console.log(data)
      return data;
    })
    .catch((error) => {
      console.log(error?.response?.data);
      return error?.response?.data;
    });
}

/**
 * Common POST API function
 * @param token - Bearer auth token (optional)
 * @param data - Request body payload
 * @param url - API endpoint URL or full URL
 * @param customHeaders - Additional custom headers (optional)
 */
export async function _postAPI(
  token: any,
  data: any,
  url: string,
  customHeaders?: any
): Promise<any> {
  const config: any = {
    headers: {
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(customHeaders || {}),
    },
  };

  return await axiosInstance
    .post(url || baseAPI, data, config)
    .then((response) => {
      return response.data;
    })
    .then((resData) => {
      //console.log(resData)
      return resData;
    })
    .catch((error) => {
      console.log(error?.response?.data);
      return error?.response?.data;
    });
}

/**
 * Common PUT API function
 */
export async function _putAPI(
  token: any,
  data: any,
  url: string,
  customHeaders?: any
): Promise<any> {
  const config: any = {
    headers: {
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(customHeaders || {}),
    },
  };

  return await axiosInstance
    .put(url || baseAPI, data, config)
    .then((response) => {
      return response.data;
    })
    .catch((error) => {
      console.log(error?.response?.data);
      return error?.response?.data;
    });
}

/**
 * Common DELETE API function
 */
export async function _deleteAPI(
  token: any,
  data: any,
  url: string,
  customHeaders?: any
): Promise<any> {
  const config: any = {
    headers: {
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(customHeaders || {}),
    },
    data,
  };

  return await axiosInstance
    .delete(url || baseAPI, config)
    .then((response) => {
      return response.data;
    })
    .catch((error) => {
      console.log(error?.response?.data);
      return error?.response?.data;
    });
}
