'use strict'

var gNums
var gNumOfCells = 16
var gBoard
var gCounter = 1
var gInterval

function onInit() {
    gNums = resetNums()
    shuffle(gNums)
    console.log(gNums);
    renderBoard()
    countNextNumber()
    document.querySelector('.stop-watch').innerText = '0.000'
}

function sixTeenCells() {
    gNumOfCells = 16
    restartGame()
}
function TwentyFiveCells() {
    gNumOfCells = 25
    restartGame()
}

function thirtySix() {
    gNumOfCells = 36
    restartGame()
}

function restartGame() {
    gCounter = 1
    onInit()
    stopWatch()
    document.querySelector('.stop-watch').innerText = '0.000'
}


function renderBoard() {
    var strHTML = ''
    for (var i = 0; i < Math.sqrt(gNumOfCells); i++) {
        strHTML += `<tr>`
        for (var j = 0; j < Math.sqrt(gNumOfCells); j++) {
            var num = gNums.pop()
            strHTML +=
                `<td onclick="cellClicked(${num})" data-name="${num}">${num}</td>`
        }

        strHTML += '</tr>'

    }
    const elBoard = document.querySelector('tbody')
    elBoard.innerHTML = strHTML
}


function cellClicked(clickedNum) {

    if (clickedNum === gCounter) {
        gCounter++
        var currCell = document.querySelector(`[data-name="${clickedNum}`)
        currCell.style.backgroundColor = 'red'
        countNextNumber()
    }
    if (gCounter === 2) {
        startStopWatch()
        // countDown()
    }
    if (gCounter > gNumOfCells) {
        stopWatch()
        alert('Nice Job!!!')
    }

}

function countNextNumber() {

    document.querySelector('.nextNum').innerText = 'Next Number: ' + gCounter
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

        document.querySelector('.stop-watch').innerText = elapsedTime.toFixed(3)
    }, 100)
    // setTimeout(()=> clearInterval(gInterval), 2000 )


}


function stopWatch() {
    clearInterval(gInterval)
}


function resetNums() {
    const nums = []
    for (let i = 1; i <= gNumOfCells; i++) {
        nums.push(i)

    }

    return nums
}


function shuffle(array) {
    let currentIndex = array.length, randomIndex;

    // While there remain elements to shuffle.
    while (currentIndex != 0) {

        // Pick a remaining element.
        randomIndex = Math.floor(Math.random() * currentIndex);
        currentIndex--;

        // And swap it with the current element.
        [array[currentIndex], array[randomIndex]] = [
            array[randomIndex], array[currentIndex]];
    }

    return array;
}

