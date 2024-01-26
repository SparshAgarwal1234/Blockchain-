//specify imports

import {
    AeSdk, Node, MemoryAccount, Tag,
  } from '@aeternity/aepp-sdk';

//constants

const PAYER_ACCOUNT_SECRET_KEY = '9ebd7beda0c79af72a42ece3821a56eff16359b6df376cf049aee995565f022f840c974b97164776454ba119d84edc4d6058a8dec92b6edc578ab2d30b4c4200';
const NODE_URL = 'https://testnet.aeternity.io';
const AMOUNT = 1;

//object instances

const payerAccount = new MemoryAccount(PAYER_ACCOUNT_SECRET_KEY);
const newUserAccount = MemoryAccount.generate();
const node = new Node(NODE_URL);
const aeSdk = new AeSdk({
  nodes: [{ name: 'testnet', instance: node }],
  accounts: [payerAccount, newUserAccount],
});

// Send 1aetto to new user

const spendTxResult = await aeSdk.spend(
    AMOUNT,
    newUserAccount.address,
    { onAccount: payerAccount },
  );
  console.log(spendTxResult);

// Check balance before

const newUserBalanceBefore = await aeSdk.getBalance(newUserAccount.address);
console.log(`new user balance (before): ${newUserBalanceBefore}`);

// Create and sign SpendTx on behalf of new user

const spendTx = await aeSdk.buildTx({
    tag: Tag.SpendTx,
    senderId: newUserAccount.address,
    recipientId: payerAccount.address,
    amount: AMOUNT,
  });
  const signedSpendTx = await aeSdk.signTransaction(
    spendTx,
    { onAccount: newUserAccount, innerTx: true },
  );

// Create, sign and broadcast the PayingForTx as payer

const payForTx = await aeSdk.payForTransaction(signedSpendTx, { onAccount: payerAccount });
console.log(payForTx);

// Check balance after

const newUserBalanceAfter = await aeSdk.getBalance(newUserAccount.address);
console.log(`new user balance (after): ${newUserBalanceAfter}`);