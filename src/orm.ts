import {Service} from "typedi";
import {
    AnyEntity,
    Connection,
    EntityManager, EntityName,
    EntityRepository,
    IDatabaseDriver,
    MikroORM
} from "@mikro-orm/core";
import {AppOptions} from "./application";
import {IMigrator} from "@mikro-orm/core/typings";
import fs from "fs";
import path from "path";
import {EventSubscriber} from "@mikro-orm/core/events";
import globby from "globby";

@Service()
export class Orm {
    private orm: MikroORM<IDatabaseDriver>;

    public async connect(appOptions: AppOptions): Promise<void> {

        this.orm = await MikroORM.init({
            entities: appOptions.entities,
            entitiesTs: appOptions.entitiesTs,
            tsNode: appOptions.tsNode,
            clientUrl: appOptions.clientUrl,
            type: appOptions.type,
            subscribers: await Orm.getSubscribers(appOptions.subscribers)
        });
    }

    private static async getSubscribers(dirs: string[]):Promise<EventSubscriber[]> {
        const loadedSubscribers:EventSubscriber[] = [];
        const files = await globby(dirs);

        for (const file of files) {
            const sub = await import(file);
            loadedSubscribers.push(sub);
        }

        return loadedSubscribers;
    }

    em(): EntityManager<IDatabaseDriver<Connection>> {
        return this.orm.em;
    }
    
    getRepository(entity: EntityName<AnyEntity<unknown>>): EntityRepository<AnyEntity<unknown>> {
        return this.em().getRepository(entity);
    }

    getMigrator(): IMigrator {
        return this.orm.getMigrator();
    }
}
