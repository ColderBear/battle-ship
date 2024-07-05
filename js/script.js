const gamesBoardContainer = document.querySelector('#gamesboard-container')
const flipBtn = document.querySelector('#flip-btn')
const optionContainer = document.querySelector('.option-container')
const startBtn = document.querySelector('#start-btn')
const infoDisplay = document.querySelector('#info')
const turnDisplay = document.querySelector('#turn-display')
const computerStatus = document.querySelector('.computer-status')

//flip btn interaction 
let angle = 0
function flip () {
    const optionShips = Array.from(optionContainer.children)//converts the HTMLCollection of child elements of optionContainer into an array.
    angle = angle === 0 ? 90 : 0
    optionShips.forEach((ship) => {ship.style.transform = `rotate(${angle}deg)`})
    
}
flipBtn.addEventListener('click', flip)

// Creating 2 Boards in gameBoardsContainer
function createBoard (color, user) {
    const board = document.createElement('div');
    board.classList.add('board', 'game-board');
    board.style.backgroundColor = color;
    board.id = user;

    for (let i = 0; i < 100; i++){
        const block = document.createElement('div')
        block.classList.add('block')
        block.id = i //adding each block's id 0-100
        board.append(block)//inside gameboard add little block
    }

    if(board.id === 'computer'){

    }
    gamesBoardContainer.append(board)
}

createBoard('gray', 'player')
createBoard('gray','computer')

// Creating Ships 

class Ship {
    constructor(name, length){
        this.name = name
        this.length = length
    }
}

const destroyer = new Ship('destroyer', 2)
const submarine = new Ship('submarine', 3)
const cruiser = new Ship('cruiser', 3)
const battleship = new Ship('battleship', 4)
const carrier = new Ship('carrier', 5)
//create array for looping 
const ships = [destroyer, submarine, cruiser, battleship, carrier]
let notDropped

function getValidity(allBlocks, isHorizontal, startIndex, ship){
    let validStart
    
    if(isHorizontal){
        if(startIndex <= 100 - ship.length){//highest index that the ship can fit horizontally
            validStart = startIndex //if it's true it means it can fit horizontally 
        }
        else{
            validStart = 100 - ship.length
        }
    }else {//if it's vertical 
        if(startIndex <= 100 - ship.length * 10){//highest index that the ship can fit vertically
            validStart = startIndex
        }
        else{
            validStart = 100 - ship.length * 10
        }
    }
    
    let shipBlocks = [] /*store the blocks occupy the ship [
                            [allBlocks[8],  // Corresponds to <div id="8"></div>
                            allBlocks[9],  // Corresponds to <div id="9"></div>
                            allBlocks[10]  // Corresponds to <div id="10"></div>
                            ]*/
    for (let i = 0; i < ship.length; i++){//determine the number of blocks ships will occupy 
        if(isHorizontal){
            shipBlocks.push(allBlocks[Number(validStart) + i])
        }
        else{
            shipBlocks.push(allBlocks[Number(validStart) + i * 10])
        }
    }
    
    let valid

    // Check if placing the ship horizontally causes it to wrap to the next row
    if(isHorizontal){
        shipBlocks.every((shipBlock, index) =>
        valid = shipBlocks[0].id % 10 !== 10 - (shipBlocks.length - (index + 1)))
    }else{
        shipBlocks.every((shipBlock, index) => 
        valid = shipBlocks[0].id < 90 + (10 * index + 1))
    }
    
    const notTaken = shipBlocks.every(shipBlock => !shipBlock.classList.contains('taken'))
    return {shipBlocks, valid, notTaken}
}

function addShipPiece(user, ship, startId) {
    //access the board block first 
    const allBlocks = document.querySelectorAll(`#${user} div`)
    let randomBoolean = Math.random() < 0.5 //either true or false 
    let isHorizontal = user === 'player' ? angle === 0 : randomBoolean
    let randomStartIndex = Math.floor(Math.random() * 100)
    let startIndex = startId ? startId : randomStartIndex
    
    const {shipBlocks, valid, notTaken} = getValidity(allBlocks, isHorizontal, startIndex, ship)

    if(valid && notTaken){
        shipBlocks.forEach((shipBlock) => {
            shipBlock.classList.add(ship.name)
            shipBlock.classList.add('taken')
        })
    }else{
        if(user === 'computer') addShipPiece(user, ship, startId)// retry placing the ship if not valid or taken
        if(user === 'player') notDropped = true
    }
}
ships.forEach((ship) => addShipPiece('computer', ship))

// Drag player ships
let draggedShip
const optionShips = Array.from(optionContainer.children)
optionShips.forEach(optionShip => optionShip.addEventListener('dragstart',dragStart))

const allPlayerBlocks = document.querySelectorAll('#player div')
allPlayerBlocks.forEach(playerBlock => {
    playerBlock.addEventListener('dragover', dragOver)
    playerBlock.addEventListener('drop', dropShip)
})

function dragStart(e){//e.target represents the ship we are dragging 
    notDropped = false
    draggedShip = e.target
}

function dragOver(e) {
    e.preventDefault()
    const ship = ships[draggedShip.id]
    hightlightArea(e.target.id, ship)
}

function dropShip(e) {
    const startId = e.target.id
    const ship = ships[draggedShip.id]
    addShipPiece('player', ship, startId)
    if(!notDropped){
        draggedShip.remove()
    }
}

//Add highlight

function hightlightArea(startIndex, ship){
    const allBoardBlocks = document.querySelectorAll('#player div')
    let isHorizontal = angle === 0

    const {shipBlocks, valid, notTaken} = getValidity(allBoardBlocks, isHorizontal, startIndex, ship)

    if(valid && notTaken){
        shipBlocks.forEach(shipBlock => {
            shipBlock.classList.add('hover')
            setTimeout(() => shipBlock.classList.remove('hover'), 500)
        })
    }
}

let gameOver = false
let playerTurn

//Start GAme

function startGame() {
    if(playerTurn === undefined) {
        //When all the pieces are on the board we can start the game 
    if(optionContainer.children.length !== 0){
        infoDisplay.textContent = 'Please place all your pieces first !'
    }
    else{
       const allBoardBlocks =  document.querySelectorAll('#computer div')
       allBoardBlocks.forEach(block => {block.addEventListener('click', handleClick)})
        playerTurn = true
        turnDisplay.textContent = 'Your Go!'
        infoDisplay.textContent = 'The game has started!'
        }
    }
}
startBtn.addEventListener('click', startGame)

let playerHits = []
let computerHits = []
let playerSunkShips = []
let computerSunkShips = []


function handleClick(e){
    if(!gameOver){
        if (e.target.classList.contains('boom') || e.target.classList.contains('empty')) {
            return; // Exit the function if the block has already been clicked
        }
        if(e.target.classList.contains('taken')){
            //when we clicked on the computer's board which has a ship(taken) we execute boom
            e.target.classList.add('boom')
            if (e.target.classList.contains('destroyer')){shipStatus('computer','destroyer')}
            else if (e.target.classList.contains('submarine')){shipStatus('computer','submarine')}
            else if (e.target.classList.contains('cruiser')){shipStatus('computer','cruiser')}
            else if (e.target.classList.contains('battleship')){shipStatus('computer','battleship')}
            else if (e.target.classList.contains('carrier')){shipStatus('computer','carrier')}
            infoDisplay.textContent = 'You hit the computers ship !'
            let classes = Array.from(e.target.classList)
            classes = classes.filter(className => className !== 'block')
            classes = classes.filter(className => className !== 'boom')
            classes = classes.filter(className => className !== 'taken')
            playerHits.push(...classes)
            // this will keep track of what ships u hit 
            checkScore('player', playerHits, playerSunkShips)
            }
        }
        if(!e.target.classList.contains('taken')){
            infoDisplay.textContent = 'Nothing hit this time'
            e.target.classList.add('empty')
        }
        playerTurn = false
        const allBoardBlocks = document.querySelectorAll('#computer div')
        allBoardBlocks.forEach(block => block.replaceWith(block.cloneNode(true)))
        setTimeout(hardComputerGo, 3000)
    }

//Hard Mode for computer 
let huntMode = true; // This will switch between hunt and target mode
let lastHit = null; // The last hit block coordinates
let potentialTargets = []; // Array to store potential targets in target mode

function hardComputerGo() {
    if (!gameOver) {
        turnDisplay.textContent = 'Computer\'s Go!';
        infoDisplay.textContent = 'The computer is thinking...';
        
        setTimeout(() => {
            if (huntMode) {
                computerHuntMode();
            } else {
                computerTargetMode();
            }

            setTimeout(() => {
                playerTurn = true;
                turnDisplay.textContent = 'Your Go!';
                infoDisplay.textContent = 'Please take your turn.';
                const allBoardBlocks = document.querySelectorAll('#computer div');
                allBoardBlocks.forEach(block => block.addEventListener('click', handleClick));
            }, 2000);
        }, 2000);
    }
}

function computerHuntMode() {
    const allBoardBlocks = document.querySelectorAll('#player div');
    let randomGo = Math.floor(Math.random() * 100);

    while (allBoardBlocks[randomGo].classList.contains('boom') || allBoardBlocks[randomGo].classList.contains('empty')) {
        randomGo = Math.floor(Math.random() * 100);
    }

    const targetBlock = allBoardBlocks[randomGo];
    rocketAnimation(targetBlock);

    if (targetBlock.classList.contains('taken') && !allBoardBlocks[randomGo].classList.contains('boom')) {
        targetBlock.classList.add('boom');

        lastHit = randomGo;
        potentialTargets = getAdjacentBlocks(randomGo);
        huntMode = false;
        updateShipStatus('player', targetBlock);
        infoDisplay.textContent = 'The computer hit your ship!';

        let classes = Array.from(targetBlock.classList);
        classes = classes.filter(className => className !== 'block');
        classes = classes.filter(className => className !== 'boom');
        classes = classes.filter(className => className !== 'taken');
        computerHits.push(...classes);
        checkScore('computer', computerHits, computerSunkShips);
    } else {
        targetBlock.classList.add('empty');
        rocketAnimation(targetBlock);
        infoDisplay.textContent = 'Nothing hit this time.';
    }
}

function computerTargetMode() {
    if (potentialTargets.length === 0) {
        huntMode = true;
        computerHuntMode();
        return;
    }

    const allBoardBlocks = document.querySelectorAll('#player div');
    const targetIndex = potentialTargets.pop();
    const targetBlock = allBoardBlocks[targetIndex];

    if (targetBlock.classList.contains('boom') || targetBlock.classList.contains('empty')) {
        computerTargetMode();
        return;
    }

    rocketAnimation(targetBlock);

    if (targetBlock.classList.contains('taken')) {
        targetBlock.classList.add('boom');
        potentialTargets = potentialTargets.concat(getAdjacentBlocks(targetIndex));
        updateShipStatus('player', targetBlock);
        infoDisplay.textContent = 'The computer hit your ship!';

        let classes = Array.from(targetBlock.classList);
        classes = classes.filter(className => className !== 'block');
        classes = classes.filter(className => className !== 'boom');
        classes = classes.filter(className => className !== 'taken');
        computerHits.push(...classes);
        checkScore('computer', computerHits, computerSunkShips);
    } else {
        targetBlock.classList.add('empty');
        infoDisplay.textContent = 'Nothing hit this time.';
    }
}

function getAdjacentBlocks(index) {
    const row = Math.floor(index / 10);
    const col = index % 10;
    const adjacentBlocks = [];

    if (row > 0) adjacentBlocks.push(index - 10); // Up
    if (row < 9) adjacentBlocks.push(index + 10); // Down
    if (col > 0) adjacentBlocks.push(index - 1);  // Left
    if (col < 9) adjacentBlocks.push(index + 1);  // Right

    return adjacentBlocks;
}

function updateShipStatus(user, targetBlock) {
    if (targetBlock.classList.contains('destroyer')) {
        shipStatus(user, 'destroyer');
    } else if (targetBlock.classList.contains('submarine')) {
        shipStatus(user, 'submarine');
    } else if (targetBlock.classList.contains('cruiser')) {
        shipStatus(user, 'cruiser');
    } else if (targetBlock.classList.contains('battleship')) {
        shipStatus(user, 'battleship');
    } else if (targetBlock.classList.contains('carrier')) {
        shipStatus(user, 'carrier');
    }

    const allBoardBlocks = document.querySelectorAll(`#${user} div`);
    if (!allBoardBlocks[lastHit].classList.contains('taken')) {
        huntMode = true;
    }
}

function checkScore(user, userHits, userSunkShips) {
    function checkShip(shipName, shipLength) {
        if(userHits.filter(storedShipName => storedShipName === shipName).length === shipLength) {
            if(user === 'player'){
                infoDisplay.textContent = `you sunk the computer's ${shipName}`
                playerHits = userHits.filter(storedShipName => storedShipName !== shipName)
            }
            if(user === 'computer'){
                infoDisplay.textContent =`The computer sunk your ${shipName}`
                computerHits = userHits.filter(storedShipName => storedShipName !== shipName)
            }
            userSunkShips.push(shipName)
        }
    }
    checkShip('destroyer', 2)
    checkShip('submarine', 3)
    checkShip('cruiser', 3)
    checkShip('battleship', 4)
    checkShip('carrier', 5)
    // console.log('playerHits', playerHits)
    // console.log('playerSunkShips', playerSunkShips)
    // console.log('computerHits', computerHits)
    // console.log('computerSunkShips', computerSunkShips)

if(playerSunkShips.length === 5) {
    infoDisplay.textContent = 'You sunk all the computer ships !'
    turnDisplay.textContent = ''
    gameOver = true

}
if(computerSunkShips.length === 5) {
    infoDisplay.textContent = 'The computer sunk all of your ships !'
    turnDisplay.textContent = ''
    gameOver = true
}
}


let health
function shipStatus(user,ship){
    switch (ship){
        case 'destroyer':
            let destroyerElement = document.querySelector(`.${user}-status .destroyer-ship .ship-health`);
            health = parseInt(destroyerElement.innerText.replace('%', '').trim())
            health -= 50
            destroyerElement.innerText = `${health} %`
        break
        case 'submarine':
            let submarineElement = document.querySelector(`.${user}-status .submarine-ship .ship-health`);
            health = parseInt(submarineElement.innerText.replace('%', '').trim())
            if(health === 34){
                health = 0
            submarineElement.innerText = `${health} %`
            }
            else{
                health -= 33
            submarineElement.innerText = `${health} %`
            }
        break
        case 'cruiser':
            let cruiserElement = document.querySelector(`.${user}-status .cruiser-ship .ship-health`);
            health = parseInt(cruiserElement.innerText.replace('%', '').trim())
            if(health === 34){
                health = 0
                cruiserElement.innerText = `${health} %`
            }
            else{
                health -= 33
            cruiserElement.innerText = `${health} %`
            }
        break
        case 'battleship':
            let battleshipElement = document.querySelector(`.${user}-status .battleship-ship .ship-health`);
            health = parseInt(battleshipElement.innerText.replace('%', '').trim())
            health -= 25
            battleshipElement.innerText = `${health} %`
        break
        case 'carrier':
            let carrierElement = document.querySelector(`.${user}-status .carrier-ship .ship-health`);
            health = parseInt(carrierElement.innerText.replace('%', '').trim())
            health -= 20
            carrierElement.innerText = `${health} %`
        break
    default:
        return
    }
}

function resetShipStatus() {
    const shipHealthElements = document.querySelectorAll('.ship-health')
    shipHealthElements.forEach(element => {
    element.innerText = '100%'
    })
    }


//Reset btn 
document.getElementById('restart-btn').addEventListener('click', init)
function init() {
    // Reset game state variables
    gameOver = false;
    playerTurn = undefined;
    playerHits = [];
    computerHits = [];
    playerSunkShips = [];
    computerSunkShips = [];
    huntMode = true;
    lastHit = null;
    potentialTargets = [];

    // Clear game boards and ships container
    gamesBoardContainer.innerHTML = '';
    optionContainer.innerHTML = '';

    // Recreate game boards
    createBoard('gray', 'player');
    createBoard('gray', 'computer');

    // Recreate ships in the ships container
    ships.forEach((ship, index) => {
        const shipDiv = document.createElement('div');
        shipDiv.id = index;
        shipDiv.classList.add(`${ship.name}-prev`, ship.name);
        shipDiv.draggable = true;
        shipDiv.addEventListener('dragstart', dragStart);
        optionContainer.appendChild(shipDiv);
    });

    // Place computer ships
    ships.forEach((ship) => addShipPiece('computer', ship));

    // Add event listeners for dragging and dropping
    const allPlayerBlocks = document.querySelectorAll('#player div');
    allPlayerBlocks.forEach(playerBlock => {
        playerBlock.addEventListener('dragover', dragOver);
        playerBlock.addEventListener('drop', dropShip);
    });

    resetShipStatus()
    infoDisplay.textContent = 'Drag your ships to the left of the board'
    startBtn.addEventListener
}


//Rocket Animation
function rocketAnimation(target) {
    // Create the rocket element
    const rocket = document.createElement('div');
    rocket.classList.add('rocket');

    // Append the rocket to the document
    document.body.appendChild(rocket);

    // Position the rocket at the target block
    const targetRect = target.getBoundingClientRect();
    rocket.style.left = `${targetRect.left + window.scrollX}px`;
    rocket.style.top = `${targetRect.top + window.scrollY}px`;

    // Trigger the rocket animation
    rocket.style.animation = 'launch 3s forwards';
    // Create and trigger the explosion after the rocket animation
    setTimeout(() => {
        // Remove the rocket
        document.body.removeChild(rocket);

        // Create the explosion element
        const explosion = document.createElement('div');
        explosion.classList.add('explosion');

        // Position the explosion at the target block
        explosion.style.left = `${targetRect.left + window.scrollX}px`;
        explosion.style.top = `${targetRect.top + window.scrollY}px`;

        // Append the explosion to the document
        document.body.appendChild(explosion);

        // Trigger the explosion animation
        explosion.style.animation = 'explode 0.5s forwards';

        // Remove the explosion after animation
        setTimeout(() => {
            document.body.removeChild(explosion);
        }, 1000);
    }, 1000); // Duration of the rocket animation
}