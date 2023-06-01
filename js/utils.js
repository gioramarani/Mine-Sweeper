function getRandomInt(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min) + min)
  }
  
  function getRandomIntInclusive(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min + 1) + min); // The maximum is inclusive and the minimum is inclusive
  }
  
  function getRandomColor() {
    var letters = '0123456789ABCDEF';
    var color = '#';
    for (var i = 0; i < 6; i++) {
      color += letters[Math.floor(Math.random() * 16)];
    }
    return color;
  }
  
  function makeId(length = 6) {
      var txt = ''
      var possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
  
      for (var i = 0; i < length; i++) {
          txt += possible.charAt(Math.floor(Math.random() * possible.length))
      }
  
      return txt
  }

  
function startStopWatch() {
  const startTime = Date.now()//curr time stamp 1231232344543 -> 11L15
  gInterval = setInterval(function () {
      const elapsedTime = (Date.now() - startTime) / 1000
      // console.log('Date.now() - startTime', Date.now() - startTime);
      // console.log('startTime', startTime);
      // console.log('Date.now()', Date.now());
      // console.log('elapesdTime', elapsedTime);
      // console.log('elapsedTime.toFixed(3)', elapsedTime.toFixed(3));

      gTimer.innerText = elapsedTime.toFixed(3)
  }, 100)
  // setTimeout(()=> clearInterval(gInterval), 2000 )


}


function stopWatch() {
  clearInterval(gInterval)
}