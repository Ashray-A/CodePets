import api from "./api";

class GitHubService {
  // Sync recent GitHub commits for the authenticated user
  static async syncCommits() {
    try {
      const response = await api.post("/activities/sync-github");
      return response.data;
    } catch (error) {
      console.error("Error syncing GitHub commits:", error);
      throw error;
    }
  }

  // Automatic GitHub sync (lighter weight)
  static async autoSyncCommits() {
    try {
      const response = await api.post("/activities/auto-sync-github");
      return response.data;
    } catch (error) {
      console.error("Error auto-syncing GitHub commits:", error);
      throw error;
    }
  }

  // Get GitHub activity stats
  static async getGitHubStats() {
    try {
      const response = await api.get("/activities/github-stats");
      return response.data;
    } catch (error) {
      console.error("Error fetching GitHub stats:", error);
      throw error;
    }
  }

  // Manual trigger to fetch commits from a specific repository
  static async syncRepository(repoOwner, repoName) {
    try {
      const response = await api.post("/activities/sync-repository", {
        owner: repoOwner,
        repository: repoName,
      });
      return response.data;
    } catch (error) {
      console.error("Error syncing repository:", error);
      throw error;
    }
  }

  // Get list of user's repositories
  static async getUserRepositories() {
    try {
      const response = await api.get("/activities/repositories");
      return response.data;
    } catch (error) {
      console.error("Error fetching repositories:", error);
      throw error;
    }
  }

  // Get coding streaks and achievements
  static async getStreaks() {
    try {
      const response = await api.get("/activities/streaks");
      return response.data;
    } catch (error) {
      console.error("Error fetching streaks:", error);
      throw error;
    }
  }

  // Real-time GitHub sync with enhanced error handling
  static async syncCommitsRealtime(forceSync = false) {
    try {
      const response = await api.post("/activities/sync-github-realtime", {
        forceSync,
      });
      return response.data;
    } catch (error) {
      console.error("Error with real-time GitHub sync:", error);
      throw error;
    }
  }
}

export default GitHubService;
