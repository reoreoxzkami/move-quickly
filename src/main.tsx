import { Devvit, useState, useInterval } from '@devvit/public-api';

Devvit.configure({
  redditAPI: true,
  redis: true,
});

/**
 * Click-only "Avoid the Blocks" Game
 * The player controls a circular avatar that moves via buttons.
 * Goal: Survive as long as possible while dodging falling obstacles.
 */

Devvit.addCustomPostType({
  name: 'AvoidTheBlocks',
  height: 'tall',
  render: (context) => {
    // Game state: 'start' | 'playing' | 'gameover'
    const [gameState, setGameState] = useState<string>('start');
    const [score, setScore] = useState<number>(0);
    const [highScore, setHighScore] = useState<number>(0);
    
    // Player position (X is 0 to 90)
    const [playerX, setPlayerX] = useState<number>(45);
    
    // Enemy positions
    const [enemies, setEnemies] = useState<{ id: string; x: number; y: number; speed: number }[]>([]);

    // Tick logic for the game loop
    const timer = useInterval(() => {
      setScore((s) => s + 1);

      setEnemies((prevEnemies) => {
        // Move enemies down
        const movedEnemies = prevEnemies
          .map((e) => ({ ...e, y: e.y + e.speed }))
          .filter((e) => e.y < 100);

        // Spawn new enemy randomly
        if (Math.random() > 0.8) {
          movedEnemies.push({
            id: Math.random().toString(36).substring(7),
            x: Math.random() * 90,
            y: 0,
            speed: 5 + Math.random() * 5,
          });
        }

        // Collision Detection
        const hit = movedEnemies.some(
          (e) => Math.abs(e.x - playerX) < 10 && e.y > 80 && e.y < 95
        );

        if (hit) {
          setGameState('gameover');
          timer.stop();
          if (score > highScore) {
            setHighScore(score);
          }
          context.ui.showToast({ text: 'Game Over!', appearance: 'neutral' });
        }

        return movedEnemies;
      });
    }, 100);

    const startGame = () => {
      setEnemies([]);
      setScore(0);
      setPlayerX(45);
      setGameState('playing');
      timer.start();
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
                key={enemy.id}
                position={{ left: enemy.x, top: enemy.y }}
                width="30px"
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
               <icon name="bot" color="white" size="small" />
            </vstack>
          </zstack>

          <spacer size="medium" />

          {/* Controls */}
          <hstack width="100%" height="60px" gap="medium">
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
                <text size="large" color="#FF4500">Score: {score}</text>
              )}
              <button appearance="primary" onPress={startGame}>
                {gameState === 'start' ? 'START GAME' : 'TRY AGAIN'}
              </button>
              <text size="small" color="#818384">Dodge the falling orange blocks!</text>
            </vstack>
          </zstack>
        )}
      </zstack>
    );
  },
});

export default Devvit;
