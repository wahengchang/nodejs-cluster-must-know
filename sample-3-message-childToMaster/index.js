const cluster = require('cluster');

if (cluster.isMaster) {
  require('./master')(function(){
    console.log('[INFO] process done')
    process.exit();
  })
} else {
  require('./worker')()
}