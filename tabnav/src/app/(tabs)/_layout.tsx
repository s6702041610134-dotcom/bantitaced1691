import Ionicons from "@expo/vector-icons/Ionicons";
import { Tabs } from 'expo-router';


export default function TabLayout() {
  return (
    <Tabs screenOptions={{
        headerShown: false, /* Default is true */
        tabBarStyle: {
        backgroundColor: '#202020',
        borderTopColor: 'blue',
        },
        tabBarItemStyle: {
        height: '100%',
        },      
        tabBarActiveTintColor: '#FA8',
        tabBarInactiveTintColor: '#888',
      }}>
        <Tabs.Screen name='index' 
        options={{
            title: 'Home',
            tabBarIcon: ({ color, size }) => (
                <Ionicons name='home' size={size} color={color} />          
          ),
        }}/>
        <Tabs.Screen name='education' 
        options={{
            title: 'Education',
            tabBarIcon: ({ color, size }) => (
                <Ionicons name='school' size={size} color={color} />          
          ),
        }}/>
        <Tabs.Screen name='contact' 
        options={{
            title: 'Contact',
            tabBarIcon: ({ color, size }) => (
                <Ionicons name='person' size={size} color={color} />          
          ),

        }}/>
    </Tabs>

  )
}