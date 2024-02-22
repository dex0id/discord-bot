import algosdk from "algosdk";
import { Account } from "./models/account.mjs";

const cache = new Map();

const { ALGO_HOST, ALGO_PORT, ALGO_TOKEN, WALLET_1_SK} = process.env;
console.log(ALGO_HOST, ALGO_PORT, ALGO_TOKEN)
export const client = new algosdk.Algodv2(ALGO_TOKEN.trim(), ALGO_HOST.trim(), ALGO_PORT.trim());

export function createAccount()
{
    return algosdk.generateAccount()
}

export async function fundMaster()
{
    try {
        const globalAccount = algosdk.mnemonicToSecretKey(WALLET_1_SK);
        const masterAccount = await Account.get({ id: 'master' });
        const txn = algosdk.makePaymentTxnWithSuggestedParamsFromObject({
            from: globalAccount.addr,
            suggestedParams: await getParams(),
            to: masterAccount.getAddress(),
            amount: 100_000_000,
            note: new Uint8Array(Buffer.from('Funded from discord bot'))
        });
        const signedTxn = txn.signTxn(globalAccount.sk);
        await client.sendRawTransaction(signedTxn).do();
        const result = await algosdk.waitForConfirmation(
            client,
            txn.txID().toString(),
            3
        );
        console.log(result);
        console.log(`Transaction Information: ${result.txn}`);
        console.log(`Decoded Note: ${Buffer.from(result.txn.txn.note).toString()}`);
    } catch(err) {
        console.error(err);
    }
}

export async function fundAccount(account, amount = 1_000_000)
{
    try {
        const accountInfo = await client.accountInformation(account.getAddress()).do();
        if (accountInfo.amount < 10_000) {
            const masterAccount = await Account.get({ id: 'master' });
            const txn = algosdk.makePaymentTxnWithSuggestedParamsFromObject({
                from: await masterAccount.getAddress(),
                suggestedParams: await getParams(),
                to: account.getAddress(),
                amount,
                note: new Uint8Array(Buffer.from('Funded from discord bot'))
            });
            const signedTxn = txn.signTxn(masterAccount.getSecretKey());
            await client.sendRawTransaction(signedTxn).do();
            const result = await algosdk.waitForConfirmation(
                client,
                txn.txID().toString(),
                3
            );
            console.log(result);
            console.log(`Transaction Information: ${result.txn}`);
            console.log(`Decoded Note: ${Buffer.from(result.txn.txn.note).toString()}`);
        }
    } catch (err) { console.error(err) }
}

export async function getAccountInfo(account)
{
    if (!cache.has(account)) {
        const accountInfo = await client.accountInformation(account.getAddress()).do();
        cache.set(account, accountInfo);
    }

    return cache.get(account);
}

export async function getAccountAssetInfo(account, asset)
{
    const accountInfo = await getAccountInfo(account);
    const { assets = [] } = accountInfo;
    return assets.find(ass => ass['asset-id'] === asset.getId());
}

export async function requiresOptIn(asset, account)
{
    return !await getAccountAssetInfo(account, asset)
}

export async function assetOptIn(asset, account)
{
    return assetSend(asset, account, account, 0);
}

async function getParams()
{
    return await client.getTransactionParams().do()
}

export async function assetSend(asset, fromAccount, toAccount, amount = 0)
{
    const _requiresOptIn = await requiresOptIn(asset, toAccount);
    if(_requiresOptIn && fromAccount.getId() !== toAccount.getId()) {
        await assetOptIn(asset, toAccount);
    }

    try {
        let txn = algosdk.makeAssetTransferTxnWithSuggestedParams(
            fromAccount.getAddress(),
            toAccount.getAddress(),
            undefined,
            undefined,
            amount,
            undefined,
            asset.getId(),
            await getParams()
        );

        const tx = await client.sendRawTransaction(txn.signTxn(fromAccount.getSecretKey())).do();
        console.log("Transaction : " + tx.txId);
    } catch (err) {
        console.error(err);
    }
}

export async function getAssetInfo(asset)
{
    const assetInfo = await client.getAssetByID(asset.getId()).do();
    console.log(`Asset Name: ${assetInfo.params.name}`);
    console.log(`Asset Params: ${assetInfo.params}`);
}

export async function createAsset(unitName, assetName, assetURL, amount, decimals = 0)
{
    const account = await Account.get({ id: 'master' })
    const txn = algosdk.makeAssetCreateTxnWithSuggestedParamsFromObject({
        from: account.getAddress(),
        suggestedParams: await getParams(),
        defaultFrozen: false,
        unitName,
        assetName,
        manager: account.getAddress(),
        reserve: account.getAddress(),
        freeze: account.getAddress(),
        clawback: account.getAddress(),
        assetURL: assetURL,
        total: amount,
        decimals,
    });
    
    console.log(txn, account);
    const signedTxn = txn.signTxn(account.getSecretKey());
    await client.sendRawTransaction(signedTxn).do();
    const result = await algosdk.waitForConfirmation(
        client,
        txn.txID().toString(),
        3
    );
    return result;
    // const assetIndex = result[];
    // console.log(`Asset ID created: ${assetIndex}`);
}

export async function distributeAsset(asset)
{
    const masterAccount = await Account.get({ id: 'master' });
    Account.forEach(async (account) => {
        if (account.getId() === masterAccount.getId()) return;
        await assetSend(asset, masterAccount, account, 100)
    });
}

export async function gatherAsset(asset)
{
    const masterAccount = await Account.get({ id: 'master' });
    Account.forEach(async (account) => {
        if (account.getId() === masterAccount.getId()) return;
        clawbackAsset(asset, masterAccount, account)
    });
}

export async function fundAccounts(amount)
{
    const masterAccount = await Account.get({ id: 'master' });
    Account.forEach(async (account) => {
        if (account.getId() === masterAccount.getId()) return;
        fundAccount(account, amount);
    })
}

export async function clawbackAsset(asset, toAccount, fromAccount)
{
    try {
        const assetInfo = await getAccountAssetInfo(fromAccount, asset);
        console.log(assetInfo);
        const clawbackTxn = algosdk.makeAssetTransferTxnWithSuggestedParamsFromObject(
            {
                from: toAccount.getAddress(),
                to: toAccount.getAddress(),
                // revocationTarget is the account that is being clawed back from
                revocationTarget: fromAccount.getAddress(),
                suggestedParams: await getParams(),
                assetIndex: asset.getId(),
                amount: assetInfo.amount,
            }
        );
        
        const signedClawbackTxn = clawbackTxn.signTxn(toAccount.getSecretKey());
        await client.sendRawTransaction(signedClawbackTxn).do();
        const result = await algosdk.waitForConfirmation(
            client,
            clawbackTxn.txID().toString(),
            3
        );

        console.log(result);
        console.log(`Transaction Information: ${result.txn.txID}`);
    } catch (err) {
        console.error(err);
    }
}