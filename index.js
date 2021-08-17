const {connect, StringCodec} = require('nats');
const PackageContract = require('./blockhain.js');

const package = new PackageContract(
  './blockchain/build/contracts/Package.json',
  process.env.CONTRACT_ADDRESS,
  process.env.NETWORK_ENDPOINT,
  {
    mnemonic: process.env.MNEMONIC,
    minterAccount: process.env.MINTER_ACCOUNT
  }
);

(async () => {
  const connectionName = `connection ${Math.ceil(Math.random() * 100 + 1)}`;
  const natsConnection = await connect({
    servers: process.env.NATS_SERVER,
    name: connectionName
  });
  const stringCoded = StringCodec();
  const subscription = natsConnection.subscribe(process.env.NATS_SUBJECT);
  const closeMessage = `GOOD BYE ${connectionName}`;
  console.log(`close message is: "${closeMessage}" - length: ${closeMessage.length}`);

  for await (const message of subscription) {
    const decodedMessage = stringCoded.decode(message.data);
    if (decodedMessage === `GOOD BYE ${connectionName}`) {
      console.log('draining connection...');
      await natsConnection.drain();
    } else if (decodedMessage.startsWith('MINT')) {
      const tokenUri = decodedMessage.split('MINT ')[1];
      console.log(`minting token ${tokenUri} ...`);
      package.safeMint(tokenUri).then((data) => {
        if (data.status === true) {
          console.log('minted');
        }
        console.log(JSON.stringify({data}, null, 2));
      })
    } else if (decodedMessage.startsWith('UPDATE')) {
      console.log(`updating token with ${decodedMessage} ...`);
      const attributes = decodedMessage.split('UPDATE ')[1].split(',');
      console.log(attributes);
      package.addUpdateTo(parseInt(attributes[0]), parseInt(attributes[1])).then((data) => {
        if (data.status === true) {
          console.log('updated');
        }
        console.log(JSON.stringify({data}, null, 2));
      })
    } else {
      console.log(`unknown message - [${subscription.protocol.options.name}][${subscription.getProcessed()}]: ${decodedMessage}`);
    }
  }

  console.log('connection closed');
})();
