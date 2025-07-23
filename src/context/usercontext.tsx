import React, { createContext, useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { userImage2 } from './declarations';
import axiosInstance from '../api/axiosInstance.ts';

export let logoutRef = () => {};

export const AuthContext = createContext<AuthContextType>({
  token: '',
  userName: '',
  userid: 0,
  isLogin: false,
  login: () => {},
  logout: () => {},
  profileImage: null,
  setProfileImage: () => {},
  userRole: 0,
});

export const AuthContextProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isLogin, setIsLogin] = useState(false);
  const [token, setToken] = useState('');
  const [userName, setUserName] = useState('');
  const [userid, setUserid] = useState(0);  
  const [profileImage, setProfileImage] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [userRole, setUserRole] = useState(0);

  useEffect(() => {
    const token = localStorage.getItem('token');
    const userid = Number(localStorage.getItem('userid'));
    const userNameLocal =  localStorage.getItem('userName') || '';
    const userRrole = Number(localStorage.getItem('userRole'));
    if (token) {
      setIsLogin(true);
      setToken(token);
      setUserid(userid);
      setUserName(userNameLocal);
      setUserRole(userRrole);
    }
    
    if (userid) {
      axiosInstance.get(`/get-profile-picture/${userid}`)
        .then(response => {
          const { profileImage } = response.data;
          setProfileImage(profileImage ? `data:image/png;base64,${profileImage}` : userImage2);
          setLoading(false);
        })
        .catch(error => {
          console.error('Profil resmi getirilirken bir hata oluştu:', error);
          setProfileImage(userImage2); 
          setLoading(false);
        });
    } else {
      setLoading(false);
    }
  }, []);

  if (loading) return <></>;

  // ✔️ Artık dışarıdan alınan verilerle giriş oturumu ayarlıyoruz
  const login = (data: {
    token: string;
    username: string;
    userid: number;
    userRole: number;
  }) => {
    setToken(data.token);
    setIsLogin(true);
    setUserName(data.username);
    setUserid(data.userid);
    setUserRole(data.userRole);

    localStorage.setItem('token', data.token);
    localStorage.setItem('userName', data.username);
    localStorage.setItem('userid', data.userid.toString());
    localStorage.setItem('userRole', data.userRole.toString());

    axiosInstance.get(`/get-profile-picture/${data.userid}`)
    .then(response => {
      const { profileImage } = response.data;
      setProfileImage(profileImage ? `data:image/png;base64,${profileImage}` : userImage2);
    })
    .catch(error => {
      console.error('Profil resmi alınamadı (login sonrası):', error);
      setProfileImage(userImage2);
    });

    toast.success("Giriş başarılı!", {
      position: 'top-right',
      autoClose: 3000,
    });
  };

  const logout = () => {
    setIsLogin(false);
    setToken('');
    setUserName('');
    setUserid(0);
    setUserRole(0);
    setProfileImage(null);
    localStorage.clear();
  };
  logoutRef = logout;
  return (
    <AuthContext.Provider value={{ token, userName, userid, isLogin, login, logout, profileImage, setProfileImage, userRole }}>
      {children}
    </AuthContext.Provider>
  );
};

// 🧠 Tip tanımı güncellendi
export type AuthContextType = {
  token: string;
  userName: string;
  userid: number;
  isLogin: boolean;
  login: (data: {
    token: string;
    username: string;
    userid: number;
    userRole: number;
  }) => void;
  logout: () => void;
  profileImage: string | null;
  setProfileImage: (profileImage: string | null) => void;
  userRole : number;
};

export default AuthContext;