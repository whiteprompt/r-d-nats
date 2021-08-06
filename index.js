const {connect, StringCodec} = require('nats');
const Web3 = require('web3');
const {abi} = require('./Feature.json');
// const websocketProvider = new Web3.providers.WebsocketProvider('wss://rinkeby.infura.io/ws/v3/45261a9a09fa4ce683bb25ae00b8c079');
const websocketProvider = new Web3.providers.WebsocketProvider('ws://127.0.0.1:9545/');
const web3 = new Web3(websocketProvider);

// const contractInstance = new web3.eth.Contract(abi, '0x608fa86C629283Bc3500d8BaC1842Fb315862bC9');
const contractAddress = '0x8a080f066f60072aEAFDDC310EeDD3d09980b315';
const contractInstance = new web3.eth.Contract(abi, contractAddress);

async function getEvents(fromBlock = 'latest', toBlock = 'latest', opts = {}) {
  const options = {fromBlock, toBlock, ...opts};
  return await contractInstance.getPastEvents(
    'Burned',
    options
  );
}

const subscription = web3.eth.subscribe(
  'logs',
  {
    address: contractAddress,
    from: 0,
  },
  (error, result) => {
    if (error) return;
    // do something with the data
    console.log(result);
  }
);

async function poll(fn, time) {
  await fn();
  setTimeout(fn, time);
}

async function watch(fn = async () => {}, millis=10000) {
  poll(fn, millis);
}

(async () => {
  // await watch(getEvents);
  const name = `connection ${Math.ceil(Math.random() * 100 + 1)}`;
  const natsConnection = await connect({
    servers: process.env.NATS_SERVER,
    name
  });
  const stringCoded = StringCodec();
  const subscription = natsConnection.subscribe(process.env.NATS_SUBJECT);
  console.log('subscription started');

  for await (const message of subscription) {
    const decodedMessage = stringCoded.decode(message.data);
    console.log(`[${subscription.protocol.options.name}][${subscription.getProcessed()}]: ${decodedMessage}`);
    if (decodedMessage === `GOOD BYE ${name}`) {
      await natsConnection.drain();
    }
  }

  console.log("subscription closed");
})();
