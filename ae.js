//Specify imports

const {
  AeSdk,
  MemoryAccount,
  Node,
  CompilerHttp,
  AE_AMOUNT_FORMATS,
  generateKeyPair
} = require('@aeternity/aepp-sdk')

// Create a Keypair for sender

const keypair = generateKeyPair()
console.log(`Secret key: ${keypair.secretKey}`)
console.log(`Public key: ${keypair.publicKey}`)

//Interaction with the æternity blockchain

const NODE_URL = 'https://testnet.aeternity.io'
const COMPILER_URL = 'https://v7.compiler.aepps.com' // required for contract interactions
// replace <SENDER_SECRET_KEY> with the generated secretKey from step 2
const senderAccount = new MemoryAccount('<SENDER_SECRET_KEY>');

(async function () {
  const node = new Node(NODE_URL)
  const aeSdk = new AeSdk({
    onCompiler: new CompilerHttp(COMPILER_URL),
    nodes: [{ name: 'testnet', instance: node }],
    accounts: [senderAccount],
  })

  // spend one AE
  await aeSdk.spend(1, '<RECIPIENT_PUBLIC_KEY>', {
    // replace <RECIPIENT_PUBLIC_KEY>, Ideally you use public key from Superhero Wallet you have created before
    denomination: AE_AMOUNT_FORMATS.AE
  })
})()