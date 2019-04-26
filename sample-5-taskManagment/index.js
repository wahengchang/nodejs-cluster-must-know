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

if (cluster.isMaster) {
  require('./master')(function(){
    console.log('[INFO] process done')
    process.exit();
  })
} else {
  require('./worker')()
}