const numCPUs = require('os').cpus().length;

const exitHandler = () => {
  let dieChild = 0

  return () => {
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
  }
}

module.exports = {
  exitHandler
}