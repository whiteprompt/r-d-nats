const {connect, StringCodec} = require("nats");


(async () => {
  const name = `connection ${Math.ceil(Math.random()*100+1)}`;
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
