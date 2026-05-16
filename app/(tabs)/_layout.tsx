// app/(tabs)/_layout.tsx
import { Tabs } from 'expo-router';
import { Text } from 'react-native';

export default function TabsLayout() {
  return (
    <Tabs screenOptions={{ 
      headerShown: false, 
      tabBarActiveTintColor: '#2980b9', 
      tabBarInactiveTintColor: '#95a5a6',
      tabBarStyle: { paddingBottom: 5, height: 60 }
    }}>
      <Tabs.Screen name="home" options={{ 
        title: 'Главная', 
        tabBarIcon: () => <Text style={{fontSize: 22}}>📄</Text> 
      }} />
      <Tabs.Screen name="archive" options={{ 
        title: 'Архив', 
        tabBarIcon: () => <Text style={{fontSize: 22}}>📁</Text> 
      }} />
      <Tabs.Screen name="codes" options={{ 
        title: 'Кодексы', 
        tabBarIcon: () => <Text style={{fontSize: 22}}>📖</Text> 
      }} />
      <Tabs.Screen name="expert" options={{ 
        title: 'Экспертиза', 
        tabBarIcon: () => <Text style={{fontSize: 22}}>🔬</Text> 
      }} />
    </Tabs>
  );
}