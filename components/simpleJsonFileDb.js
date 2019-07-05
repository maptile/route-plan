const fs = require('fs');
const _ = require('lodash');
const dbFilePath = '../simpledata/db.json';

const hashedData = {};

function loadFile(){
    let content;
    try{
        content = JSON.parse(fs.readFileSync(dbFilePath), {
            encoding: 'utf-8'
        });
    } catch(e){
        content = [];
    }

    content.forEach((doc) => {
        hashedData[doc.id] = doc;
    });
}

function save(){
    try{
        const data = JSON.stringify(_.values(hashedData));
        fs.writeFileSync(dbFilePath, data, {encoding: 'utf-8'});
        return true;
    } catch(e){
        console.log('ERROR. Save file to simple DB error', e);
    }

    return false;
}

function upsert(data){
    hashedData[data.id] = data;
    save();
}

function find(id){
    if(id){
        return hashedData[id];
    } else {
        return _.values(hashedData);
    }
}

function del(id){
    delete hashedData[id];
    save();
}

loadFile();

module.exports = {
    find,
    upsert,
    delete: del
};
