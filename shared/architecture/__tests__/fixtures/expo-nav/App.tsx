import { createStackNavigator } from '@react-navigation/stack';
import AsyncStorage from '@react-native-async-storage/async-storage';
const Stack = createStackNavigator();
export function App() {
  return (
    <Stack.Navigator>
      <Stack.Screen name="Home" component={Home} />
      <Stack.Screen name="Profile" component={Profile} />
    </Stack.Navigator>
  );
}
function Home() { AsyncStorage.getItem('user'); return null; }
function Profile() { AsyncStorage.setItem('user', 'x'); return null; }
