let difficulty = 1;      
const difficultyInterval = 10000; // 難易度が上がる間隔（ミリ秒）      
const gameOverModal = document.getElementById('gameOverModal');      
const restartButton = document.getElementById('restartButton');      
const scoreElement = document.getElementById('score');      
let score = 0;      
    
const canvas = document.getElementById('gameCanvas');      
const ctx = canvas.getContext('2d');      
      
let player = {      
    x: canvas.width / 2,      
    y: canvas.height - 30,      
    width: 20,      
    height: 20,      
    speed: 7      
};      
      
let raindrops = [];      
let raindropFrequency = 50;      
let raindropSpeed = 3;      
    
// ... 先頭に追加      
class Raindrop {      
  constructor(x, y, width, height, speed) {      
      this.x = x;      
      this.y = y;      
      this.width = width;      
      this.height = height;      
      this.speed = speed;      
  }      
    
  update() {      
      this.y += this.speed;      
  }      
    
  draw(ctx) {      
    ctx.beginPath();      
    ctx.arc(this.x, this.y, this.width / 2, 0, Math.PI * 2, true);      
    ctx.fillStyle = 'blue';      
    ctx.fill();      
  }    
}      
function drawPlayer() {      
    const headRadius = player.width / 2;      
    const bodyRadius = player.width * 3 / 4;      
      
      // 頭の部分を描画      
      ctx.beginPath();      
      ctx.arc(player.x + player.width / 2, player.y + headRadius, headRadius, 0, Math.PI * 2);      
      ctx.fillStyle = 'red';      
      ctx.fill();      
      ctx.closePath();      
        
      // 白目を描画      
      const eyeRadius = headRadius / 4;      
      const eyeOffsetX = headRadius / 3;      
      const eyeOffsetY = headRadius / 3;      
      ctx.beginPath();      
      ctx.arc(player.x + player.width / 2 - eyeOffsetX, player.y + eyeOffsetY, eyeRadius, 0, Math.PI * 2);      
      ctx.arc(player.x + player.width / 2 + eyeOffsetX, player.y + eyeOffsetY, eyeRadius, 0, Math.PI * 2);      
      ctx.fillStyle = 'white';      
      ctx.fill();      
      ctx.closePath();      
        
      // 黒目を描画      
      const pupilRadius = eyeRadius / 2;      
      ctx.beginPath();      
      ctx.arc(player.x + player.width / 2 - eyeOffsetX, player.y + eyeOffsetY, pupilRadius, 0, Math.PI * 2);      
      ctx.arc(player.x + player.width / 2 + eyeOffsetX, player.y + eyeOffsetY, pupilRadius, 0, Math.PI * 2);      
      ctx.fillStyle = 'black';      
      ctx.fill();      
      ctx.closePath();      
        
  // 体の部分を描画      
  ctx.beginPath();      
  ctx.arc(player.x + player.width / 2, player.y + player.height / 2 + bodyRadius / 2, bodyRadius, 0, Math.PI * 2);      
  ctx.fillStyle = 'red';      
  ctx.fill();      
  ctx.closePath();      
    
  // 腕を描画      
  ctx.beginPath();      
  ctx.moveTo(player.x + player.width / 2 - bodyRadius, player.y + player.height / 2);      
  ctx.lineTo(player.x - bodyRadius, player.y + player.height);      
  ctx.moveTo(player.x + player.width / 2 + bodyRadius, player.y + player.height / 2);      
  ctx.lineTo(player.x + player.width + bodyRadius, player.y + player.height);      
  ctx.strokeStyle = 'red';      
  ctx.stroke();      
  ctx.closePath();      
    
  // 脚を描画      
  ctx.beginPath();      
  ctx.moveTo(player.x + player.width / 2, player.y + player.height / 2 + bodyRadius / 2);      
  ctx.lineTo(player.x, player.y + player.height * 2);      
  ctx.moveTo(player.x + player.width / 2, player.y + player.height / 2 + bodyRadius / 2);      
  ctx.lineTo(player.x + player.width, player.y + player.height * 2);      
  ctx.strokeStyle = 'red';      
  ctx.stroke();      
  ctx.closePath();      
}      
    
// バリアの状態を管理する変数を追加      
let barrierActive = false;      
let barrierTimeout = null;      
      
// 無敵状態を管理する変数を追加      
let invincible = false;      
let invincibleTimeout = null;      
    
// バリアを描画する関数を追加      
function drawBarrier() {      
    if (barrierActive) {      
        ctx.beginPath();      
        ctx.arc(player.x + player.width / 2, player.y + player.height / 2, player.width * 1.5, 0, Math.PI * 2);      
        ctx.strokeStyle = 'yellow';      
        ctx.lineWidth = 5;      
        ctx.stroke();      
        ctx.closePath();      
    }      
}      
      
// ボタンがクリックされたときの処理を追加      
window.onload = () => {        
  const barrierButton = document.getElementById('barrierButton');      
  barrierButton.addEventListener('click', () => {        
      // 既にバリアが展開されている場合は何もしない        
      if (barrierActive) return;        
      
      // バリアを展開し、30秒後に無敵状態を解除        
      barrierActive = true;        
      clearTimeout(barrierTimeout);        
      barrierTimeout = setTimeout(() => {        
          barrierActive = false;        
      }, 30 * 1000);        
      
      // バリア展開ボタンを30秒間グレーアウトして押せなくする      
      barrierButton.disabled = true;      
      
      // ★ バリア展開ボタンの色を30秒間グレーにする      
      barrierButton.classList.add('disabled');      
      setTimeout(() => {      
        barrierButton.disabled = false;      
        barrierButton.classList.remove('disabled'); // ★ 追加      
      }, 30 * 1000);      
  });        
};        
    
    
// 雨粒とプレイヤーの衝突判定で、バリアが展開されている場合は無敵状態にする      
function checkRainDropCollision() {      
  rainDrops.forEach((drop) => {      
      const dx = drop.x - (player.x + player.width / 2);      
      const dy = drop.y - (player.y + player.height / 2);      
      const distance = Math.sqrt(dx * dx + dy * dy);      
      const dropRadius = drop.width / 2;      
      const playerRadius = player.width / 2;      
    
      // 雨粒とプレイヤーが衝突し、バリアが展開されていない場合      
      if (distance < dropRadius + playerRadius && !barrierActive) {      
          // ゲームオーバー処理を呼び出す      
          // 例: gameOver = true; または、関数を呼び出す      
          // あなたのゲームで使用されているゲームオーバー処理に置き換えてください。      
          gameOver = true;      
      }      
  });      
}      
    
      
function drawRaindrops() {      
  for (let i = 0; i < raindrops.length; i++) {      
      let raindrop = raindrops[i];      
      raindrop.draw(ctx);      
  }      
}      
    
function spawnRaindrop() {      
  const x = Math.random() * (canvas.width - 20);      
  const speed = 2 * difficulty;      
  const raindrop = new Raindrop(x, -20, 20, 20, speed);      
  raindrops.push(raindrop);      
}      
      
function updateRaindrops() {      
    for (let i = 0; i < raindrops.length; i++) {      
        let raindrop = raindrops[i];      
        raindrop.y += raindropSpeed;      
      
        if (raindrop.y > canvas.height) {      
            raindrops.splice(i, 1);      
            i--;      
        }      
    }      
}      
      
function addRaindrop() {      
  const x = Math.random() * (canvas.width - 20);      
  const speed = 2 * difficulty;      
  const minSize = 10; // 雨粒の最小サイズ      
  const maxSize = 20; // 雨粒の最大サイズ      
  const size = Math.random() * (maxSize - minSize) + minSize;      
  const raindrop = new Raindrop(x, -20, size, size, speed);      
  raindrops.push(raindrop);      
}      
    
      
function handleInput() {      
    window.addEventListener('keydown', (e) => {      
        if (e.key === 'ArrowLeft' && player.x - player.speed >= 0) {      
            player.x -= player.speed;      
        } else if (e.key === 'ArrowRight' && player.x + player.width + player.speed <= canvas.width) {      
            player.x += player.speed;      
        }      
    });

}      
    
      
function checkCollision() {      
    for (let i = 0; i < raindrops.length; i++) {      
        let raindrop = raindrops[i];      
        if (player.x < raindrop.x + raindrop.width &&      
            player.x + player.width > raindrop.x &&      
            player.y < raindrop.y + raindrop.height &&      
            player.y + player.height > raindrop.y) {      
      
            if (barrierActive) {      
                // バリアが展開されている場合、バリアを無効にし、タイマーをクリア      
                barrierActive = false;      
                clearTimeout(barrierTimeout);      
      
                // 3秒間無敵状態にする      
                invincible = true;      
                clearTimeout(invincibleTimeout);      
                invincibleTimeout = setTimeout(() => {      
                    invincible = false;      
                }, 3 * 1000);      
      
            } else if (!invincible) {      
                // バリアが展開されておらず、無敵状態でもない場合にのみゲームオーバー処理を呼び出す      
                gameOver();      
                return;      
            }      
        }      
    }      
}      
    
    
    
function gameOver() {      
  gameOverModal.style.display = 'flex';      
}      
    
function drawCloud(x, y, size) {      
  ctx.beginPath();      
  ctx.arc(x, y, size, 0, Math.PI * 2);      
  ctx.arc(x + size, y, size, 0, Math.PI * 2);      
  ctx.arc(x + size / 2, y - size / 2, size, 0, Math.PI * 2);      
  ctx.fillStyle = 'white';      
  ctx.fill();      
  ctx.closePath();      
}      
      
function draw() {      
      // 以下を追加  
  if (player.movingLeft && player.x - player.speed >= 0) {  
    player.x -= player.speed;  
  } else if (player.movingRight && player.x + player.width + player.speed <= canvas.width) {  
    player.x += player.speed;  
  }  
  
        
      // 以下、以前のコードを続ける (雨粒、プレイヤー、スコアの描画)     
    
    ctx.clearRect(0, 0, canvas.width, canvas.height);      
      
      // 水色の空を描画      
      ctx.beginPath();      
      ctx.rect(0, 0, canvas.width, canvas.height / 3);      
      ctx.fillStyle = 'lightblue';      
      ctx.fill();      
      ctx.closePath();      
    
    // 白い雲を描画      
    drawCloud(50, 50, 20);      
    drawCloud(200, 30, 25);      
    drawCloud(350, 70, 30);      
    
    
    drawPlayer();      
    drawRaindrops();      
      
    updateRaindrops();      
    checkCollision();      
      
    if (Math.random() < 1 / raindropFrequency) {      
        addRaindrop();      
    }      
      
    drawBarrier();      
    
    requestAnimationFrame(draw);      
}      
    
// ... draw()関数の後に追加      
setInterval(spawnRaindrop, 1000); // 1000ミリ秒（1秒）ごとに雨滴を生成      
      
// 難易度アップ機能    
setInterval(increaseDifficulty, difficultyInterval);      
    
    
function updateScore() {      
  score += 10;      
  scoreElement.textContent = `Score: ${score}`;      
}      
    
setInterval(updateScore, 10000); // 10秒ごとにスコアを更新      
    
function increaseDifficulty() {      
  difficulty += 25.0; // 難易度を上げる量を調整      
}      
    
handleInput();      
    
// ... 以下をhandleInput()関数の後に追加      
restartButton.addEventListener('click', () => {      
  document.location.reload();      
});      

const moveLeftButton = document.getElementById('moveLeftButton');  
const moveRightButton = document.getElementById('moveRightButton');  
  
moveLeftButton.addEventListener('touchstart', () => {  
  player.movingLeft = true;  
});  
  
moveLeftButton.addEventListener('touchend', () => {  
  player.movingLeft = false;  
});  
  
moveRightButton.addEventListener('touchstart', () => {  
  player.movingRight = true;  
});  
  
moveRightButton.addEventListener('touchend', () => {  
  player.movingRight = false;  
});  

moveLeftButton.addEventListener('mousedown', () => {  
  player.movingLeft = true;  
});  
  
moveLeftButton.addEventListener('mouseup', () => {  
  player.movingLeft = false;  
});  
  
moveRightButton.addEventListener('mousedown', () => {  
  player.movingRight = true;  
});  
  
moveRightButton.addEventListener('mouseup', () => {  
  player.movingRight = false;  
});  
    
draw();      
  