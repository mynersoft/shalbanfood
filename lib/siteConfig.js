export const BASE_URL = (
    process.env.NEXT_PUBLIC_BASE_URL ||
    (process.env.NODE_ENV === 'production'
        ? 'https://www.shalbanfood.shop'
        : 'http://localhost:3000')
).replace(/\/+$/, '');