export const QUERY_KEYS = {
  BRANDS: ['brands'] as const,
  MODELS: (brandId: string) => ['models', brandId] as const,
  VEHICLES: (status: string, page: number, size: number) => ['vehicles', { status, page, size }] as const,
  VEHICLE: (id: string) => ['vehicle', id] as const,
} as const;
