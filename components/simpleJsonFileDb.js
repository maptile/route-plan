const fs = require('fs');
const path = require('path');

const _ = require('lodash');
const env = require('nodejslib/env');

const dbFilePath = path.join(env.appRoot, 'sampledata/db.json');

let db = {};

function loadFile(){
    logger.trace(`Loading db file to memory`);
    try{
        fs.accessSync(dbFilePath);
    } catch(e){
        fs.writeFileSync(dbFilePath, '{}', {encoding: 'utf-8', flag: 'w'});
    }

    try{
        db = JSON.parse(fs.readFileSync(dbFilePath), {
            encoding: 'utf-8'
        });
    } catch(e){
        logger.error('ERROR. Load file to simple DB error', e);
        db = {};
    }
}

function save(){
    logger.trace(`Saving db to file`);
    try{
        const data = JSON.stringify(db, null, 2);
        fs.writeFileSync(dbFilePath, data, {encoding: 'utf-8'});
        return true;
    } catch(e){
        logger.error('ERROR. Save file to simple DB error', e);
    }

    return false;
}

function upsert(dbName, data){
    logger.trace(`Upsert data in ${dbName}`);

    if(!data){
        throw new Error('Invalid argument: data is empty');
    }

    if(Array.isArray(data)){
        for(const d of data){
            if(!d._id){
                throw new Error('Invalid argument: data must have "_id" property');
            }

            db[dbName][d._id] = d;
        }
    } else {
        if(!data._id){
            throw new Error('Invalid argument: data must have "_id" property');
        }
        db[dbName][data._id] = data;
    }
}

function all(dbName){
    return _.values(db[dbName]);
}

function find(dbName, id){
    logger.trace(`Finding ${id} in ${dbName}`);

    if(!id){
        throw new Error('argument "id" is required');
    }

    if(!Array.isArray(id)){
        return db[dbName][id];
    }

    return id.map((i) => {
        return db[dbName][i];
    });
}

function del(dbName, id){
    logger.trace(`Deleting ${id} in ${dbName}`);
    if(!id){
        throw new Error('argument "id" is required');
    }
    delete db[dbName][id];
    save();
}

loadFile();

function use(dbName){
    if(!db[dbName]){
        db[dbName] = {};
    }

    const interfaces = {
        all: () => {
            return all(dbName);
        }
    };

    if(dbName == 'route'){
        const getCombinedId = function(id1, id2){
            if(id1 < id2){
                return `${id1}:${id2}`;
            }

            return `${id2}:${id1}`;
        };

        interfaces.find = function(id1, id2){
            return find(dbName, getCombinedId(id1, id2));
        };

        interfaces.insert = function(id1, id2, data){
            data._id = getCombinedId(id1, id2);
            return upsert(dbName, data);
        };

        interfaces.update = function(data){
            return upsert(dbName, data);
        };

        interfaces.delete = function(id1, id2){
            return del(dbName, getCombinedId(id1, id2));
        };

        return interfaces;
    } else {
        return {
            find: (id) => {
                return find(dbName, id);
            },
            insert: (data) => {
                return upsert(dbName, data);
            },
            update: (data) => {
                return upsert(dbName, data);
            },
            delete: (id) => {
                return del(dbName, id);
            }
        };
    }
}

module.exports = {
    use,
    save
};
