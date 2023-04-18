import { useCallback, useEffect, useState } from "react";
import { useSession, signIn } from "next-auth/react";

const Auth = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const login = useCallback(async () => {
    try {
      await signIn("credentials", {
        username,
        password,
        redirect: false,
        callbackUrl: "/auth",
      });
    } catch (error) {
      console.log(error);
    }
  }, [username, password]);

  return (
    <div>
      <input
        id="username"
        type="text"
        value={username}
        onChange={(e: any) => setUsername(e.target.value)}
      />
      <input
        type="password"
        id="password"
        value={password}
        onChange={(e: any) => setPassword(e.target.value)}
      />
      <button onClick={login}>Login</button>
    </div>
  );
};

export default Auth;
