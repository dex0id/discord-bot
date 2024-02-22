import { createAsset } from "../algoclient.mjs";
import { db } from "../db.mjs";

export class Asset {
    data;
    constructor(data)    {
        this.data = data;
    }

    getId()
    {
        return this.data.id;
    }

    getUnitName()
    {
        return this.data.unit_name;
    }

    getAssetName()
    {
        return this.data.asset_name
    }

    static has(id)
    {
        const { assets } = db.data;
        return assets.hasOwnProperty(id);
    }

    static async get(data)
    {
        const { assets } = db.data;
        const { id } = data;

        if (assets.hasOwnProperty(id)) {
            const asset = new Asset(assets[id]);
            console.log(`loading asset ${asset.getUnitName()}`, asset)
            return asset;
        }

        const algoAsset = await createAsset(data.asset_name, data.amount)
        console.log(algoAsset);
        const asset = new Asset(Object.assign({}, data, {
            id: algoAsset['asset-index'],
            created_at: Date.now(),
            updated_at: Date.now(),
        }));

        console.log(asset);

        assets[asset.getId()] = asset.data;
        db.data.assets = assets;
        console.log(`creating asset ${asset.getAssetName()}`)
        await db.write();
        console.log(`created asset ${asset.getAssetName()}`)
        return asset;
    }

    static async forEach(callback)
    {
        const { assets } = db.data;
        return Object.values(assets).forEach(asset => callback(new Asset(asset)));
    }
}