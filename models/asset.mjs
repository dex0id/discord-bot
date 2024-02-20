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

    static async get(data)
    {
        const { assets } = db.data;
        const { id, unit_name } = data;

        const assetData = Object.values(assets).find((val) => val.unit_name === unit_name);

        if (assetData) {
            const asset = new Asset(assetData);
            console.log(`loading asset ${asset.getUnitName()}`, asset)
            return asset;
        }

        const algoAsset = await createAsset(data.unit_name, data.asset_name, data.asset_url, data.amount)
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
}