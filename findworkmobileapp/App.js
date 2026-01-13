import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';

import Home from './components/Home/Home';
import Login from './components/User/Login';
import Register from './components/User/Register';
import RegisterUngVien from "./components/User/RegisterUngVien";
import RegisterNhaTuyenDung from "./components/User/RegisterNhaTuyenDung";
import AdminHome from "./components/Admin/AdminHome";
import TinTuyenDungDetail from "./components/Home/TinTuyenDungDetail";
import DangTin from "./components/NhaTuyenDung/DangTin";

const Stack = createStackNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator>
        <Stack.Screen name="Home" component={Home} />
        <Stack.Screen name="Register" component={Register} />
        <Stack.Screen name="RegisterUngVien" component={RegisterUngVien} />
        <Stack.Screen name="RegisterNhaTuyenDung" component={RegisterNhaTuyenDung} />
        <Stack.Screen name="Login" component={Login} />
        <Stack.Screen name="AdminHome" component={AdminHome} />
        <Stack.Screen name="TinTuyenDungDetail" component={TinTuyenDungDetail} />
        <Stack.Screen name="DangTin" component={DangTin} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
