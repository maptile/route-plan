const fs = require('fs');
const path = require('path');

const _ = require('lodash');
const env = require('nodejslib/env');

const dbFilePath = path.join(env.appRoot, 'sampledata/db.json');

let db = {};

function loadFile(){
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
    if(!data || !data.id){
        throw new Error('data must have "id" property');
    }
    db[dbName][data.id] = data;
    save();
}

function all(dbName){
    return _.values(db[dbName]);
}

function find(dbName, id){
    if(!id){
        throw new Error('argument "id" is required');
    }

    return db[dbName][id];
}

function del(dbName, id){
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

    return {
        all: () => {
            return all(dbName);
        },
        find: (id) => {
            return find(dbName, id);
        },
        upsert: (data) => {
            return upsert(dbName, data);
        },
        delete: (id) => {
            return del(dbName, id);
        },
        save
    };
}

module.exports = {
    use
};
