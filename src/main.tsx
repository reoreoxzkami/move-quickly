import { Devvit, useState } from '@devvit/public-api';

Devvit.configure({
  redditAPI: true,
  redis: true,
});

// A simple "Avoid the Walls" mouse-only game
Devvit.addCustomPostType({
  name: 'Mouse Cursor Challenge',
  height: 'tall',
  render: (context) => {
    const [gameState, setGameState] = useState<'start' | 'playing' | 'gameover' | 'win'>('start');
    const [level, setLevel] = useState(1);

    // Levels definitions (obstacle positions)
    const levels = [
      { goal: "Right", walls: [{ top: 30, left: 40, w: 20, h: 40 }] },
      { 
        goal: "Bottom", 
        walls: [
          { top: 0, left: 20, w: 10, h: 70 },
          { top: 30, left: 70, w: 10, h: 70 }
        ]
      },
      { 
        goal: "Center", 
        walls: [
          { top: 20, left: 20, w: 60, h: 10 },
          { top: 70, left: 20, w: 60, h: 10 },
          { top: 20, left: 20, w: 10, h: 60 }
        ]
      }
    ];

    const currentLevel = levels[level - 1] || levels[0];

    const resetGame = () => {
      setLevel(1);
      setGameState('playing');
    };

    const handleWin = () => {
      if (level < levels.length) {
        setLevel((prev) => prev + 1);
      } else {
        setGameState('win');
      }
    };

    // Start Screen
    if (gameState === 'start') {
      return (
        <vstack height="100%" alignment="center middle" gap="medium">
          <text size="xlarge" weight="bold">Cursor Challenge</text>
          <text>Don't touch the dark blocks!</text>
          <button onPress={() => setGameState('playing')}>Start Game</button>
        </vstack>
      );
    }

    // Game Over Screen
    if (gameState === 'gameover') {
      return (
        <vstack height="100%" alignment="center middle" gap="medium" backgroundColor="#fee2e2">
          <text color="red" size="xlarge" weight="bold">GAME OVER</text>
          <button onPress={resetGame}>Try Again</button>
        </vstack>
      );
    }

    // Win Screen
    if (gameState === 'win') {
      return (
        <vstack height="100%" alignment="center middle" gap="medium" backgroundColor="#f0fdf4">
          <text color="green" size="xlarge" weight="bold">CONGRATULATIONS!</text>
          <text>You mastered the cursor.</text>
          <button onPress={resetGame}>Play Again</button>
        </vstack>
      );
    }

    // Main Gameplay
    return (
      <zstack height="100%" width="100%" backgroundColor="#f8fafc">
        {/* Background / Safety Area */}
        <vstack height="100%" width="100%" padding="medium">
           <hstack width="100%" alignment="middle space-between">
             <text size="large" weight="bold">Level {level}</text>
             <text size="small">Navigate to the Goal</text>
           </hstack>
        </vstack>

        {/* Walls - If hovered, trigger game over */}
        {currentLevel.walls.map((wall, index) => (
          <hstack
            key={`wall-${index}`}
            onMouseEnter={() => setGameState('gameover')}
            backgroundColor="#1e293b"
            position="absolute"
            top={`${wall.top}%`}
            left={`${wall.left}%`}
            width={`${wall.w}%`}
            height={`${wall.h}%`}
          />
        ))}

        {/* Goal Area */}
        <vstack
          onMouseEnter={handleWin}
          backgroundColor="#22c55e"
          alignment="center middle"
          position="absolute"
          top="80%"
          left="70%"
          width="64px"
          height="64px"
        >
          <text color="white" weight="bold">GOAL</text>
        </vstack>

        {/* Start Point Marker */}
        <vstack
          position="absolute"
          top="10%"
          left="5%"
          width="40px"
          height="40px"
          border="thin"
          alignment="center middle"
        >
           <text size="xsmall">START</text>
        </vstack>
      </zstack>
    );
  },
});

export default Devvit;
