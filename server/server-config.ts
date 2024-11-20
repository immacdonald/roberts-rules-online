interface ServerConfig {
    defaultDaysUntilVote: number;
    jwt: {
        secretKey: string;
        expiration: string;
    };
}

const serverConfig: ServerConfig = {
    defaultDaysUntilVote: 7,
    jwt: {
        secretKey: process.env.JWT_SECRET_KEY || 'DEV_SECRET_KEY',
        expiration: '1h'
    }
};

export { serverConfig };
