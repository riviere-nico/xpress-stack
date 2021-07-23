import express from "express";
import {rootDir} from "@utils/rootDir";
import { logger } from '@utils/logger';
import 'dotenv/config';
import validateEnv from '@utils/validateEnv';
import massive from "massive";
import {buildSchema, NonEmptyArray} from "type-graphql";
import path from 'path';
import {Container} from "typedi";
import {graphqlHTTP} from "express-graphql";
import fs from "fs";

const app: express.Application = express();
const port:number = +process.env.PORT || 3000;
const env:string = process.env.NODE_ENV || 'development'
const __root:string = rootDir();

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

const setGraphql = async (resolverDir: string): Promise<Array<Function>> => {
    const dir = path.join(__root + '/dist', resolverDir);
    const files = fs.readdirSync(dir);

    const allResolvers: Array<Function> = [];

    for (const file of files) {
        if(['.js', '.ts'].includes(path.extname(file))) {
            const {default: resolver} = await import(`${dir}/${file}`);
            allResolvers.push(resolver)
        }
    }

    if (allResolvers.length) {
        const schema = await buildSchema({
            resolvers: allResolvers as NonEmptyArray<Function>,
            container: Container,
            emitSchemaFile: true,
        });

        app.use('/graphql', graphqlHTTP({
            schema: schema,
            graphiql: true
        }));
    }

    return allResolvers;
}

const run = async ({resolverDir = 'resolvers'} = {}) => {

    await dbConnexion();

    await setGraphql(resolverDir)

    await app.listen(port);

    logger.info(`=================================`);
    logger.info(`======= ENV: ${env} =======`);
    logger.info(`🚀 App listening on the port ${port}`);
    logger.info(`=================================`);

}

export {app, run, dbConnexion};