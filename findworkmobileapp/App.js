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
import QuanLyTin from "./components/NhaTuyenDung/QuanLyTin";
import SuaTin from "./components/NhaTuyenDung/SuaTin";
import QuanLyThongTin from "./components/NhaTuyenDung/QuanLyThongTin";
import HoSoUngTuyen from "./components/NhaTuyenDung/HoSoUngTuyen";
import ThongKeHoSo from "./components/NhaTuyenDung/ThongKeHoSo";
import HoSoCaNhan from "./components/UngVien/HoSoCaNhan";
import LichSuUngTuyen from "./components/UngVien/LichSuUngTuyen";
import SoSanhCongViec from "./components/UngVien/SoSanhCongViec";
import ChiTietUngVien from "./components/NhaTuyenDung/ChiTietUngVien";
import DangKyDichVu from "./components/NhaTuyenDung/DangKyDichVu";

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
        <Stack.Screen name="QuanLyTin" component={QuanLyTin} />
        <Stack.Screen name="SuaTin" component={SuaTin} />
        <Stack.Screen name="QuanLyThongTin" component={QuanLyThongTin} />
        <Stack.Screen name="HoSoUngTuyen" component={HoSoUngTuyen} />
        <Stack.Screen name="ThongKeHoSo" component={ThongKeHoSo} />
        <Stack.Screen name="HoSoCaNhan" component={HoSoCaNhan} />
        <Stack.Screen name="LichSuUngTuyen" component={LichSuUngTuyen} />
        <Stack.Screen name="SoSanhCongViec" component={SoSanhCongViec} />
        <Stack.Screen name="ChiTietUngVien" component={ChiTietUngVien} />
        <Stack.Screen name="DangKyDichVu" component={DangKyDichVu} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
