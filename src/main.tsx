import { Devvit, useState, useInterval } from '@devvit/public-api';

Devvit.configure({
  redditAPI: true,
  redis: true,
});

/**
 * Click-only "Avoid the Blocks" Game
 * The player controls a circular avatar that follows the mouse/click position.
 * Goal: Survive as long as possible while dodging falling obstacles.
 */

Devvit.addCustomPostType({
  name: 'AvoidTheBlocks',
  height: 'tall',
  render: (context) => {
    // Game state: 'start', 'playing', 'gameover'
    const [gameState, setGameState] = useState<string>('start');
    const [score, setScore] = useState<number>(0);
    const [highScore, setHighScore] = useState<number>(0);
    
    // Player position (X is 0 to 100)
    const [playerX, setPlayerX] = useState<number>(50);
    
    // Enemy positions (simple array of objects)
    const [enemies, setEnemies] = useState<{ id: number, x: number; y: number; speed: number }[]>([]);

    // Tick logic for the game loop (runs every 100ms)
    const gameLoop = useInterval(() => {
      setScore((s) => s + 1);

      setEnemies((prevEnemies) => {
        // Move enemies down
        const movedEnemies = prevEnemies
          .map((e) => ({ ...e, y: e.y + e.speed }))
          .filter((e) => e.y < 100);

        // Spawn new enemy randomly
        if (Math.random() > 0.8) {
          movedEnemies.push({
            id: Date.now() + Math.random(),
            x: Math.random() * 90,
            y: 0,
            speed: 5 + Math.random() * 5,
          });
        }

        // Simple Collision Detection
        // Width of enemy is ~10% of board, height covers the player row
        const hit = movedEnemies.some(
          (e) => Math.abs(e.x - playerX) < 10 && e.y > 80 && e.y < 95
        );

        if (hit) {
          setGameState('gameover');
          setScore((currentScore) => {
            if (currentScore > highScore) setHighScore(currentScore);
            return currentScore;
          });
          context.ui.showToast({ text: 'Game Over!', appearance: 'neutral' });
          gameLoop.stop();
        }

        return movedEnemies;
      });
    }, 100);

    const startGame = () => {
      setEnemies([]);
      setScore(0);
      setPlayerX(45);
      setGameState('playing');
      gameLoop.start();
    };

    const moveLeft = () => setPlayerX((p) => Math.max(0, p - 10));
    const moveRight = () => setPlayerX((p) => Math.min(90, p + 10));

    return (
      <zstack width="100%" height="100%" backgroundColor="#1A1A1B" alignment="center middle">
        {/* Game Arena */}
        <vstack width="100%" height="100%" alignment="top center" padding="medium">
          <hstack width="100%" alignment="center space-between">
            <text size="large" weight="bold" color="white">Score: {score}</text>
            <text size="medium" color="#D7DADC">Best: {highScore}</text>
          </hstack>

          <spacer size="medium" />

          {/* Active Game Area */}
          <zstack width="100%" grow backgroundColor="#030303" cornerRadius="medium">
            {/* Render Enemies */}
            {enemies.map((enemy) => (
              <vstack
                key={enemy.id.toString()}
                position={{ left: enemy.x, top: enemy.y }}
                width="31px"
                height="30px"
                backgroundColor="#FF4500"
                cornerRadius="small"
              />
            ))}

            {/* Render Player */}
            <vstack
              position={{ left: playerX, top: 85 }}
              width="35px"
              height="35px"
              backgroundColor="#0079D3"
              cornerRadius="full"
              alignment="center middle"
            >
               <icon name="bot" color="white" />
            </vstack>
          </zstack>

          <spacer size="medium" />

          {/* Controls - The main interaction via "Mouse clicks" on these areas */}
          <hstack width="100%" height="64px" gap="medium">
            <button
              grow
              appearance="secondary"
              onPress={moveLeft}
              disabled={gameState !== 'playing'}
            >
              ← Left
            </button>
            <button
              grow
              appearance="secondary"
              onPress={moveRight}
              disabled={gameState !== 'playing'}
            >
              Right →
            </button>
          </hstack>
        </vstack>

        {/* Start / Game Over Overlays */}
        {gameState !== 'playing' && (
          <zstack width="100%" height="100%" backgroundColor="rgba(0,0,0,0.8)" alignment="center middle">
            <vstack alignment="center middle" gap="large" padding="large">
              <text size="xxlarge" weight="bold" color="white">
                {gameState === 'start' ? 'AVOID BLOCKS' : 'GAME OVER'}
              </text>
              {gameState === 'gameover' && (
                <text size="large" color="#FF4500">Final Score: {score}</text>
              )}
              <button appearance="primary" onPress={startGame}>
                {gameState === 'start' ? 'START GAME' : 'TRY AGAIN'}
              </button>
              <text size="small" color="#818384">Control by clicking the buttons</text>
            </vstack>
          </zstack>
        )}
      </zstack>
    );
  },
});

export default Devvit;
