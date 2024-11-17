import Cookies from "js-cookie";
import { useAuth } from "../utils/AuthContext";
import { useEffect } from "react";
export function LoginButton() {
  const { login } = useAuth();
  const handleGoogleLogin = () => {
    const width = 500;
    const height = 600;
    const left = window.innerWidth / 2 - width / 2;
    const top = window.innerHeight / 2 - height / 2;

    const authUrl = `${import.meta.env.VITE_APP_BACKEND_URL}/projects/chat-app/api/auth/google`;
    const popup = window.open(
      authUrl,
      "Google Login",
      `width=${width},height=${height},top=${top},left=${left}`
    );

    const timer = setInterval(() => {
      if (popup && popup.closed) {
        clearInterval(timer);
      }
    }, 1000);
  };

  interface AuthMessage {
    token: string;  // JWT token string
  }

  useEffect(() => {
    const handleMessage = (event: MessageEvent<AuthMessage | string>) => {
      // console.log(event.origin)
      if (event.origin !== `${import.meta.env.VITE_APP_BACKEND_URL}`) return;
      
      // Since the token might come directly as a string or as an object with token property
      const token = typeof event.data === 'string' ? event.data : event.data.token;
      console.log("before token recieve: ",token)
      if (token) {
        // Validate if it's a JWT token (optional but recommended)
        if (isJWTToken(token)) {
          console.log("is jwt: ",token)
          login(token);
        } else {
          console.error('Invalid token format received');
        }
      }
    };
    const isJWTToken = (token: string): boolean => {
      // Basic JWT format validation (checks if it follows the xxx.yyy.zzz pattern)
      const jwtRegex = /^[A-Za-z0-9-_=]+\.[A-Za-z0-9-_=]+\.?[A-Za-z0-9-_.+/=]*$/;
      return jwtRegex.test(token);
    };
    window.addEventListener("message", handleMessage);

    return () => {
      window.removeEventListener("message", handleMessage);
    };
  }, []);

  return (
    <div className="text-center">
      <p>You need to login first!</p>
      <button
        type="button"
        className="login-with-google-btn mt-5"
        onClick={handleGoogleLogin}
      >
        Sign in with Google
      </button>
    </div>
  );
}

