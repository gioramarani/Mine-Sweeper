'use strict'

var gBoard
var gGame
var gLevel = {
    SIZE: 4,
    MINES: 2,
    LIVES: 2
}

const BOMB = '💣'
const FLAG = '🚩'
const NORMALFACE = '😊'
const WINNINGFACE = '🤩'
const LOSINGFACE = '🥴'

var gElSmile = document.querySelector('.smileface')
var gPopup = document.querySelector('.modal')
var gRestartFace = document.querySelector('.restart-button')
var gUserMsg = document.querySelector('.user-msg')
var gBombsRevealedCount = 0
var gElLives = document.querySelector('.lives-left span')
var gFlags = 0
var gOpenCells = 0
var gUseHint = false
var gElLightBolb
var gInterval
var gTimer = document.querySelector('.stop-watch span')
var gBestScore = document.querySelector('.best-scores span')
var gBestScoreTitle = document.querySelector('.best-scores')
localStorage.bestScoreLevel1 = Infinity
localStorage.bestScoreLevel2 = Infinity
localStorage.bestScoreLevel3 = Infinity
gBestScore.innerText = localStorage.bestScoreLevel1
// gBestScore
var gIsTimeRunning



// starts the game
function onInit() {
    stopWatch()
    gIsTimeRunning = false
    gBoard = buildBoard()
    gBombsRevealedCount = 0
    gFlags = 0
    gOpenCells = 0
    gElSmile.innerText = NORMALFACE
    gTimer.innerText = '0.000'
    gPopup.style.display = 'none'
    gGame = {
        isOn: true,
        shownCount: 0,
        markedCount: 0,
        secsPassed: 0
    }
    if (+gBestScore.innerText === Infinity) {
        gBestScoreTitle.style.display = 'none'
    } else{
        gBestScoreTitle.style.display = 'block'
    }
    renderBoard(gBoard)
    gElLives.innerText = gLevel.LIVES
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

        var randEmptyCell = getRandomEmptyCell(board)
        console.log(randEmptyCell)
        randEmptyCell.isMine = true
    }
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
        if (!gOpenCells) return
        elCell.innerText = BOMB
        console.log(gBoard[i][j])
        gBombsRevealedCount++
        console.log('bombsRevealed', gBombsRevealedCount)
        decreaseLivesLeft()
        checkGameOver()
    } else {
        elCell.innerText = gBoard[i][j].minesAroundCount
        gOpenCells++
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
    if (gBoard[i][j].isShown) return
    if (elCell.innerText === FLAG) {
        elCell.innerText = ''
        gBoard[i][j].isMarked = false
        gFlags--
    } else {
        elCell.innerText = FLAG
        gBoard[i][j].isMarked = true
        gFlags++
        console.log(gFlags)
        checkVictory()
    }
    if (!gIsTimeRunning) {
        startStopWatch()
        gIsTimeRunning = true
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
                if (!gBoard[i][j].isShown) gOpenCells++
                gBoard[i][j].isShown = true
                // if(!gBoard[i][j].minesAroundCount) revealFirstDegNegs(i,j)
            }
            // console.log(gOpenCells)
        }//remeber to count each one that openned up if it wasnt open already
    }
}
function decreaseLivesLeft() {
    gElLives.innerText = gLevel.LIVES - gBombsRevealedCount
}

function checkVictory() {
    // When easy Level Need To change something...
    if (gFlags + gBombsRevealedCount === gLevel.MINES && gOpenCells === (gLevel.SIZE ** 2) - gLevel.MINES) {
        // console.log('gflags', gFlags)
        // console.log('gbombsrevealed', gBombsRevealedCount)
        // console.log('glevel.mines', gLevel.MINES)
        // console.log('opencells', gOpenCells)
        // console.log('glelvel.size**2', gLevel.SIZE ** 2)
        // console.log('glevel.mines', gLevel.MINES)
        gElSmile.innerText = WINNINGFACE
        stopWatch()
        // gBestScore.innerText = gTimer.innerText
        checkForBestScore(gLevel.LIVES - 1)
        gPopup.style.display = 'block'
        gUserMsg.innerText = 'You Won!!'
        gGame.isOn = false
        gIsTimeRunning = false
    }
}

function checkGameOver() {
    if (gBombsRevealedCount === gLevel.LIVES) {
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
