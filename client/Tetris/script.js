document.addEventListener('DOMContentLoaded', () => {
  const grid = document.querySelector('.grid'); // the grid containing the sqaures
  let squares = Array.from(document.querySelectorAll('.grid div')); // divs inside the grid
  const scoreDisplay = document.querySelector('#score'); // html element for the score display
  const startButton = document.querySelector('#start-button'); // start/pause button
  const width = 10; // number of squares horizontally in the grid
  let nextRandom = 0; // randomly selected index for the next tetromino
  let timerId;
  let score = 0; // store the score
  const colors = ['red', 'blue', 'purple', 'green', 'pink']; // colors for the tetrominos
  let isStarted = false; // store the started/ paused state of the game

  // The Tetrominoesa
  const lTetromino = [
    [1, width + 1, width * 2 + 1, 2],
    [width, width + 1, width + 2, width * 2 + 2],
    [1, width + 1, width * 2 + 1, width * 2],
    [width, width * 2, width * 2 + 1, width * 2 + 2]
  ];

  const zTetromino = [
    [width + 1, width + 2, width * 2, width * 2 + 1],
    [0, width, width + 1, width * 2 + 1],
    [width + 1, width + 2, width * 2, width * 2 + 1],
    [0, width, width + 1, width * 2 + 1]
  ];
  const tTetromino = [
    [1, width, width + 1, width + 2],
    [1, width + 1, width + 2, width * 2 + 1],
    [width, width + 1, width + 2, width * 2 + 1],
    [1, width, width + 1, width * 2 + 1]
  ];

  const oTetromino = [
    [0, 1, width, width + 1],
    [0, 1, width, width + 1],
    [0, 1, width, width + 1],
    [0, 1, width, width + 1]
  ];

  const iTetromino = [
    [1, width + 1, width * 2 + 1, width * 3 + 1],
    [width, width + 1, width + 2, width + 3],
    [1, width + 1, width * 2 + 1, width * 3 + 1],
    [width, width + 1, width + 2, width + 3]
  ];

  const theTetrominos = [lTetromino, zTetromino, tTetromino, oTetromino, iTetromino];

  let currentPosition = 4;
  let currentRotation = 0;

  // select a tetromino and its first rotation
  let random = Math.floor(Math.random() * theTetrominos.length);
  let current = theTetrominos[random][currentRotation];

  // draw the tetromino rotation on the grid
  function draw() {
    current.forEach((index) => {
      squares[currentPosition + index].classList.add('tetromino');
      squares[currentPosition + index].style.backgroundColor = colors[random];
    });
  }

  // undraw the tetromino from the grid
  function undraw() {
    current.forEach((index) => {
      squares[currentPosition + index].classList.remove('tetromino');
      squares[currentPosition + index].style.backgroundColor = '';
    });
  }

  // make the tetromino move down every second
  // timerId = setInterval(moveDown, 500)

  // assign functions to key codes
  function control(e) {
    if (isStarted) {
      if (e.keyCode === 37) {
        moveLeft();
      } else if (e.keyCode === 38) {
        rotate();
      } else if (e.keyCode === 39) {
        moveRight();
      } else if (e.keyCode === 40) {
        moveDown();
      }
    }
  }

  document.addEventListener('keyup', control);

  // move down function to move the tetromino down the grid
  function moveDown() {
    undraw();
    currentPosition += width;
    draw();
    freeze();
  }
  // freeze function
  function freeze() {
    if (current.some((index) => squares[currentPosition + index + width].classList.contains('taken'))) {
      current.forEach(((index) => squares[currentPosition + index].classList.add('taken')));
      // start a new tetromino falling
      random = nextRandom;
      nextRandom = Math.floor(Math.random() * theTetrominos.length);
      current = theTetrominos[random][currentRotation];
      currentPosition = 4;
      draw();
      displayShape();
      addScore();
      gameOver();
    }
  }

  // move the tetromino left, unless is at the edge or there is a blockage
  function moveLeft() {
    undraw();
    const isAtLeftEdge = current.some((index) => (currentPosition + index) % width === 0);
    if (!isAtLeftEdge) { currentPosition -= 1; }
    if (current.some((index) => squares[currentPosition + index].classList.contains('taken'))) { currentPosition += 1; }
    draw();
  }

  // move the tetromino right, unless is at the edge or there is a blockage
  function moveRight() {
    undraw();
    const isAtRightEdge = current.some((index) => (currentPosition + index) % width === width - 1);
    if (!isAtRightEdge) { currentPosition += 1; }
    if (current.some((index) => squares[currentPosition + index].classList.contains('taken'))) { currentPosition -= 1; }
    draw();
  }

  // function to rotate the Tetrominoes

  function rotate() {
    undraw();
    currentRotation++;
    if (currentRotation === current.length) { currentRotation = 0; }
    current = theTetrominos[random][currentRotation];
    draw();
  }
  // show the next teromino in the mini grid
  const displaySquares = document.querySelectorAll('.mini-grid div');
  const displayWidth = 4;
  // let displayIndex = 0

  // tetrominoes without the rotations
  const upNextTetrominoes = [
    [1, displayWidth + 1, displayWidth * 2 + 1, 2], // lTetromino
    [displayWidth + 1, displayWidth + 2, displayWidth * 2, displayWidth * 2 + 1], // zTetromino
    [1, displayWidth, displayWidth + 1, displayWidth + 2], // tTetromino
    [0, 1, displayWidth, displayWidth + 1], // oTetromino
    [1, displayWidth + 1, displayWidth * 2 + 1, displayWidth * 3 + 1] // iTetromino
  ];

  // function to display the next tetromino in the mini-grid
  function displayShape() {
    displaySquares.forEach((square) => {
      square.classList.remove('tetromino');
      square.style.backgroundColor = '';
    });
    upNextTetrominoes[nextRandom].forEach((index) => {
      displaySquares[index].classList.add('tetromino');
      displaySquares[index].style.backgroundColor = colors[nextRandom];
    });
  }

  // functionality for the start/pause startButton
  startButton.addEventListener('click', () => {
    isStarted = !isStarted;
    if (timerId) {
      clearInterval(timerId);
      timerId = null;
    } else {
      draw();
      timerId = setInterval(moveDown, 500);
      nextRandom = Math.floor(Math.random() * theTetrominos.length);
      displayShape();
    }
  });

  // functionality to calculate the score
  function addScore() {
    for (let i = 0; i < 199; i += width) {
      const row = [i, i + 1, i + 2, i + 3, i + 4, i + 5, i + 6, i + 7, i + 8, i + 9];
      if (row.every((index) => squares[index].classList.contains("taken"))) {
        score += 10;
        scoreDisplay.innerHTML = score;
        row.forEach((index) => {
          squares[index].classList.remove("taken");
          squares[index].classList.remove("tetromino");
          squares[index].style.backgroundColor = '';
        });
        const squaresRemoved = squares.splice(i, width);
        squares = squaresRemoved.concat(squares);
        squares.forEach((cell) => grid.appendChild(cell));
      }
    }
  }

  // functionality to identify the game over
  function gameOver() {
    if (current.some((index) => squares[currentPosition + index].classList.contains('taken'))) {
      scoreDisplay.innerHTML = `GAME OVER. SCORE : ${score}`;
      clearInterval(timerId);
      isStarted = false;
    }
  }
});
