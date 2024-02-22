import { InteractionResponseType } from "discord-interactions";
import { Account } from "../models/account.mjs";
import { DiscordRequest } from "../utils.mjs";
import { Asset } from "../models/asset.mjs";
import { createAsset, distributeAsset } from "../algoclient.mjs";

export async function commandHandler(req, res)
{
    // Interaction type and data
    const { member, data } = req.body;
    const { id: messageId, options: topLevelOptions, resolved } = data;
    const { user } = member;

    const [{ name, options }] = topLevelOptions;

    switch(name) {
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

            // const account = Account.get(user);
            // account.send(otpions, resolved);
            // break;
            
            const account = await Account.get({ id: sendToUserId });
            return res.send({
                type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
                data: {
                    content: `You have sent ${account.getUsername()} ${amountToSend} ${assetId}.`
                }
            });
        case 'create-master':
            if (Account.has('master')) {
                const masterAccount = await Account.get({ id: 'master' })
                return res.send({
                    type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
                    data: {
                        content: `The master account has already been created. The address is ${ masterAccount.getAddress() }.`
                    }
                });
            }

            const masterAccount = await Account.get({ id: 'master' })
                return res.send({
                    type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
                    data: {
                        content: `The master account has been created. The address is ${ masterAccount.getAddress() }.`
                    }
                });
        case 'create-asset':
            const [{ value: assetName }, { value: amountToCreate }] = options;
            
            if (!Account.has('master')) {
                return res.send({
                    type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
                    data: {
                        content: `You must create and fund the master account before creating an asset.`
                    }
                });
            }

            const asset = await Asset.get({ asset_name: assetName, amount: amountToCreate })
            if (asset.getId()) {
                // if asset was created then update the commands of the server to include the new asset
                // as an option
                createCommands();
                return res.send({
                    type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
                    data: {
                        content: `${asset.getAmount()} tokens of ${asset.getAssetName()} have been created.`
                    }
                });
            }

            return res.send({
                type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
                data: {
                    content: `There was an issue creating ${ assetName }`
                }
            });
        case 'distribute-token':
            const [{ value: aId }, { value: amountToDistribute }] = options;
            const ass = await Asset.get({ id: aId })
            if (ass.getId()) {
                distributeAsset(ass, amountToDistribute)
                return res.send({
                    type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
                    data: {
                        content: `${amountToDistribute} tokens of ${asset.getAssetName()} have sent to each registered user.`
                    }
                });
            }

            return res.send({
                type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
                data: {
                    content: `There hasn't been created.`
                }
            });
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
        const assetOptions = [];

        Asset.forEach(asset => {
            assetOptions.push({ name: asset.getAssetName(), value: `${asset.getId()}` })
        });

        const commandOptions = [
            { name: 'register', type: 1, description: 'register' },

            { name: 'rankings', type: 1, description: 'Rankings', options: [
                {name: 'asset', type: 3, description: 'What asset to rank by?', required: true, choices: [
                    { name: 'Street Cred', value: 'street-cred' },
                ]}
            ]},

            { name: 'send', type: 1, description: 'street cred', options: [
                { name: 'asset', type: 3, description: "wat", required: true, choices: assetOptions},
                { name: 'to', type: 6, description: 'to', required: true },
                { name: 'amount', type: 4, description: 'amount', required: true, }
            ]},

            { name: 'create-master', type: 1, description: 'Create Master Account' },

            { name: 'create-asset', type: 1, description: 'What asset would you like to create?', options:[
                { name: 'asset-name', type: 4, description: 'Asset Name', required: true, },
                { name: 'amount', type: 4, description: 'Amount To Create', required: true, },
            ]},

            { name: 'distribute-token', type: 1, description: 'Create Master Account', options: [
                { name: 'asset', type: 3, description: "Which asset?", required: true, choices: assetOptions},
                { name: 'amount', type: 4, description: 'How many per user?', required: true, }
            ]},
        ];

        const commands = [{
            name: 'idwfd', type: 1, description: "An IDWFD bot.", options: commandOptions
        }];

        const responses = await Promise.all(commands.map(command => DiscordRequest(`applications/${process.env.APP_ID}/commands`, { method: 'POST', body: command })))
        console.log(await Promise.all(responses.map(res => res.json())));
    } catch (err) {
        console.error('Error installing commands: ', err);
    }
}