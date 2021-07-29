#!/usr/bin/env ts-node

import 'reflect-metadata';
import {MikroORM} from '@mikro-orm/core';

const [, , ...args] = process.argv;

if ( ! ['migration:create', 'migration:up'].includes(args[0])) {
    console.log(`missing or incorrect args, allowed ${['migration:create', 'migration:up']}`);
    process.exit(1);
}

if ( ! args[1]) {
    console.log('missing or incorrect args for path');
    process.exit(1);
}


(async () => {

    const {default: appOption} = await import(`${args[1]}`);

    const orm = await MikroORM.init(appOption);
    const migrator = orm.getMigrator();

    let response:string | {
        fileName: string;
        code: string;
        diff: string[];
    } | {
        path?: string;
        file: string;
    }[] = 'Nothing append...';

    switch (args[0]) {
        case 'migration:create': response = await migrator.createMigration(); break;
        case 'migration:up': response = await migrator.up();
    }

    console.log('response', response)


    // const response = await migrator.createMigration(); // creates file Migration20191019195930.ts

    // const pending = await migrator.getPendingMigrations();
    // console.log('pending', pending)

    // await migrator.up(); // runs migrations up to the latest

    // await migrator.up('name'); // runs only given migration, up
    // await migrator.up({ to: 'up-to-name' }); // runs migrations up to given version
    // await migrator.down(); // migrates one step down
    // await migrator.down('name'); // runs only given migration, down
    // await migrator.down({ to: 'down-to-name' }); // runs migrations down to given version
    // await migrator.down({ to: 0 }); // migrates down to the first version

    await orm.close(true);
})();