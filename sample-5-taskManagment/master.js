const cluster = require('cluster');
const numCPUs = require('os').cpus().length;
const TaskManager = require('./utils/TaskManager')
const {exitHandler} = require('./utils/clusterHelper')

console.log(`[INFO] Master ${process.pid} is running`);

const forking = () => {
  for (let i = 0; i < numCPUs; i++) {
    console.log(`[INFO] Forking process number ${i}...`);
    cluster.fork();
  }
}

class BaseMaster {
  constructor(taskPool = [], cb){
    this.taskPool = taskPool
    this.tm = new TaskManager(taskPool)
    this.cb = cb
    this.freeChild = []
    this.busyChild = []
  }
  initWorker() {
    // init worker
    for (const id in cluster.workers) {
      this.freeChild.push(cluster.workers[id])
    }
  }
  assignTask() {
    const {freeChild, busyChild, tm} = this
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

  removeDoneTask(msg, processId) {
    const {id: taskId} = msg
    const {freeChild, busyChild, tm} = this
    const _process = cluster.workers[processId]
    tm.finishTask(taskId)
    freeChild.push(_process)
    busyChild.removeElement({id: processId})
    
    if(tm.count() <=0) {
      console.log('[INFO] -=-=-=-= all task done -=-=-=-=')
      return process.exit()
    }
  }

  doneTaskCondition(msg) {
    return true
  }

  msgHandler(processId){
    return function(msg){
      const {freeChild, busyChild, tm} = this
      if (this.doneTaskCondition(msg)) {
        this.removeDoneTask.bind(this)(msg, processId)
        this.assignTask(freeChild, busyChild, tm)
      }
    }
  }

  init(){
    const {freeChild, busyChild, tm, msgHandler} = this
    forking()
    this.initWorker()
    this.assignTask(freeChild, busyChild, tm)

    // init handler
    cluster.on('exit', exitHandler());

    for (const id in cluster.workers) {
      cluster.workers[id].on('message', msgHandler(id).bind(this));
    }
  }
}

module.exports = BaseMaster
