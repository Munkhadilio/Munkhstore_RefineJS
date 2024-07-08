import axios from 'axios';
import type { DataProvider } from '@refinedev/core';

const API_URL = 'http://localhost:4444';

export const dataProvider: DataProvider = {
  getOne: async ({ resource, id, meta }) => {
    try {
      const response = await axios.get(`${API_URL}/${resource}/${id}`);
      const data = response.data;

      return {
        data,
      };
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw error.response;
      } else {
        throw new Error('Network error');
      }
    }
  },
  update: async ({ resource, variables, id }) => {
    try {
      const response = await axios.patch(`${API_URL}/${resource}/${id}`, variables);
      const createdItem = response.data;
      return { data: createdItem };
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw error.response;
      } else {
        throw new Error('Network error');
      }
    }
  },
  getList: async ({ resource, pagination, filters, sorters, meta }) => {
    try {
      const response = await axios.get(`${API_URL}/${resource}`);
      const data = response.data;

      return {
        data,
        total: data.length,
      };
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw error.response;
      } else {
        throw new Error('Network error');
      }
    }
  },
  create: async ({ resource, variables, meta }) => {
    try {
      const response = await axios.post(`${API_URL}/${resource}`, variables);
      const createdItem = response.data;
      return { data: createdItem };
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw error.response;
      } else {
        throw new Error('Network error');
      }
    }
  },
  deleteOne: async ({ resource, id, meta }) => {
    try {
      const response = await axios.delete(`${API_URL}/${resource}/${id}`);
      const data = response.data;

      return {
        data,
      };
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw error.response;
      } else {
        throw new Error('Network error');
      }
    }
  },
  getApiUrl: () => API_URL,
};
