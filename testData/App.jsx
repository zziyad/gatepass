import React, { useState, useEffect } from "react";

function App() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [profile, setProfile] = useState(null);

  // Check profile on mount
  useEffect(() => {
    console.log("Component mounted, fetching profile...");
    getProfile();
  }, []);

  // Login
  const handleLogin = async () => {
    console.log("Logging in with:", { username, password });
    const res = await fetch("http://localhost:8001/api/", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        id: 2,
        type: "call",
        method: "auth/signin",
        args: {
          email: username,
          password: password,
        },
      }),
      credentials: "include",
    });
    const data = await res.json();
    console.log("Login response:", data);
    if (data.result?.status === "logged") {
      console.log("Login successful, fetching profile...");
      getProfile();
    } else {
      console.log("Login failed, staying on login screen");
    }
  };

  // Fetch protected data
  const getProfile = async () => {
    try {
      console.log("Fetching profile...");
      const res = await fetch("http://localhost:8001/api", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: 2,
          type: "call",
          method: "auth/verify",
          args: {},
        }),
        credentials: "include",
      });
      const data = await res.json();
      console.log("Profile response:", data);
      if (data.result?.status === "logged") {
        console.log("Profile valid, setting profile data");
        setProfile(data);
      } else {
        console.log("No valid profile, clearing profile");
        setProfile(null);
      }
    } catch (error) {
      console.error("Error fetching profile:", error);
      setProfile(null);
    }
  };

  // Logout
  const handleLogout = async () => {
    console.log("Logging out...");
    const res = await fetch("http://localhost:8001/api", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        id: 2,
        type: "call",
        method: "auth/signout",
        args: {},
      }),
      credentials: "include",
    });
    const data = await res.json();
    console.log("Logout response:", data);
    if (data.result?.status === "success") {
      console.log("Logout successful, clearing profile");
      setProfile(null);
    } else {
      console.log("Logout failed, profile unchanged");
    }
  };

  return (
    <div>
      <h1>Cookie Auth Demo</h1>
      {!profile ? (
        <div>
          <input
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="Username"
          />
          <input
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Password"
            type="password"
          />
          <button onClick={handleLogin}>Login</button>
        </div>
      ) : (
        <div>
          <h2>Profile Data</h2>
          <pre>{JSON.stringify(profile, null, 2)}</pre>
          <button onClick={handleLogout}>Logout</button>
        </div>
      )}
      <button onClick={getProfile}>Get Profile</button>
    </div>
  );
}

export default App;