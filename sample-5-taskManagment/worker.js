module.exports = function(){

  // recieve message
  process.on('message', function(msg) {
    const {taskInfo} = msg
    const {taskId,spendTime } = taskInfo

    console.log(`[INFO] Worker ${process.pid} recieve message: `, msg);

    if(spendTime) {
      setTimeout(() => {
        console.log(`[INFO] worker[${process.pid}] spend ${spendTime} s`)
        process.send(msg);
      }, spendTime * 1000);
    }
  });
}