'use strict'

var gBoard
var gGame
var gLevel = {
    SIZE: 4,
    MINES: 2
}
var gBombsCount = 6 //change to 3
var gFlags = 0
var gOpenCells = 0

const BOMB = '💣'
const FLAG = '🚩'
const NORMALFACE = '😀'
const WINNINGFACE = '🤩'
const LOSINGFACE = '🥴'



// starts the game
function onInit() {
    // first click and then make bombs
    gBoard = buildBoard()
    gGame = {
        isOn: true,
        shownCount: 0,
        markedCount: 0,
        secsPassed: 0
    }
    renderBoard(gBoard)

}
// check if we can make lines 28-31 + 47 more compact
function buildBoard() {
    var board = []
    // var randNum1 = getRandomInt(0, gLevel.SIZE)
    // var randNum2 = getRandomInt(0, gLevel.SIZE)
    // var randNum3 = getRandomInt(0, gLevel.SIZE)
    // var randNum4 = getRandomInt(0, gLevel.SIZE)
    for (var i = 0; i < gLevel.SIZE; i++) {
        board[i] = []
        for (var j = 0; j < gLevel.SIZE; j++) {
            var cell = {
                minesAroundCount: 0,
                isShown: false,
                isMine: false,
                isMarked: false
            }
            board[i][j] = cell
            //   console.log(cell, i, j)
            // if (i === randNum1 && j === randNum2 || i === randNum3 && j === randNum4) board[i][j].isMine = true
            // if (i === 1 && j === 1 || i === 2 && j === 2) board[i][j].isMine = true
            for (var x = 0; x < gLevel.MINES; x++) {
                var randNum1 = getRandomInt(0, gLevel.SIZE)
                var randNum2 = getRandomInt(0, gLevel.SIZE)
                if (i === randNum1 && j === randNum2) board[i][j].isMine = true
            }
        }
    }
    console.table(board)
    setMinesNegsCount(board)

    return board
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
        if (i < 0 || i >= gLevel.SIZE ) continue;
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
            // var cellClass = getClassName({ i: i, j: j }) + ' ' //'cell-0-0 '
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
    if (gBoard[i][j].isMarked) return
    if (gBoard[i][j].isShown) return
    if (gBoard[i][j].isMine) {
        elCell.innerText = BOMB
        console.log(gBoard[i][j])
        gBombsCount--
        checkGameOver()
    } else {
        elCell.innerText = gBoard[i][j].minesAroundCount
        gOpenCells++
        console.log(gOpenCells)
        checkVictory()
        if (!gBoard[i][j].minesAroundCount) { //if there are no mines around him
            revealFirstDegNegs(i, j)
        }
    }
    gBoard[i][j].isShown = true
    // console.log(gBoard[i][j])
}

function revealFirstDegNegs(idxi, idxj) {
    for (var i = idxi - 1; i <= idxi + 1; i++) {
        if (i < 0 || i >= gLevel.SIZE - 1) continue;
        for (var j = idxj - 1; j <= idxj + 1; j++) {
            if (j < 0 || j >= gLevel.SIZE - 1) continue;
            if (i === idxi && j === idxj) continue;
            var elCell = document.querySelector(`[data-i="${i}"][data-j="${j}"]`)
            elCell.innerText = gBoard[i][j].minesAroundCount
            if (!gBoard[i][j].isShown) gOpenCells++
            gBoard[i][j].isShown = true
            console.log(gOpenCells)
        }//remeber to count each one that openned up if it wasnt open already
    }
} // dont allow flag on open cell

function checkVictory() {
    if (gFlags === gLevel.MINES && gOpenCells === gLevel.SIZE ** 2 - gLevel.MINES) {
        alert('You Win!!!')
        gGame.isOn = false
    }
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
}

function checkGameOver() {
    if (!gBombsCount) {
        var elCellsWithMine = []
        elCellsWithMine.push(...document.querySelectorAll('.mine'))
        console.log(elCellsWithMine)

        for (var i = 0; i < elCellsWithMine.length; i++) {
            elCellsWithMine[i].innerText = BOMB
        }
        alert('Game Over!')
        gGame.isOn = false
    }
}

function expandShown(board, elCell, i, j) {

}

// Returns the class name for a specific cell
function getClassName(location) {
    const cellClass = 'cell-' + location.i + '-' + location.j
    return cellClass
}

function levelOfGame(num) {
    if (num === 1) {
        gLevel = {
            SIZE: 4,
            MINES: 2
        }
        // console.log(gLevel)
    } else if (num === 2) {
        gLevel = {
            SIZE: 8,
            MINES: 14
        }
        // console.log(gLevel)
    } else if (num === 3) {
        gLevel = {
            SIZE: 12,
            MINES: 32
        }
        // console.log(gLevel)
    } onInit()
}
