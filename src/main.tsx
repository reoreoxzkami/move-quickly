import { Devvit, useState, useAsync } from '@devvit/public-api';

Devvit.configure({
  redditAPI: true,
  redis: true,
});

// Define the custom post type for the Clicker Game
Devvit.addCustomPostType({
  name: 'ClickerGame',
  height: 'tall',
  render: (context) => {
    // 1. STATE INITIALIZATION
    // Track the total score (clicks)
    const [score, setScore] = useState(async () => {
      const val = await context.redis.get(`score:${context.postId}`);
      return val ? parseInt(val) : 0;
    });

    // Track the multiplier level
    const [multiplier, setMultiplier] = useState(async () => {
      const val = await context.redis.get(`mult:${context.postId}`);
      return val ? parseInt(val) : 1;
    });

    // Async state for the global leaderboard (top 5)
    const { data: leaderboard, loading: leaderLoading } = useAsync(async () => {
      const topScores = await context.redis.zRange(`leaderboard:${context.postId}`, 0, 4, { by: 'rank', reverse: true });
      return topScores;
    });

    // 2. HELPER FUNCTIONS
    const upgradeCost = multiplier * 50;

    const handleButtonClick = async () => {
      const newScore = score + multiplier;
      setScore(newScore);
      
      // Update persistent storage (Redis)
      await context.redis.set(`score:${context.postId}`, newScore.toString());
      
      // Update leaderboard for the current user
      const user = await context.reddit.getCurrentUser();
      const username = user?.username ?? 'Anonymous';
      await context.redis.zAdd(`leaderboard:${context.postId}`, { member: username, score: newScore });
    };

    const handleUpgrade = async () => {
      if (score >= upgradeCost) {
        const nextScore = score - upgradeCost;
        const nextMult = multiplier + 1;
        
        setScore(nextScore);
        setMultiplier(nextMult);

        await context.redis.set(`score:${context.postId}`, nextScore.toString());
        await context.redis.set(`mult:${context.postId}`, nextMult.toString());
        
        context.ui.showToast({ text: `Upgrade successful! Power: ${nextMult}`, appearance: 'success' });
      } else {
        context.ui.showToast({ text: 'Not enough points!', appearance: 'neutral' });
      }
    };

    // 3. UI RENDERING
    return (
      <vstack height="100%" width="100%" gap="medium" padding="large" alignment="center middle" backgroundColor="#1A1A1B">
        <text size="xxlarge" weight="bold" color="white">
          Score: {score}
        </text>
        <text size="medium" color="#D7DADC">
          Multiplier: x{multiplier}
        </text>

        <spacer size="medium" />

        {/* Main Clicking Button */}
        <button
          size="large"
          appearance="primary"
          onPress={handleButtonClick}
          width="200px"
        >
          CLICK! (+{multiplier})
        </button>

        <spacer size="small" />

        {/* Upgrade Button */}
        <button
          size="medium"
          appearance="secondary"
          onPress={handleUpgrade}
          disabled={score < upgradeCost}
        >
          Upgrade Cost: {upgradeCost}
        </button>

        <spacer size="large" />

        {/* Leaderboard Section */}
        <vstack width="100%" backgroundColor="#272729" padding="medium" cornerRadius="medium" gap="small">
          <text size="small" weight="bold" color="#818384">TOP CLICKERS</text>
          {!leaderLoading && leaderboard ? (
            leaderboard.map((entry, index) => (
              <hstack key={index.toString()} width="100%" alignment="middle spread">
                <text size="small" color="white">{index + 1}. {entry.member}</text>
                <text size="small" weight="bold" color="#FF4500">{entry.score}</text>
              </hstack>
            ))
          ) : (
            <text size="small" color="white">Loading leaderboard...</text>
          )}
        </vstack>
      </vstack>
    );
  },
});

// Menu item to create the game post in a subreddit
Devvit.addMenuItem({
  label: 'Create Clicker Game',
  location: 'subreddit',
  onPress: async (_event, context) => {
    const { reddit, ui } = context;
    const subreddit = await reddit.getCurrentSubreddit();
    await reddit.submitPost({
      title: 'Reddit Clicker Game!',
      subredditName: subreddit.name,
      preview: (
        <vstack alignment="center middle">
          <text>Loading Clicker Game...</text>
        </vstack>
      ),
    });
    ui.showToast({ text: 'Game posted!', appearance: 'success' });
  },
});

export default Devvit;
