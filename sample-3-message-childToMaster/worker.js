module.exports = function(){
  function random(min = 1, max=3) {
      return Math.random() * (max - min) + min;
  }

  console.log(`Worker ${process.pid} started`);

  const s = random()*1000
  setTimeout(() => {
    console.log(`Worker ${process.pid} finished`);
    process.send({ spendTime: s });
    process.exit();
  }, s);
}