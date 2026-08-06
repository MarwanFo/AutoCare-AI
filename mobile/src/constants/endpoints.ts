export const ENDPOINTS = {
  BRANDS: {
    LIST: '/api/v1/brands',
    MODELS: (brandId: string) => `/api/v1/brands/${brandId}/models`,
  },
  VEHICLES: {
    BASE: '/api/v1/vehicles',
    DETAIL: (id: string) => `/api/v1/vehicles/${id}`,
    PRIMARY: (id: string) => `/api/v1/vehicles/${id}/primary`,
    BATCH_COMPONENT_DATES: (id: string) => `/api/v1/vehicles/${id}/components/batch-dates`,
  },
  JOBS: {
    BASE: '/api/v1/jobs',
    DETAIL: (id: string) => `/api/v1/jobs/${id}`,
    CANCEL: (id: string) => `/api/v1/jobs/${id}/cancel`,
  },
  USER: {
    ME: '/api/v1/users/me',
    PREFERENCES: '/api/v1/users/me/preferences',
    AVATAR: '/api/v1/users/me/avatar',
    PASSWORD: '/api/v1/users/me/password',
  },
} as const;
