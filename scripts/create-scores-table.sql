-- Create the scores table with your exact format
CREATE TABLE IF NOT EXISTS scores (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  score DECIMAL(10,1) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create an index on score for faster leaderboard queries
CREATE INDEX IF NOT EXISTS idx_scores_score ON scores(score DESC);

-- Create an index on created_at for time-based queries
CREATE INDEX IF NOT EXISTS idx_scores_created_at ON scores(created_at DESC);
