import {Service} from "typedi";
import {
    AnyEntity,
    Connection,
    EntityManager, EntityName,
    EntityRepository,
    IDatabaseDriver,
    MikroORM
} from "@mikro-orm/core";
import {AppOptions} from "application";

@Service()
export class Orm {
    private orm: MikroORM<IDatabaseDriver>;

    public async connect(appOptions: AppOptions): Promise<void> {
        this.orm = await MikroORM.init({
            entities: appOptions.entities,
            tsNode: appOptions.tsNode,
            clientUrl: appOptions.clientUrl,
            type: appOptions.type
        });
    }

    em(): EntityManager<IDatabaseDriver<Connection>> {
        return this.orm.em;
    }
    
    getRepository(entity: EntityName<AnyEntity<unknown>>): EntityRepository<AnyEntity<unknown>> {
        return this.em().getRepository(entity);
    }

}
