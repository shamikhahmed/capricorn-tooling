import { createNativeStackNavigator } from '@react-navigation/native-stack';
const Stack = createNativeStackNavigator();
export default function App() {
  return (
    <Stack.Navigator>
      <Stack.Screen name="Home" component={Home} />
      <Stack.Screen
        name="Record"
        component={Record}
      />
    </Stack.Navigator>
  );
}
function Home() { return null; }
function Record() { return null; }
