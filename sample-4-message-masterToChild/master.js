const cluster = require('cluster');
const numCPUs = require('os').cpus().length;

module.exports = function(cb){
  let dieChild = 0
  console.log(`[INFO] Master ${process.pid} is running`);

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

  for (let i = 0; i < numCPUs; i++) {
    console.log(`[INFO] Forking process number ${i}...`);
    cluster.fork();
  }

  // send message
  for (const id in cluster.workers) {
    const _process = cluster.workers[id]
    _process.send({ spendTime: 3 });   
  }
}