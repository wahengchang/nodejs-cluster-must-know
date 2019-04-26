const cluster = require('cluster');
const numCPUs = require('os').cpus().length;

const ts = () => {
  return new Date().getTime()
}

class Manager {
  constructor( task = [], ){
    this.task = [...task]
    this.taskList = task.map( _t => ({
      id: ts(),
      taskInfo: _t
    }))

    this.taskInProcess = []
    this.taskDone = []
  }

  fetchTask(){
    if(this.taskList.length <=0 ) return null

    const firstTask = this.taskList.shift()
    this.taskInProcess.push(firstTask)

    return firstTask
  }

  count(){
    return this.taskList.length
  }

  finishTask(id){
    const targetTask = this.taskInProcess.find(item => item.id === id)

    if(!targetTask) return console.log(`[ERROR] task ${id} is not found in taskInProcess`)

    this.taskDone.push(targetTask)
    this.taskInProcess = this.taskInProcess.filter(item => item.id!==id)

    return
  }
}

module.exports = Manager