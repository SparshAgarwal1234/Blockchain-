//specify imports

import { AeSdk, Node, MemoryAccount } from '@aeternity/aepp-sdk';

//constants

const ACCOUNT_KEYPAIR = {
  publicKey: 'ak_21A27UVVt3hDkBE5J7rhhqnH5YNb4Y1dqo4PnSybrH85pnWo7E',
  secretKey: '9ebd7beda0c79af72a42ece3821a56eff16359b6df376cf049aee995565f022f840c974b97164776454ba119d84edc4d6058a8dec92b6edc578ab2d30b4c4200',
};
const NODE_URL = 'https://testnet.aeternity.io';
const [amount = 1, recipient = ACCOUNT_KEYPAIR.publicKey] = process.argv.slice(2);

//object instances

const account = new MemoryAccount(ACCOUNT_KEYPAIR.secretKey);
const node = new Node(NODE_URL);
const aeSdk = new AeSdk({
  nodes: [{ name: 'testnet', instance: node }],
  accounts: [account],
});

// AE balance of recipient (before transfer)

const balanceBefore = await aeSdk.getBalance(recipient);
console.log(`Balance of ${recipient} (before): ${balanceBefore} aettos`);

//Transfer AE

const tx = await aeSdk.spend(amount, recipient);
console.log('Transaction mined', tx);

//AE balance of recipient (after transfer)

const balanceAfter = await aeSdk.getBalance(recipient);
console.log(`Balance of ${recipient} (after): ${balanceAfter} aettos`);