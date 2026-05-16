import { initializeApp } from 'firebase/app';
import { initializeAuth, getReactNativePersistence } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Ваш конфиг из Firebase Console
const firebaseConfig = {
  apiKey: "AIzaSyBw-oIUIU327OsJIVgtWCxjv-ibAJT4wqM",
  authDomain: "forensichelper.firebaseapp.com",
  projectId: "forensichelper",
  storageBucket: "forensichelper.firebasestorage.app",
  messagingSenderId: "875206695758",
  appId: "1:875206695758:web:dc688de6e0bab2869adc1f"
};

// Инициализация приложения
const app = initializeApp(firebaseConfig);

// Настройка авторизации (с сохранением сессии)
export const auth = initializeAuth(app, {
  persistence: getReactNativePersistence(AsyncStorage)
});

// База данных
export const db = getFirestore(app);

export default app;