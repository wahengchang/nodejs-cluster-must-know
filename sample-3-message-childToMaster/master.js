const cluster = require('cluster');
const numCPUs = require('os').cpus().length;

module.exports = function(cb){
  let dieChild = 0
  console.log(`[INFO] Master ${process.pid} is running`);

  for (let i = 0; i < numCPUs; i++) {
    console.log(`[INFO] Forking process number ${i}...`);
    cluster.fork();
  }


  for (const id in cluster.workers) {
    const _process = cluster.workers[id]
    const msgHandler = (id) => (msg) => {
      if (msg.spendTime) {
        console.log(`[INFO] messageHandler child[${id}] spend ${msg.spendTime} s`)
      }
    }
    _process.on('message', msgHandler(id));
  }

  cluster.on('exit', (worker, code, signal) => {
    dieChild +=1 
    if (signal) {
      console.log(`[INFO] master: worker was killed by signal: ${signal}`);
    } else if (code !== 0) {
      console.log(`[INFO] master: worker exited with error code: ${code}`);
    } else {
      console.log('[INFO] master: worker success!');
    }

    if(dieChild >= numCPUs){
      console.log('[INFO] master: all child process is die!');
      cb()
    }
  });
}