module.exports = function(){

  // recieve message
  process.on('message', function(msg) {
    console.log(`[INFO] messageHandler child[${process.pid}] spend ${msg.spendTime} s`)

    if(msg.spendTime) {
      setTimeout(() => {
        console.log(`[INFO] Worker ${process.pid} finished`);
        process.exit()
      }, msg.spendTime * 1000);
    }
  });
}