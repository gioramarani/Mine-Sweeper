'use strict'

var gBoard
var gGame
var gLevel = {
    SIZE: 4,
    MINES: 2
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
var gFlags = 0
var gOpenCells = 0
var gUseHint = false
var gElLightBolb


// starts the game
function onInit() {
    gBoard = buildBoard()
    gBombsRevealedCount = 0
    gFlags = 0
    gOpenCells = 0
    gElSmile.innerText = NORMALFACE
    gPopup.style.display = 'none'
    gGame = {
        isOn: true,
        shownCount: 0,
        markedCount: 0,
        secsPassed: 0
    }
    if (gLevel.MINES === 2) {
        gBombsRevealedCount = 1
        decreaseLivesLeft()
    }
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
    // if(gFirstClick)  // Paradox! How will it know to count how many mines are around if there arent any?///
    // createMines(gBoard)
    // console.table(gBoard)
    // setMinesNegsCount(gBoard)
    if(gUseHint){
        if (gBoard[i][j].isMine) {
            elCell.innerText = BOMB
            revealFirstDegNegs(i, j)
            setTimeout(finishHint, 1000, elCell, i, j)
            return
        } else{
            elCell.innerText = gBoard[i][j].minesAroundCount
            revealFirstDegNegs(i, j)
            setTimeout(finishHint, 1000, elCell, i, j)
        return
    }
}
    if (gBoard[i][j].isShown) return
    if (gBoard[i][j].isMarked) return
    if (gBoard[i][j].isMine) {
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
        console.log(gOpenCells)
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
}

function revealFirstDegNegs(idxi, idxj) {
    for (var i = idxi - 1; i <= idxi + 1; i++) {
        if (i < 0 || i >= gLevel.SIZE) continue;
        for (var j = idxj - 1; j <= idxj + 1; j++) {
            if (j < 0 || j >= gLevel.SIZE) continue;
            if (i === idxi && j === idxj) continue;
            var elCell = document.querySelector(`[data-i="${i}"][data-j="${j}"]`)
            elCell.innerText = gBoard[i][j].minesAroundCount
            if(!gUseHint){
            if (!gBoard[i][j].isShown) gOpenCells++
            gBoard[i][j].isShown = true
            }
            // console.log(gOpenCells)
        }//remeber to count each one that openned up if it wasnt open already
    }
} 
function decreaseLivesLeft() {
    var elLives = document.querySelector('.lives-left')
    elLives.innerText = 3 - gBombsRevealedCount
}

function checkVictory() {

    if (gFlags + gBombsRevealedCount >= gLevel.MINES && gOpenCells === (gLevel.SIZE ** 2) - gLevel.MINES) {
        gElSmile.innerText = WINNINGFACE
        gPopup.style.display = 'block'
        gUserMsg.innerText = 'You Won!!'
        gGame.isOn = false
    }
}

function checkGameOver() {
    if (gBombsRevealedCount === 3) { 
        var elCellsWithMine = []
        elCellsWithMine.push(...document.querySelectorAll('.mine'))
        console.log(elCellsWithMine)

        for (var i = 0; i < elCellsWithMine.length; i++) {
            elCellsWithMine[i].innerText = BOMB
        }
        gElSmile.innerText = LOSINGFACE
        gPopup.style.display = 'block'
        gUserMsg.innerText = 'Game Over..  Try Again!'
        gGame.isOn = false
    }
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

function useHint(ev){
    gElLightBolb = ev
    gElLightBolb.classList.add('shiney')
    gUseHint = true 
}

function finishHint(elCell, i, j){
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