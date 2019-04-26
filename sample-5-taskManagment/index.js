const cluster = require('cluster');

Array.prototype.removeElement = function(condition = {}){
  const index = this.findIndex(item => {
    const keys = Object.keys(condition)
    let matchAll = false
    for(const key of keys){
      if(`${item[key]}` !== `${condition[key]}`) {
        matchAll = false
      }
    }
    return matchAll
  })

  if(index ===0 || index) {
    this.splice(index, 1)
  }
  return
}

function random(min = 1, max=3) {
  return Math.random() * (max - min) + min;
}

if (cluster.isMaster) {
  const BaseMaster = require('./master')
  const taskPool = [
    {spendTime: random()},
    {spendTime: random()},
    {spendTime: random()},
    {spendTime: random()},
    {spendTime: random()},
  ]
  const bm = new BaseMaster(taskPool, function(){
    console.log('[INFO] process done')
    process.exit();
  })
  bm.doneTaskCondition = function(msg){
    const {id, taskInfo} = msg
    if (id && taskInfo && taskInfo.spendTime) {
      return true
    }
    return false
  }
  bm.init()
  
} else {
  require('./worker')()
}