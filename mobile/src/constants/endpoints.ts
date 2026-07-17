export const ENDPOINTS = {
  BRANDS: {
    LIST: '/api/v1/brands',
    MODELS: (brandId: string) => `/api/v1/brands/${brandId}/models`,
  },
  VEHICLES: {
    BASE: '/api/v1/vehicles',
    DETAIL: (id: string) => `/api/v1/vehicles/${id}`,
    PRIMARY: (id: string) => `/api/v1/vehicles/${id}/primary`,
  },
  JOBS: {
    BASE: '/api/v1/jobs',
    DETAIL: (id: string) => `/api/v1/jobs/${id}`,
    CANCEL: (id: string) => `/api/v1/jobs/${id}/cancel`,
  },
} as const;
