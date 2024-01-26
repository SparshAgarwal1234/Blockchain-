//  Create SDK instance and generate an account

import {
    AeSdk, Node, MemoryAccount, AccountGeneralized, CompilerHttp, MIN_GAS_PRICE,
  } from '@aeternity/aepp-sdk';
  
  const aeSdk = new AeSdk({
    nodes: [{ name: 'testnet', instance: new Node('https://testnet.aeternity.io') }],
    accounts: [MemoryAccount.generate()],
    onCompiler: new CompilerHttp('https://v7.compiler.aepps.com'),
  });
  const { address } = aeSdk;

// Top up generated account using faucet on testnet

const { status } = await fetch(`https://faucet.aepps.com/account/${address}`, { method: 'POST' });
console.assert(status === 200, 'Invalid faucet response code', status);

// Create a Generalized Account

console.log('Account info before making generalized', await aeSdk.getAccount(address));
const sourceCode = `contract BlindAuth =
  stateful entrypoint authorize(shouldAuthorize: bool, _: int) : bool =
    switch(Auth.tx_hash)
      None    => abort("Not in Auth context")
      Some(_) => shouldAuthorize
`;

const { gaContractId } = await aeSdk.createGeneralizedAccount('authorize', [], { sourceCode });
console.log('Attached contract address', gaContractId);

console.log(await aeSdk.getAccount(address));


//  Switch SDK instance to AccountGeneralized

aeSdk.removeAccount(address);
aeSdk.addAccount(new AccountGeneralized(address), { select: true });

// Transfer AE

console.log('balance before', await aeSdk.getBalance(address));
const authData = { sourceCode, args: [true, 42] };
const recipient = 'ak_21A27UVVt3hDkBE5J7rhhqnH5YNb4Y1dqo4PnSybrH85pnWo7E';
await aeSdk.spend(1e18, recipient, { authData });
console.log('balance after', await aeSdk.getBalance(address));

await aeSdk.spend(2e18, recipient, {
    async authData(transaction) {
      const fee = 10n ** 14n;
      const gasPrice = MIN_GAS_PRICE;
      const authTxHash = await aeSdk.buildAuthTxHash(transaction, { fee, gasPrice });
      console.log('Auth.tx_hash', authTxHash.toString('hex'));
      authData.args[1] += 1;
      Object.assign(authData, { fee, gasPrice });
      return authData;
    },
  });
  console.log('balance after 2nd spend', await aeSdk.getBalance(address));

