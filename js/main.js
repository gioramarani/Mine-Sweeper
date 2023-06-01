'use strict'

var gBoard
var gGame
var gLevel = {
    SIZE: 4,
    MINES: 2,
    LIVES: 2
}

var gPopup = document.querySelector('.modal')
var gElSmile = document.querySelector('.smileface')
var gUserMsg = document.querySelector('.user-msg')
var gTimer = document.querySelector('.stop-watch span')
var gElLives = document.querySelector('.lives-left span')
var gRestartFace = document.querySelector('.restart-button')
var gBestScore = document.querySelector('.best-scores span')
var gBestScoreTitle = document.querySelector('.best-scores')
var elSafeClickLeft = document.querySelector('.safe-click span')
var gElMinesLeftToPlace = document.querySelector('.mines-left span')
var gElMinesLeftToPlaceTitle = document.querySelector('.mines-left')
var gManualBoard = []
var gManualMode = false
var gUseHint = false
var gElLightBolb
var gInterval
var gIsTimeRunning
var gMinesLeftToPlaceCountDown
localStorage.bestScoreLevel1 = Infinity
localStorage.bestScoreLevel2 = Infinity
localStorage.bestScoreLevel3 = Infinity
gBestScore.innerText = localStorage.bestScoreLevel1


const BOMB = '💣'
const FLAG = '🚩'
const NORMALFACE = '😊'
const WINNINGFACE = '🤩'
const LOSINGFACE = '🥴'
const SAFE = '🛟'


// starts the game
function onInit() {
    stopWatch()
    gIsTimeRunning = false
    gBoard = buildBoard()
    gGame = {
        isOn: true,
        shownCount: 0,
        markedCount: 0,
        bombsRevealedCount: 0,
        safeClickLeftCount: 3
    }
    if (+gBestScore.innerText === Infinity) {
        gBestScoreTitle.style.display = 'none'
    } else {
        gBestScoreTitle.style.display = 'block'
    }

    elSafeClickLeft.innerText = gGame.safeClickLeftCount
    gElSmile.innerText = NORMALFACE
    gTimer.innerText = '0.000'
    gPopup.style.display = 'none'
    gElMinesLeftToPlaceTitle.style.display = 'none'
    // gElLightBolb.style.display = 'block'

    gElLives.innerText = gLevel.LIVES
    renderBoard(gBoard)
}

function buildBoard() {
    var board = []

    for (var i = 0; i < gLevel.SIZE; i++) {
        board[i] = []
        for (var j = 0; j < gLevel.SIZE; j++) {
            var cell = {
                minesAroundCount: 0,
                isShown: false,
                isMine: false,
                isMarked: false,
                i: i,
                j: j
            }
            board[i][j] = cell
        }
    }
  
    createMines(board)
    console.table(board)
    setMinesNegsCount(board)

    return board
}

function createMines(board) {
   
    for (var x = 0; x < gLevel.MINES; x++) {
        console.log(gManualMode)
        if(gManualMode) {
            console.log(gManualBoard)
         var manualCell = gManualBoard.splice(0,1)
         console.log(manualCell)
         manualCell.isMine = true
        } else{
        var randEmptyCell = getRandomEmptyCell(board)
        console.log(randEmptyCell)
        randEmptyCell.isMine = true
    }
    }
gManualMode = false
}

function getRandomEmptyCell(board) {
    var emptyCells = []
    for (var i = 0; i < board.length; i++) {
        for (var j = 0; j < board.length; j++) {
            if (!board[i][j].isMine) {
                emptyCells.push(board[i][j])
            }
        }
    }
    // console.log(emptyCells.length)
    var randIdx = getRandomInt(0, emptyCells.length)
    var emptyCellArr = emptyCells.splice(randIdx, 1)
    // console.log(emptyCells.length)
    // console.log(emptyCellArr)
    var emptyCell = emptyCellArr[0]
    // console.log(emptyCell)

    return emptyCell
}

function setMinesNegsCount(board) {

    for (var i = 0; i < board.length; i++) {
        for (var j = 0; j < board[0].length; j++) {
            var currCell = board[i][j]
            currCell.minesAroundCount = countMineNegsAroundEachCell(board, i, j)
            // console.log(currCell.minesAroundCount)
        }
    }


}

function countMineNegsAroundEachCell(board, idxi, idxj) {
    // console.log(idxi, idxj)

    for (var i = idxi - 1; i <= idxi + 1; i++) {
        if (i < 0 || i >= gLevel.SIZE) continue;
        for (var j = idxj - 1; j <= idxj + 1; j++) {
            if (j < 0 || j >= gLevel.SIZE) continue;
            if (i === idxi && j === idxj) continue;
            // console.log(i, j)
            if (board[i][j].isMine) {
                board[idxi][idxj].minesAroundCount++
            }
        }
        // console.log(board[idxi][idxj])
    }
    return board[idxi][idxj].minesAroundCount

}

function renderBoard(board) {
    var strHTML = ''
    for (var i = 0; i < board.length; i++) {
        strHTML += '<tr>'
        for (var j = 0; j < board[0].length; j++) {
            const currCell = board[i][j]
            var cellClass = ''
            if (currCell.isShown) cellClass += 'shown'
            if (currCell.isMine) cellClass += 'mine'
            if (currCell.isMarked) cellClass += 'marked'

            strHTML += `<td class="cell ${cellClass}"
        onclick="onCellClicked(this, ${i}, ${j})"
        oncontextmenu="onCellMarked(this, ${i}, ${j});return false;"
        data-i="${i}" data-j="${j}" > </td>`

        }
        strHTML += '</tr>'
    }
    const elBoard = document.querySelector('.board')
    elBoard.innerHTML = strHTML
}

function onCellClicked(elCell, i, j) {
    if(gManualMode) {
        userPositionMines(elCell, i, j)  
        return
    }
    if (!gIsTimeRunning) {
        startStopWatch()
        gIsTimeRunning = true
    }
    if (gUseHint) {
        if (gBoard[i][j].isMine) {
            elCell.innerText = BOMB
            revealFirstDegNegs(i, j)
            setTimeout(finishHint, 1000, elCell, i, j)
            return
        } else {
            elCell.innerText = gBoard[i][j].minesAroundCount
            revealFirstDegNegs(i, j)
            setTimeout(finishHint, 1000, elCell, i, j)
            return
        }
    }
    if (gBoard[i][j].isShown) return
    if (gBoard[i][j].isMarked) return
    if (gBoard[i][j].isMine) {
        if (!gGame.shownCount) return
        elCell.innerText = BOMB
        console.log(gBoard[i][j])
        gGame.bombsRevealedCount++
        console.log('bombsRevealed', gGame.bombsRevealedCount)
        decreaseLivesLeft()
        checkGameOver()
    } else {
        elCell.innerText = gBoard[i][j].minesAroundCount
        gGame.shownCount++
        checkVictory()
        if (!gBoard[i][j].minesAroundCount) { //if there are no mines around him
            revealFirstDegNegs(i, j)
        }
        // console.log(gOpenCells)
    }
    gBoard[i][j].isShown = true
    // console.log(gBoard[i][j])
}

function onCellMarked(elCell, i, j) {
    
    if (!gIsTimeRunning) {
        startStopWatch()
        gIsTimeRunning = true
    }
    if (gBoard[i][j].isShown) return
    if (elCell.innerText === FLAG) {
        elCell.innerText = ''
        gBoard[i][j].isMarked = false
        gGame.markedCount--
    } else {
        elCell.innerText = FLAG
        gBoard[i][j].isMarked = true
        gGame.markedCount++
        console.log(gGame.markedCount)
        checkVictory()
    }
}

function revealFirstDegNegs(idxi, idxj) {

    for (var i = idxi - 1; i <= idxi + 1; i++) {
        if (i < 0 || i >= gLevel.SIZE) continue;
        for (var j = idxj - 1; j <= idxj + 1; j++) {
            if (j < 0 || j >= gLevel.SIZE) continue;
            if (i === idxi && j === idxj) continue;
            var elCell = document.querySelector(`[data-i="${i}"][data-j="${j}"]`)
            elCell.innerText = gBoard[i][j].minesAroundCount
            if (!gUseHint) {
                if (!gBoard[i][j].isShown) gGame.shownCount++
                gBoard[i][j].isShown = true
                // if(!gBoard[i][j].minesAroundCount) revealFirstDegNegs(i,j) //  why not workiong as a recursion?
            }
            // console.log(gOpenCells)
        }
    }
}

function decreaseLivesLeft() {
    gElLives.innerText = gLevel.LIVES - gGame.bombsRevealedCount
}

function checkVictory() {

    if (gGame.markedCount + gGame.bombsRevealedCount === gLevel.MINES && gGame.shownCount === (gLevel.SIZE ** 2) - gLevel.MINES) {
        // console.log('gflags', gFlags)
        // console.log('gbombsrevealed', gBombsRevealedCount)
        // console.log('glevel.mines', gLevel.MINES)
        // console.log('opencells', gOpenCells)
        // console.log('glelvel.size**2', gLevel.SIZE ** 2)
        // console.log('glevel.mines', gLevel.MINES)
        gElSmile.innerText = WINNINGFACE
        checkForBestScore(gLevel.LIVES - 1)
        stopWatch()
        gPopup.style.display = 'block'
        gUserMsg.innerText = 'You Won!!'
        gGame.isOn = false
        gIsTimeRunning = false
        gManualMode = false
    }
}

function checkGameOver() {
    if (gGame.bombsRevealedCount === gLevel.LIVES) {
        var elCellsWithMine = []
        elCellsWithMine.push(...document.querySelectorAll('.mine'))
        console.log(elCellsWithMine)

        for (var i = 0; i < elCellsWithMine.length; i++) {
            elCellsWithMine[i].innerText = BOMB
        }
        gElSmile.innerText = LOSINGFACE
        stopWatch()
        gUserMsg.innerText = 'Game Over..  Try Again!'
        gGame.isOn = false
        gIsTimeRunning = false
        gManualMode = false

    }
}

function levelOfGame(num) {
    if (num === 1) {
        gLevel = {
            SIZE: 4,
            MINES: 2,
            LIVES: num + 1
        }
        gBestScore.innerText = localStorage.bestScoreLevel1
        // console.log(gLevel)
    } else if (num === 2) {
        gLevel = {
            SIZE: 8,
            MINES: 14,
            LIVES: num + 1
        }
        gBestScore.innerText = localStorage.bestScoreLevel2
        // console.log(gLevel)
    } else if (num === 3) {
        gLevel = {
            SIZE: 12,
            MINES: 32,
            LIVES: num + 1
        }
        gBestScore.innerText = localStorage.bestScoreLevel3
        // console.log(gLevel)
    } onInit()
}

function useHint(ev) {
    if(!gGame.isOn) return
    gElLightBolb = ev
    gElLightBolb.classList.add('shiney')
    gUseHint = true
}

function finishHint(elCell, i, j) {
    elCell.innerText = ''
    hideFirstDegNegs(i, j)
    gUseHint = false
    gElLightBolb.style.display = 'none'
}

function hideFirstDegNegs(idxi, idxj) {
    for (var i = idxi - 1; i <= idxi + 1; i++) {
        if (i < 0 || i >= gLevel.SIZE) continue;
        for (var j = idxj - 1; j <= idxj + 1; j++) {
            if (j < 0 || j >= gLevel.SIZE) continue;
            if (i === idxi && j === idxj) continue;
            var elCell = document.querySelector(`[data-i="${i}"][data-j="${j}"]`)
            elCell.innerText = ''
            // console.log(gOpenCells)
        }//remeber to count each one that openned up if it wasnt open already
    }
}

function checkForBestScore(level) {
    var currTime = gTimer.innerText
    console.log(currTime)
    
    // Stroe
    if (level === 1) {
        console.log(localStorage.bestScoreLevel1)
        if (currTime < +localStorage.bestScoreLevel1) {
            localStorage.bestScoreLevel1 = currTime
            console.log(localStorage.bestScoreLevel1)
        }
        gBestScore.innerText = localStorage.bestScoreLevel1
    } else if (level === 2) {
        console.log(localStorage.bestScoreLevel2)
        if (currTime < +localStorage.bestScoreLevel2) {
            localStorage.bestScoreLevel2 = currTime
            console.log(localStorage.bestScoreLevel2)
        }
        gBestScore.innerText = localStorage.bestScoreLevel2
    } else if (level === 3) {
        console.log(localStorage.bestScoreLevel3)
        if (currTime < +localStorage.bestScoreLevel3) {
            localStorage.bestScoreLevel3 = currTime
            console.log(localStorage.bestScoreLevel3)
        }
        gBestScore.innerText = localStorage.bestScoreLevel3
    }
    gBestScoreTitle.style.display = 'block'
    console.log('hello')

}

function safeClickClicked(){
    if(!gGame.safeClickLeftCount) return
    if(!gGame.isOn) return
    gGame.safeClickLeftCount--
    elSafeClickLeft.innerText = gGame.safeClickLeftCount
    var safeCell = getRandomEmptyCell(gBoard)
    // console.log(safeCell.i, safeCell.j)
    // console.log(gBoard[safeCell.i][safeCell.j])
    var elSafeCell = document.querySelector(`[data-i="${safeCell.i}"][data-j="${safeCell.j}"]`)
    console.log(elSafeCell)
    elSafeCell.classList.add('safe')

}

// function manualPositionMinesOn(){
//     if(gGame.shownCount) return
//    gManualMode = true
//    console.log(gManualMode)
//    gElMinesLeftToPlaceTitle.style.display = 'block'
//    gMinesLeftToPlaceCountDown = gLevel.MINES
   
//    gElMinesLeftToPlace.innerText = gMinesLeftToPlaceCountDown
// //    if(!gMinesLeftToPlaceCountDown){
// // }
// }

// function userPositionMines(elCell, idxi, idxj){
    
//     if(gMinesLeftToPlaceCountDown === 0){
//         console.log('finish placing bombs')
//         setMinesNegsCount(gBoard)
//         renderBoard(gBoard)
//        gManualMode = !gManualMode
        
//     } else{
//     elCell.innerText = BOMB
//     gBoard[idxi][idxj].isMine = true
//     console.log(elCell)
//     console.log(gBoard[idxi][idxj])
//     gManualBoard.push(gBoard[idxi][idxj])
//     console.log(gManualBoard)
//     gMinesLeftToPlaceCountDown--
//     gElMinesLeftToPlace.innerText = gMinesLeftToPlaceCountDown
// }
// }