import express from 'express';
import { Server } from 'http';
import {useContainer, useExpressServer} from "routing-controllers";
import {Container, Service} from "typedi";
import {Orm} from "./orm";
import {RequestContext} from "@mikro-orm/core";
import {EventSubscriber} from "@mikro-orm/core/events";

export interface AppOptions {
    controllers: string[],
    entities: string[],
    tsNode: boolean,
    clientUrl: string,
    type: 'postgresql'
    subscribers?: EventSubscriber[]
}

@Service()
export class Application {
    public host: express.Application;
    public server: Server;
    private orm: Orm;
    private readonly appOptions: AppOptions;

    constructor(option: AppOptions) {
        this.appOptions = option;
    }

    public connect = async():Promise<void> => {
        try {
            // initialize MikroORM
            this.orm = Container.get(Orm);
            await this.orm.connect(this.appOptions);

            // auto migrate database schema
            // const migrator = this.orm.getMigrator();
            // const migrations = await migrator.getPendingMigrations();
            // if (migrations && migrations.length > 0) {
            //     await migrator.up();
            // }
        } catch (error) {
            console.error('🚨  Could not connect to the database', error);
            throw Error(error);
        }
    }

    // initialize express
    public init = async (): Promise<void> => {
        try {
            // initialize express
            this.host = express();

            useContainer(Container);

            // Fork Entity Manager for each request so their identity maps will not collide (https://mikro-orm.io/docs/installation/#request-context)
            this.host.use((req, res, next) => {
                RequestContext.create(this.orm.em(), next);
            });

            // Registering Controllers
            useExpressServer(this.host, {
                controllers: this.appOptions.controllers, // we specify controllers we want to use
            });

            // enable playground in dev
            // if (process.env.NODE_ENV !== 'production') {
            //     this.host.get('/graphql', expressPlayground({ endpoint: '/graphql' }));
            // }


            // add session handling
            // this.host.use(
            //     await session({
            //         store: new (connectPgSimple(session))(),
            //         name: 'qid',
            //         secret: process.env.COOKIE_SECRET,
            //         resave: false,
            //         saveUninitialized: false,
            //         cookie: {
            //             maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
            //             httpOnly: true,
            //             secure: process.env.NODE_ENV === 'production',
            //         },
            //     }),
            // );

            // enable cors
            // this.host.use(
            //     cors({
            //         credentials: true,
            //         origin: '*',
            //     }),
            // );

            // initialize schema
            // const schema: GraphQLSchema = await buildSchema({
            //     resolvers: [UserResolver, RoleResolver],
            //     authChecker: customAuthChecker,
            // });

            // add graphql route and middleware
            // this.host.post(
            //     '/graphql',
            //     bodyParser.json(),
            //     graphqlHTTP((req, res) => ({
            //         schema,
            //         context: { req, res, em: this.orm.em.fork() } as MyContext,
            //         customFormatErrorFn: (error) => {
            //             throw error;
            //         },
            //     })),
            // );

            // Not found
            // this.host.use(
            //     (
            //         req: express.Request,
            //         res,
            //         next
            //     ):void => {
            //         res.status(404).send({message: "not found :("})
            //     }
            // )


            // error middlware
            this.host.use(
                (
                    error: Error,
                    req: express.Request,
                    res: express.Response,
                    next: express.NextFunction, // eslint-disable-line @typescript-eslint/no-unused-vars
                ): void => {
                    console.error('🚨  Something went wrong', error);
                    res.status(400).send(error);
                },
            );

            // start server on default port 4000
            const port = process.env.PORT || 3000;
            this.server = await this.host.listen(port);

            console.log(`🚀  http://localhost:${port}`);

        } catch (error) {
            console.error('🚨  Could not start server', error);
        }
    };
}