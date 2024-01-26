//specify imports

import {
    AeSdk, CompilerHttp, Node, MemoryAccount,
  } from '@aeternity/aepp-sdk';

//constants

const CONTRACT_SOURCE_CODE = `
contract Multiplier =
  record state = { factor: int }
  entrypoint init(f : int) : state = { factor = f }
  stateful entrypoint setFactor(f : int): int =
    put(state{ factor = f })
    f * 10
  entrypoint multiplyBy(x : int) = x * state.factor
`;
const ACCOUNT_SECRET_KEY = '9ebd7beda0c79af72a42ece3821a56eff16359b6df376cf049aee995565f022f840c974b97164776454ba119d84edc4d6058a8dec92b6edc578ab2d30b4c4200';
const NODE_URL = 'https://testnet.aeternity.io';
const COMPILER_URL = 'https://v7.compiler.aepps.com';

//object instances

const account = new MemoryAccount(ACCOUNT_SECRET_KEY);
const node = new Node(NODE_URL);
const aeSdk = new AeSdk({
  nodes: [{ name: 'testnet', instance: node }],
  accounts: [account],
  onCompiler: new CompilerHttp(COMPILER_URL),
});

// contract instance

console.log(CONTRACT_SOURCE_CODE);
const contract = await aeSdk.initializeContract({ sourceCode: CONTRACT_SOURCE_CODE });

// compile contract

const bytecode = await contract.$compile();
console.log(`Obtained bytecode ${bytecode}`);

// deploy contract

const deployInfo = await contract.$deploy([5]);
console.log(`Contract deployed at ${deployInfo.address}`);



await contract.setFactor(6);

let call = await contract.setFactor(7, { callStatic: true });

console.log(`setFactor execution result: ${call.decodedResult}`);

call = await contract.multiplyBy(8);
console.log(`multiplyBy execution result: ${call.decodedResult}`);