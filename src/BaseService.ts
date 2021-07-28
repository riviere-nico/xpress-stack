import {app} from "./server";
import {UUID} from "massive";

export declare type ObjectType<T> = {
    new (): T;
} | Function;

abstract class BaseService {
    public table:string;

    protected constructor(table: string) {
        this.table = table;
    }

    public async getAll<T extends BaseService>(this: ObjectType<T>):Promise<T> {
        return await app.get('db').contact.find();
    }

    public async getOne(id: UUID):Promise<unknown> {
        return await app.get('db')[this.table].findOne(id);
    }

    public async create(data: unknown):Promise<unknown> {
        return await app.get('db')[this.table].insert(data)
    }
}

export {BaseService};