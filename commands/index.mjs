import { InteractionResponseType } from "discord-interactions";
import { DiscordRequest, getRandomEmoji } from "../utils.mjs";

export function commandHandler(req, res)
{
    // Interaction type and data
    const { member, data } = req.body;
    const { name } = data;
    const { user } = member;

    console.log(name);

    switch(name){
        case 'register': return async () =>{
            try {
                await registerUser(user);
                res.status(200);
            } catch (err) {
                res.status(500).body('Registration failed.');
            }
            
        }

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
                        {name: 'metric', type: 3, description: 'What metric to rank by?', required: true, choices: [
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