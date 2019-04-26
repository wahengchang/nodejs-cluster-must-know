module.exports = function(){
  console.log(`Worker ${process.pid} started`);

  setTimeout(() => {
    console.log(`Worker ${process.pid} finished`);
    process.exit();
  }, 2000);
}