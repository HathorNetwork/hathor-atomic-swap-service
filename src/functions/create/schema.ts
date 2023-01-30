export default {
  type: 'object',
  properties: {
    partialTx: { type: 'string' },
    authPassword: { type: 'string' },
    expiresAt: { type: 'Date' },
  },
  required: ['partialTx', 'authPassword'],
} as const;
