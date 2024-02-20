import 'dotenv/config';
import { Account } from "./models/account.mjs";
import { assetOptIn, assetSend, createAsset, distributeAsset, fundMaster, gatherAsset, requiresOptIn } from './algoclient.mjs';
import { Asset } from './models/asset.mjs';

const account1 = await Account.get({
    avatar: '617a0c092566efcc95b11e8987556119',
    avatar_decoration_data: null,
    discriminator: '0',
    global_name: 'dex0id',
    id: '267098502750928897',
    public_flags: 0,
    username: 'dex0id'
});

const account2 = await Account.get({
    avatar: '617a0c092566efcc95b11e8987556120',
    avatar_decoration_data: null,
    discriminator: '0',
    global_name: 'anotheruser',
    id: '267098502750928898',
    public_flags: 0,
    username: 'anotheruser'
})

// const masterAccount = Account.get({ id: 'master' })
// fundMaster();

const asset = await Asset.get({ unit_name: 'STCD', asset_name: 'Street Cred', url: '', amount: 10_000 });

// console.log(asset);

// const asset = await Asset.get({ id: 144853500 })
// assetSend(asset, account1, account2, 10);

// console.log(asset.getId());

// requiresOptIn(asset, account1);
// assetOptIn(asset, account1);
// requiresOptIn(asset, account1);
// distributeAsset(asset);
// gatherAsset(asset)

// account1.send(asset, account2, 10);