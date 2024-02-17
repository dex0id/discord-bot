import { JSONFilePreset } from 'lowdb/node'

const defaultData = {
    users: {}
}
export const db = await JSONFilePreset('db.json', defaultData)