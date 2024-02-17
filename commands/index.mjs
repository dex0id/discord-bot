import { DiscordRequest } from "../utils.mjs";
import { db } from "../db.mjs";

const AccountData = {
    avatar: '617a0c092566efcc95b11e8987556119',
    avatar_decoration_data: null,
    discriminator: '0',
    global_name: 'dex0id',
    id: '267098502750928896',
    public_flags: 0,
    username: 'dex0id'
};
class Account {
    data;

    constructor(data)
    {
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

    static async get(data)
    {
        const { users } = db.data;

        console.log(users);

        if (users.hasOwnProperty(id)) {
            console.log(`loading user ${account.getUsername()}`)
            return new Account(users[id]);
        }

        const account = new Account(Object.assign({}, data, {
            created_at: Date.now(),
            updated_at: Date.now(),
        }));

        users[user.id] = account.data;
        
        console.log(`creating user ${account.getUsername()}`)
        await db.write();
        console.log(`created user ${account.getUsername()}`)
        return account;
    }
}

export async function commandHandler(req, res)
{
    // Interaction type and data
    const { member, data } = req.body;
    const { options: topLevelOptions, resolved } = data;
    const { user } = member;

    console.log(user, data);

    const { name, options } = topLevelOptions[0];

    console.log(name, options);

    switch(name) {
        case 'rankings':
            console.log('rankings', options, resolved)
            break;
        case 'send':
            console.log('send', options, resolved)
            break;
        case 'register':
            try {
                console.log('registering')
                const account = await Account.get(user);
                res.status(200).send(`${account.getUsername()} has been registered.`);
            } catch (err) {
                res.status(500).send('Registration failed.');
            }
            break;
        default: return res.status(404);
    }
}

export async function createCommands()
{
    // try {
    //     const commandsToDelete = ['1207875716780269608', '1207875868173537280', '1207860638135754842', '1207851770056024094'];
    //     const deleteResponses = await Promise.all(commandsToDelete.map(commandId => DiscordRequest(`applications/${process.env.APP_ID}/commands/${commandId}`, { method: 'DELETE' })))
    //     console.log(await Promise.all(deleteResponses.map(res => res.json())));
    // } catch(err) {
    //     console.error(err);
    // }

    try {
        const commands = [
            // User commands can't have options
            // { name: 'Send Street Cred', type: 2, options: [{
            //     name: "amount", type: 4, description: 'amount', required: true
            // }]},
            {
                name: 'idwfd', type: 1, description: "An IDWFD bot.", options: [
                    { name: 'register', type: 1, description: 'register' },

                    { name: 'rankings', type: 1, description: 'Rankings', options: [
                        {name: 'asset', type: 3, description: 'What asset to rank by?', required: true, choices: [
                            { name: 'Street Cred', value: 'street-cred' },
                        ]}
                    ]},

                    { name: 'send', type: 1, description: 'street cred', options: [
                        { name: 'asset', type: 3, description: "wat", required: true, choices: [
                            { name: 'Street Cred', value: 'street-cred' },
                        ]},
                        { name: 'to', type: 6, description: 'to', required: true },
                        { name: 'amount', type: 4, description: 'amount', required: true, }
                    ]}
                ]
            }
        ];

        const responses = await Promise.all(commands.map(command => DiscordRequest(`applications/${process.env.APP_ID}/commands`, { method: 'POST', body: command })))
        console.log(await Promise.all(responses.map(res => res.json())));
    } catch (err) {
        console.error('Error installing commands: ', err);
    }
}