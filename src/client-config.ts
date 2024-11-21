interface ClientConfig {
    production: boolean;
    url: string;
}

const production = process.env.NODE_ENV == 'production';
const port = parseInt(import.meta.env.VITE_PORT || '3000');

const clientConfig: ClientConfig = {
    production,
    url: production ? `https://${import.meta.env.VITE_PRODUCTION_URL}` : `http://localhost:${port}`
};

export { clientConfig };
