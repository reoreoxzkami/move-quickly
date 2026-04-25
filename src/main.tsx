import { Devvit, useState, useInterval } from '@devvit/public-api';

Devvit.configure({
  redditAPI: true,
  redis: true,
});

// A simple "Avoid the Walls" game playable with just a cursor/tap
Devvit.addCustomPostType({
  name: 'CursorGame',
  height: 'tall',
  render: (context) => {
    // Game State
    const [score, setScore] = useState(0);
    const [highScore, setHighScore] = useState(0);
    const [gameState, setGameState] = useState<'start' | 'playing' | 'gameover'>('start');
    
    // Player horizontal position (percentage 0-100)
    const [playerPos, setPlayerPos] = useState(50);
    
    // Wall positions: array of { id, y (0-100), gapStart (0-70) }
    const [walls, setWalls] = useState([
      { id: 0, y: 0, gapStart: 40 },
      { id: 1, y: -40, gapStart: 20 },
      { id: 2, y: -80, gapStart: 50 },
    ]);

    // Game loop running every 100ms
    const interval = useInterval(() => {
      let scoreIncrement = 0;
      let collisionDetected = false;

      setWalls((prevWalls) => {
        return prevWalls.map((wall) => {
          let newY = wall.y + 5; 
          
          // Collision check: when wall is at player area (roughly y=80 to 90)
          if (newY >= 80 && newY <= 90) {
            const gapEnd = wall.gapStart + 30;
            // Player is ~5-10% wide relative to the field
            if (playerPos < wall.gapStart || playerPos > gapEnd - 5) {
              collisionDetected = true;
            }
          }

          // Reset wall to top and randomize gap
          if (newY > 100) {
            scoreIncrement++;
            return {
              id: wall.id,
              y: 0,
              gapStart: Math.floor(Math.random() * 70),
            };
          }
          return { ...wall, y: newY };
        });
      });

      if (collisionDetected) {
        setGameState('gameover');
        if (score > highScore) {
          setHighScore(score);
        }
        context.ui.showToast({ text: 'Game Over!', appearance: 'neutral' });
        interval.stop();
      } else if (scoreIncrement > 0) {
        setScore((s) => s + scoreIncrement);
      }
    }, 100);

    const moveLeft = () => setPlayerPos((p) => Math.max(0, p - 10));
    const moveRight = () => setPlayerPos((p) => Math.min(90, p + 10));
    
    const startGame = () => {
      setScore(0);
      setPlayerPos(50);
      setWalls([
        { id: 0, y: 0, gapStart: 40 },
        { id: 1, y: -40, gapStart: 20 },
        { id: 2, y: -80, gapStart: 50 },
      ]);
      setGameState('playing');
      interval.start();
    };

    return (
      <zstack width="100%" height="100%" backgroundColor="#1A1A1B">
        {/* Game Field */}
        <vstack width="100%" height="100%" alignment="top center">
          {walls.map((wall) => (
            <hstack 
              key={wall.id.toString()}
              width="100%" 
              height="20px" 
              position="absolute"
              top={wall.y + "%" as any}
            >
              {/* Left Wall Part */}
              <hstack width={wall.gapStart + "%" as any} height="100%" backgroundColor="#FF4500" />
              {/* Gap */}
              <spacer width="30%" height="100%" />
              {/* Right Wall Part */}
              <hstack grow height="100%" backgroundColor="#FF4500" />
            </hstack>
          ))}
        </vstack>

        {/* Player Character */}
        <vstack 
          width="100%" 
          height="100%" 
          alignment="top left" 
        >
          <hstack 
            width="32px" 
            height="32px" 
            backgroundColor="#0079D3"
            cornerRadius="full"
            position="absolute"
            top="85%"
            left={playerPos + "%" as any}
          />
        </vstack>

        {/* UI Overlay */}
        <vstack width="100%" height="100%" alignment="center middle" padding="medium">
          {gameState === 'start' && (
            <vstack alignment="center middle" backgroundColor="rgba(0,0,0,0.8)" padding="large" cornerRadius="medium" gap="medium">
              <text size="xlarge" weight="bold" color="white">CURSOR DODGE</text>
              <text color="white">Avoid the orange walls!</text>
              <button appearance="primary" onPress={startGame}>START GAME</button>
            </vstack>
          )}

          {gameState === 'playing' && (
            <vstack width="100%" height="100%" alignment="bottom center">
              <hstack width="100%" gap="large" alignment="center middle" padding="medium" grow>
                <button width="45%" onPress={moveLeft} icon="caret-left" appearance="secondary">LEFT</button>
                <button width="45%" onPress={moveRight} icon="caret-right" appearance="secondary">RIGHT</button>
              </hstack>
              <hstack width="100%" alignment="center middle" padding="small" backgroundColor="rgba(0,0,0,0.5)">
                <text weight="bold" color="white">SCORE: {score}</text>
              </hstack>
            </vstack>
          )}

          {gameState === 'gameover' && (
            <vstack alignment="center middle" backgroundColor="rgba(0,0,0,0.8)" padding="large" cornerRadius="medium" gap="medium">
              <text size="xlarge" weight="bold" color="#FF4500">GAME OVER</text>
              <text color="white">Score: {score}</text>
              <text color="white">Best: {highScore}</text>
              <button appearance="primary" onPress={startGame}>TRY AGAIN</button>
            </vstack>
          )}
        </vstack>
      </zstack>
    );
  },
});

export default Devvit;
