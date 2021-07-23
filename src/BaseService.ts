import {app} from "./server";
import {UUID} from "massive";

abstract class BaseService {
    public table:string;

    protected constructor(table: string) {
        this.table = table;
    }

    public async getAll():Promise<unknown> {
        return await app.get('db')[this.table].find();
    }

    public async getOne(id: UUID):Promise<unknown> {
        return await app.get('db')[this.table].findOne(id);
    }

    public async create(data: unknown):Promise<unknown> {
        return await app.get('db')[this.table].insert(data)
    }
}

export {BaseService};