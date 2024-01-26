//specify imports

import {
    AeSdk, CompilerHttp, Node, MemoryAccount, Tag,
  } from '@aeternity/aepp-sdk';

//constants

const PAYER_ACCOUNT_SECRET_KEY = '9ebd7beda0c79af72a42ece3821a56eff16359b6df376cf049aee995565f022f840c974b97164776454ba119d84edc4d6058a8dec92b6edc578ab2d30b4c4200';
const NODE_URL = 'https://testnet.aeternity.io';
const COMPILER_URL = 'https://v7.compiler.aepps.com';
const CONTRACT_ADDRESS = 'ct_iy86kak8GGt4U5VjDFNQf1a9qjbyxKpmGVNe3UuKwnmcM6LW8';
const CONTRACT_SOURCE_CODE = `
@compiler >= 6

contract PayingForTxExample =

    record state = { last_caller: option(address) }

    entrypoint init() =
        { last_caller = None }

    stateful entrypoint set_last_caller() =
        put(state{last_caller = Some(Call.caller)})

    entrypoint get_last_caller() : option(address) =
        state.last_caller
`;

//object instances

const payerAccount = new MemoryAccount(PAYER_ACCOUNT_SECRET_KEY);
const newUserAccount = MemoryAccount.generate();
const node = new Node(NODE_URL);
const aeSdk = new AeSdk({
  nodes: [{ name: 'testnet', instance: node }],
  accounts: [payerAccount, newUserAccount],
  onCompiler: new CompilerHttp(COMPILER_URL),
});

// Create and sign ContractCallTx on behalf of new user

const contract = await aeSdk.initializeContract(
    { sourceCode: CONTRACT_SOURCE_CODE, address: CONTRACT_ADDRESS },
  );
  const calldata = contract._calldata.encode('PayingForTxExample', 'set_last_caller', []);
  const contractCallTx = await aeSdk.buildTx({
    tag: Tag.ContractCallTx,
    callerId: newUserAccount.address,
    contractId: CONTRACT_ADDRESS,
    amount: 0,
    gasLimit: 1000000,
    gasPrice: 1500000000,
    callData: calldata,
  });
  const signedContractCallTx = await aeSdk.signTransaction(
    contractCallTx,
    { onAccount: newUserAccount, innerTx: true },
  );

// Create, sign & broadcast the PayingForTx as payer

const payForTx = await aeSdk.payForTransaction(signedContractCallTx, { onAccount: payerAccount });
console.log(payForTx);

// Check that last caller is the new user

const dryRunTx = await contract.get_last_caller();
console.log(`New user: ${newUserAccount.address}`);
console.log('Last caller:', dryRunTx.decodedResult);