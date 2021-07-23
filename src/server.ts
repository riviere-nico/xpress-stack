import express from "express";

import { logger } from '@utils/logger';
import 'dotenv/config';
import validateEnv from '@utils/validateEnv';
import massive from "massive";
import {buildSchema} from "type-graphql";

import path from 'path';
import {Container} from "typedi";
import {graphqlHTTP} from "express-graphql";
const __root = path.resolve("./");

const app: express.Application = express();
const port:number = +process.env.PORT || 3000;
const env:string = process.env.NODE_ENV || 'development'

validateEnv();

let dbInstance: massive.Database;

const dbConnexion = async (): Promise<void> => {
    dbInstance = await massive({
        host: '127.0.0.1',
        port: 5432,
        database: 'test',
        user: 'test',
        password: 'test'
    })

    app.set('db', dbInstance)
}

const run = async () => {

    await dbConnexion();
    const resolver = await import(`${__root}/dist/resolvers/contact.js`)

    console.log('resolver', resolver)

    const schema = await buildSchema({
        resolvers: [resolver.ContactResolver],
        container: Container,
        emitSchemaFile: true,
    });

    app.use('/graphql', graphqlHTTP({
        schema: schema,
        graphiql: true
    }));

    await app.listen(port);

    logger.info(`=================================`);
    logger.info(`======= ENV: ${env} =======`);
    logger.info(`🚀 App listening on the port ${port}`);
    logger.info(`=================================`);

}

export {app, run, dbConnexion};