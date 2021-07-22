import express from "express";
import 'dotenv/config';
import { logger } from '@utils/logger';
import validateEnv from '@utils/validateEnv';

validateEnv();

export class Server {
    public server: express.Application;
    public port: string | number;
    public env: string;

    constructor() {
        this.server = express();
        this.port = process.env.PORT || 3000;
        this.env = process.env.NODE_ENV || 'development';
    }

    public listen() {
        this.server.listen(this.port, () => {
            logger.info(`=================================`);
            logger.info(`======= ENV: ${this.env} =======`);
            logger.info(`🚀 App listening on the port ${this.port}`);
            logger.info(`=================================`);
        });
    }

    public getServer() {
        return this.server;
    }
}