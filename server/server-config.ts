interface ServerConfig {
    production: boolean;
    url: string;
    port: number;
    committees: {
        defaultDaysUntilVote: number;
    };
    jwt: {
        secretKey: string;
        expiration: string;
    };
}

const production = process.env.NODE_ENV == 'production';
const port = parseInt(process.env.PORT || '3000');

const serverConfig: ServerConfig = {
    production,
    url: production ? `https://${process.env.PRODUCTION_URL}` : `http://localhost:${port}`,
    port,
    committees: {
        defaultDaysUntilVote: 7
    },
    jwt: {
        secretKey: process.env.JWT_SECRET_KEY || 'DEV_SECRET_KEY',
        expiration: '1h'
    }
};

export { serverConfig };
