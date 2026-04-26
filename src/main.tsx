import { Devvit, useState } from '@devvit/public-api';

Devvit.configure({
  redditAPI: true,
  redis: true,
});

// A simplified "Challenge" game using supported click interactions
Devvit.addCustomPostType({
  name: 'Mouse Cursor Challenge',
  height: 'tall',
  render: (context) => {
    const [gameState, setGameState] = useState<'start' | 'playing' | 'gameover' | 'win'>('start');
    const [level, setLevel] = useState(1);

    // Levels definitions (obstacle positions)
    const levels = [
      { walls: [{ top: 30, left: 40, w: 20, h: 40 }] },
      { walls: [
        { top: 0, left: 20, w: 10, h: 70 },
        { top: 30, left: 70, w: 10, h: 70 }
      ]},
      { walls: [
        { top: 20, left: 20, w: 60, h: 10 },
        { top: 70, left: 20, w: 60, h: 10 },
        { top: 20, left: 20, w: 10, h: 60 },
      ]}
    ];

    const currentLevel = levels[level - 1] || levels[0];

    const resetGame = () => {
      setLevel(1);
      setGameState('playing');
    };

    const handleWin = () => {
      if (level < levels.length) {
        setLevel((prev) => prev + 1);
        context.ui.showToast({ text: 'Level Complete!' });
      } else {
        setGameState('win');
      }
    };

    const handleLose = () => {
      setGameState('gameover');
    };

    // Start Screen
    if (gameState === 'start') {
      return (
        <vstack height="100%" alignment="center middle" gap="medium">
          <text size="xlarge" weight="bold">Pathfinder Challenge</text>
          <text>Don't click the dark blocks!</text>
          <button onPress={() => setGameState('playing')}>Start Game</button>
        </vstack>
      );
    }

    // Game Over Screen
    if (gameState === 'gameover') {
      return (
        <vstack height="100%" alignment="center middle" gap="medium" backgroundColor="#fee2e2">
          <text color="red" size="xlarge" weight="bold">HIT A WALL!</text>
          <button onPress={resetGame}>Try Again</button>
        </vstack>
      );
    }

    // Win Screen
    if (gameState === 'win') {
      return (
        <vstack height="100%" alignment="center middle" gap="medium" backgroundColor="#f0fdf4">
          <text color="green" size="xlarge" weight="bold">CONGRATULATIONS!</text>
          <text>You reached the end.</text>
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
             <text size="small">Click the Green Goal</text>
           </hstack>
        </vstack>

        {/* Walls - If clicked, trigger game over */}
        {currentLevel.walls.map((wall, index) => (
          <hstack
            key={`wall-${index}`}
            onPress={handleLose}
            backgroundColor="#1e293b"
            // Use Devvit.Offset units or percentage strings for positional props
            position="absolute"
            top={`${wall.top}%` as any}
            left={`${wall.left}%` as any}
            width={`${wall.w}%` as any}
            height={`${wall.h}%` as any}
          />
        ))}

        {/* Goal Area */}
        <vstack
          onPress={handleWin}
          backgroundColor="#22c55e"
          alignment="center middle"
          position="absolute"
          bottom={10}
          right={10}
          width="64px"
          height="64px"
        >
          <text color="white" weight="bold">GOAL</text>
        </vstack>

        {/* Start Point Marker */}
        <vstack
          position="absolute"
          top={50}
          left={10}
          width="60px"
          height="60px"
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
