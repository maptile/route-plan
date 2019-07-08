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

    const interfaces = {
        all: () => {
            return all(dbName);
        }
    };

    if(dbName == 'route'){
        interfaces.find = function(id1, id2){
            let id = `${id1}:${id2}`;
            const result = find(dbName, id);

            if(result){
                return result;
            }

            id = `${id2}:${id1}`;

            return find(dbName, id);
        };

        interfaces.insert = function(id1, id2, data){
            interfaces.find(id1, id2);
        };

        interfaces.update = function(id1, id2, data){
            
        };

        interfaces.delete = function(id1, id2){
            
        };
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
