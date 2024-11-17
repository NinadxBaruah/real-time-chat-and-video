import {createContext, useEffect, useState , useContext, SetStateAction} from 'react'
import Cookies from "js-cookie"
// Define the shape of the context value
interface AuthContextType {
  isLoggedIn: boolean;
  login: (token: string) => void;
  logout: () => void;
  setIsLoggedIn:React.Dispatch<SetStateAction<boolean>>
  MenuRemove: (setShowMenu: React.Dispatch<SetStateAction<boolean>>) => void
}

interface AuthProviderProps {
  children: React.ReactNode; 
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({children}:AuthProviderProps) => {
    const [isLoggedIn , setIsLoggedIn] = useState(false);

    useEffect(() =>{
        const token = Cookies.get('__authToken');
        // const token = undefined;
        setIsLoggedIn(!!token);
  }, []);

  const login = (token: string) => {
    Cookies.set('__authToken', token, { 
      expires: 0.2, // 5 hours (align with token expiration)
      // secure: true,
      sameSite: 'Lax', // or 'Lax' if you need compatibility
      // domain: 'ninadbaruah.me'
    });
    setIsLoggedIn(true);
    window.location.reload();
  }
    const MenuRemove = (setShowMenu: React.Dispatch<SetStateAction<boolean>>) =>{
      setShowMenu(false)
    }
    const logout = () => {
        Cookies.remove('__authToken');
        setIsLoggedIn(false);
        Cookies.remove('userInfo')
        // window.location.reload();
      };

      return (
        <AuthContext.Provider value={{ isLoggedIn, login, logout ,setIsLoggedIn , MenuRemove} }>
          {children}
        </AuthContext.Provider>
      ); 
}


export const useAuth = ()  => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};