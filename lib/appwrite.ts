import {
  Avatars,
  Client,
  Account,
  OAuthProvider,
  ID,
  Databases,
  Query,
  Permission,
  Role,
} from "react-native-appwrite";
import * as Linking from "expo-linking";
import * as WebBrowser from "expo-web-browser";
import "react-native-url-polyfill/auto";

export const config = {
  Platform: "com.tsx.myvotacion",
  endpoint:
    process.env.EXPO_PUBLIC_APPWRITE_ENDPOINT || "https://cloud.appwrite.io/v1",
  projectId:
    process.env.EXPO_PUBLIC_APPWRITE_PROJECT_ID || "67a2f6d1001f50923ad0",
  databaseId: "67a616a8001b6306e93e",
  userCollectionId: "67a61c1b00354887b26b",
  pollscollection: "67a62338002b653e3edd",
  votescollection: "67a622d50007c255f6c9",
};
export const client = new Client();
client
  .setEndpoint(config.endpoint!)
  .setProject(config.projectId!)
  .setPlatform(config.Platform!);

export const avatar = new Avatars(client);
export const account = new Account(client);
export const databases = new Databases(client);

interface CreateUserParams {
  email: string;
  password: string;
  username?: string;
}

interface NewUser {
  accountId: string;
  email: string;
  username?: string;
  avatar: string;
}

export async function emailPasswordLogin(email: string, password: string) {
  const url = `${config.endpoint}/account/sessions/email`;

  const options = {
    method: "POST",
    headers: {
      "x-appwrite-project": config.projectId,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ email, password }),
  };

  const response = await fetch(url, options);

  if (!response.ok) {
    const errorData = await response.json().catch(() => null);
    const errorMessage =
      errorData?.message || "Failed to login with email/password";
    throw new Error(errorMessage);
  }

  return response.json();
}

export async function createEmailUser({
  email,
  password,
  username,
}: CreateUserParams) {
  try {
    console.log(" Creating Appwrite account...");

    const userId = ID.unique();

    const newAccount = await account.create(userId, email, password, username);

    console.log(" Account created:", newAccount);

    if (!newAccount || !newAccount.$id) {
      throw new Error("User creation failed.");
    }

    const avatarUrl = avatar.getInitials(username).toString();
    console.log("🖼 Avatar generated:", avatarUrl);

    console.log("📦 Storing user in database...");
    const newUser = await databases.createDocument(
      config.databaseId,
      config.userCollectionId,
      newAccount.$id,
      {
        accountId: newAccount.$id,
        email: email,
        username: username,
        avatar: avatarUrl,
        labels: [],
      }
    );

    console.log(" User stored in database:", newUser);

    return newUser;
  } catch (error) {
    console.error(" Error in createUser():", error);
    throw new Error(error instanceof Error ? error.message : String(error));
  }
}

export async function login() {
  try {
    const redirectUri = Linking.createURL("/");

    // 1. Generate the Google OAuth URL from Appwrite
    const response = await account.createOAuth2Token(
      OAuthProvider.Google,
      redirectUri
    );

    if (!response) throw new Error("No OAuth2 token");

    const originalUrl = response.toString();

    const appendedUrl = originalUrl.includes("?")
      ? originalUrl +
        "&prompt=select_account+consent&include_granted_scopes=false"
      : originalUrl +
        "?prompt=select_account+consent&include_granted_scopes=false";

    const browserResult = await openAuthSessionAsync(appendedUrl, redirectUri, {
      showInRecents: false,
      createTask: false,
      enableDefaultShareMenu: false,
      prefersEphemeralWebBrowserSession: true, // Forces private/incognito mode
    });

    if (browserResult.type !== "success") {
      throw new Error("User canceled or session was not successful");
    }

    const returnedUrl = new URL(browserResult.url);
    const secret = returnedUrl.searchParams.get("secret")?.toString();
    const userId = returnedUrl.searchParams.get("userId")?.toString();
    if (!secret || !userId) throw new Error("Missing userId or secret");

    const session = await account.createSession(userId, secret);
    if (!session) throw new Error("Failed to create session");

    return true;
  } catch (error) {
    console.error("Google login error:", error);
    return false;
  }
}

export async function logout() {
  try {
    await account.deleteSession("current");
    return true;
  } catch (error) {
    console.error("Logout error:", error);
    return false;
  }
}

export async function getCurrentUser() {
  try {
    const session = await account.getSession("current").catch(() => null);
    if (!session) return null;

    const response = await account.get();
    if (!response?.$id) return null;

    const userDocument = await databases.getDocument(
      config.databaseId,
      config.userCollectionId,
      response.$id
    );

    return {
      ...response,
      avatar: avatar.getInitials(response.name).toString(),
      labels: Array.isArray(userDocument.labels) ? userDocument.labels : [], // Include labels in the user object
    };
  } catch (error) {
    console.error("No active user session:", error);
    return null;
  }
}

async function openAuthSessionAsync(
  appendedUrl: string,
  redirectUri: string,
  options: {
    showInRecents: boolean;
    createTask: boolean;
    enableDefaultShareMenu: boolean;
    prefersEphemeralWebBrowserSession: boolean;
  }
) {
  try {
    const result = await WebBrowser.openAuthSessionAsync(
      appendedUrl,
      redirectUri,
      {
        showInRecents: options.showInRecents,
        createTask: options.createTask,
        enableDefaultShareMenuItem: options.enableDefaultShareMenu,
        preferEphemeralSession: options.prefersEphemeralWebBrowserSession,
      }
    );

    return result;
  } catch (error) {
    console.error("Error in openAuthSessionAsync:", error);
    throw error;
  }
}

//on this part start the poll functions osea toda la data va atraves de

export const createPoll = async (pollData: {
  pollId: string; // Make pollId required
  title: string;
  briefDescription: string;
  fullDescription: string;
  image: string;
  options: string[];
  createdBy: string;
  status: string;
  userId: string;
}) => {
  try {
    const response = await databases.createDocument(
      config.databaseId,
      config.pollscollection,
      pollData.pollId, // Use the provided pollId
      pollData, // Ensure pollId is included in the document
      [
        Permission.read(Role.any()),
        Permission.write(Role.any()),
        Permission.update(Role.any()),
        Permission.delete(Role.any()),
      ]
    );

    console.log("Poll created:", response);
    return response;
  } catch (error) {
    console.error("Error creating poll:", error);
    throw error;
  }
};

export const createVote = async (voteData: {
  userId: string;
  pollId: string;
  selectedOption: string;
  date: string;
}) => {
  return await databases.createDocument(
    config.databaseId,
    config.votescollection,
    ID.unique(),
    voteData,
    [
      Permission.read(Role.any()),
      Permission.write(Role.any()),
      Permission.update(Role.any()),
      Permission.delete(Role.any()),
    ]
  );
};

export const checkIfUserVoted = async (userId: string, pollId: string) => {
  const response = await databases.listDocuments(
    config.databaseId,
    config.votescollection,
    [
      Query.equal("userId", userId),
      Query.equal("pollId", pollId),
    ]
  );
  return response.documents.length > 0;


};

// this part is to retrieve the polls that the user has voted

export const getUserVotedPolls = async () => {
  try {
    const user = await getCurrentUser();
    if (!user) throw new Error("No active user session");

    console.log("Current user:", user);

    // Fetch votes by the user
    const votesResponse = await databases.listDocuments(
      config.databaseId,
      config.votescollection,
      [Query.equal("userId", user.$id)]
    );

    console.log("User votes:", votesResponse.documents);

    const pollIds = votesResponse.documents.map((doc) => doc.pollId);

    if (pollIds.length === 0) {
      console.log("No polls found for the user's votes.");
      return [];
    }

    console.log("Poll IDs:", pollIds);

    // Fetch polls corresponding to the votes
    let pollsResponse;
    if (pollIds.length === 1) {
      pollsResponse = await databases.listDocuments(
        config.databaseId,
        config.pollscollection,
        [Query.equal("$id", pollIds[0])]
      );
    } else {
      const queries = pollIds.map((id) => Query.equal("$id", id));
      pollsResponse = await databases.listDocuments(
        config.databaseId,
        config.pollscollection,
        [Query.or(queries)]
      );
    }

    console.log("Fetched polls:", pollsResponse.documents);

    return pollsResponse.documents;
  } catch (error) {
    console.error("Error fetching user voted polls:", error);
    return [];
  }
};


export const checkIfPollExists = async (title: string) => {
  const response = await databases.listDocuments(
    config.databaseId,
    config.pollscollection,
    [Query.equal("title", title)]
  );
  return response.documents.length > 0;
};


// here the logic for the pycharts

export const getPollResults = async () => {
  try {
    const response = await databases.listDocuments(config.databaseId, config.votescollection);

    // Create a map to store the results
    const pollResultsMap: { [key: string]: { yesVotes: number; noVotes: number; title: string; status: string } } = {};

    // Iterate over the votes and count the yes and no votes for each poll
    response.documents.forEach((vote) => {
      const { pollId, selectedOption } = vote;

      if (!pollResultsMap[pollId]) {
        pollResultsMap[pollId] = { yesVotes: 0, noVotes: 0, title: "", status: "active" };
      }

      if (selectedOption === "Yes") {
        pollResultsMap[pollId].yesVotes += 1;
      } else if (selectedOption === "No") {
        pollResultsMap[pollId].noVotes += 1;
      }
    });

    // Fetch the poll titles and statuses from the pollscollection
    const pollIds = Object.keys(pollResultsMap);
    if (pollIds.length > 0) {
      let pollsResponse;
      if (pollIds.length === 1) {
        pollsResponse = await databases.listDocuments(
          config.databaseId,
          config.pollscollection,
          [Query.equal("$id", pollIds[0])]
        );
      } else {
        const queries = pollIds.map((id) => Query.equal("$id", id));
        pollsResponse = await databases.listDocuments(
          config.databaseId,
          config.pollscollection,
          [Query.or(queries)]
        );
      }

      pollsResponse.documents.forEach((poll) => {
        if (pollResultsMap[poll.$id]) {
          pollResultsMap[poll.$id].title = poll.title;
          pollResultsMap[poll.$id].status = poll.status;
        }
      });
    }

    // Convert the map to an array
    const pollResults = Object.keys(pollResultsMap).map((pollId) => ({
      id: pollId,
      ...pollResultsMap[pollId],
    }));

    return pollResults;
  } catch (error) {
    console.error("Error fetching poll results:", error);
    throw error;
  }
};