const {connect, StringCodec} = require("nats");


(async () => {
  const natsConnection = await connect({servers: process.env.NATS_SERVER});
  const stringCoded = StringCodec();
  const subscription = natsConnection.subscribe(process.env.NATS_SUBJECT);
  console.log('subscription started');
  console.log(subscription);
  for await (const message of subscription) {
    const decodedMessage = stringCoded.decode(message.data);
    console.log(`[${subscription.getProcessed()}]: ${decodedMessage}`);

    if (decodedMessage === `GOOD BYE ${subscription.sid}`) {
      await natsConnection.drain();
    }
  }
  console.log("subscription closed");
})();
