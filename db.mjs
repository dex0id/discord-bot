import { JSONFilePreset } from 'lowdb/node'

const defaultData = {
    users: {},
    assets: {},
}
export const db = await JSONFilePreset('db.json', defaultData)

db.data.users = db.data.users || defaultData.users;
db.data.assets = db.data.assets || defaultData.assets;