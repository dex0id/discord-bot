import { db } from "../db.mjs";
import { assetSend, createAccount, fundAccount } from "../algoclient.mjs";

const AccountData = {
    avatar: '617a0c092566efcc95b11e8987556119',
    avatar_decoration_data: null,
    discriminator: '0',
    global_name: 'dex0id',
    id: '267098502750928896',
    public_flags: 0,
    username: 'dex0id'
};
export class Account {
    data;

    constructor(data)
    {
        if (Array.isArray(data.account_sk)) {
            data.account_sk = new Uint8Array(data.account_sk);
        } else if (data.account_sk && typeof data.account_sk === 'object') {
            data.account_sk = new Uint8Array(Object.values(data.account_sk));
        }

        this.data = data;
    }

    getId()
    {
        return this.data.id;
    }

    getUsername()
    {
        return this.data.username
    }

    getAddress()
    {
        return this.data.account_addr
    }

    getSecretKey()
    {
        return this.data.account_sk
    }

    send(asset, to, amount)
    {
        assetSend(asset, this, to, amount)
    }

    static has(id)
    {
        const { users } = db.data;
        return users.hasOwnProperty(id);
    }

    static async get(data)
    {
        const { users } = db.data;
        const { id } = data;

        // console.log(users);

        if (users.hasOwnProperty(id)) {
            const account = new Account(users[id]);
            // console.log(`loading user ${account.getUsername()}`, account)
            return account;
        }

        const algoAccount = await createAccount();
        // console.log(algoAccount)
        const account = new Account(Object.assign({}, data, {
            account_addr: algoAccount.addr,
            account_sk: algoAccount.sk,
            created_at: Date.now(),
            updated_at: Date.now(),
        }));

        console.log(account.data);

        users[account.getId()] = account.data;
        db.data.users = users;
        console.log(`creating user ${account.getUsername()}`)
        await db.write();
        console.log(`created user ${account.getUsername()}`)

        return account;
    }

    static async forEach(callback)
    {
        const { users } = db.data;
        return Object.values(users).forEach(user => callback(new Account(user)));
    }
}
