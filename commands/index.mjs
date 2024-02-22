import { InteractionResponseType } from "discord-interactions";
import { Account } from "../models/account.mjs";
import { DiscordRequest } from "../utils.mjs";

export async function commandHandler(req, res)
{
    // Interaction type and data
    const { member, data } = req.body;
    const { id: messageId, options: topLevelOptions, resolved } = data;
    const { user } = member;

    const [{ name, options }] = topLevelOptions;

    switch(name) {
        case 'rankings':
            const [{ name: optionName, value: optionValue }] = options;
            return res.send({
                type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
                data: {
                    content: `The rankings for ${optionName} ${optionValue} isn't available yet.`
                }
            });
        case 'send':
            const [{ value: assetId }, { value: sendToUserId }, { value: amountToSend }] = options;
            console.log('send', options, resolved)
            if (!Account.has(sendToUserId)) {
                return res.send({
                    type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
                    data: {
                        content: `This user hasn't registered yet.`
                    }
                });
            }
            
            const account = await Account.get({ id: sendToUserId });
            return res.send({
                type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
                data: {
                    content: `You have sent ${account.getUsername()} ${amountToSend} ${assetId}.`
                }
            });

            // const account = Account.get(user);
            // account.send(otpions, resolved);
            // break;
        case 'register':
            try {
                if (Account.has(user.id)) {
                    const account = await Account.get(user);
                    return res.send({
                        type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
                        data: {
                            content: `${account.getUsername()} has already been registered.`
                        }
                    });
                } else {
                    const account = await Account.get(user);
                    return res.send({
                        type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
                        data: {
                            content: `${account.getUsername()} has been registered.`
                        }
                    });
                }
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
                            { name: 'Street Cred', value: '144853500' },
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