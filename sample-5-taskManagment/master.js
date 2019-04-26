const cluster = require('cluster');
const numCPUs = require('os').cpus().length;
const TaskManager = require('./utils/TaskManager')

function random(min = 1, max=3) {
  return Math.random() * (max - min) + min;
}

module.exports = function(cb){
  let dieChild = 0
  const freeChild = []
  const busyChild = []
  const taskPool = [
    {spendTime: random()},
    {spendTime: random()},
    {spendTime: random()},
    {spendTime: random()},
    {spendTime: random()},
  ]
  const tm = new TaskManager(taskPool)
  console.log(`[INFO] Master ${process.pid} is running`);

  for (let i = 0; i < numCPUs; i++) {
    console.log(`[INFO] Forking process number ${i}...`);
    cluster.fork();
  }

  // init worker
  for (const id in cluster.workers) {
    freeChild.push(cluster.workers[id])
  }

  const assignTask = (freeChild, busyChild, tm) => {
    // init task
    console.log(`[INFO] assignTask(), there are ${freeChild.length} freeChild`)
    console.log(`[INFO] assignTask(), there are ${busyChild.length} busyChild`)
    for (const _process of freeChild) {
      const task = tm.fetchTask()
      if(!task) {
        return 
      }
      _process.send(task)
      freeChild.removeElement({id: _process.id})
      busyChild.push(_process)
    }
  }

  assignTask(freeChild, busyChild, tm)
  // recieve done message
  for (const id in cluster.workers) {
    const msgHandler = (processId) => (msg) => {
      const {id: taskId, taskInfo} = msg
      const {spendTime } = taskInfo
      const _process = cluster.workers[processId]

      if (taskId && spendTime) {
        tm.finishTask(taskId)
        freeChild.push(_process)

        busyChild.removeElement({id: processId})
        
        if(tm.count() <=0) {
          console.log('[INFO] -=-=-=-= all task done -=-=-=-=')
          return process.exit()
        }
        console.log(`[INFO] messageHandler child[${processId}] spend ${spendTime} s`)
        assignTask(freeChild, busyChild, tm)
      }
    }
    cluster.workers[id].on('message', msgHandler(id));
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