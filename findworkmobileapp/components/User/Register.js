import { View, Text, Button } from "react-native";

export default function Register({ navigation }) {
    return (
        <View style={{ padding: 20 }}>
            <Text style={{ fontSize: 22, marginBottom: 20 }}>
                Chọn loại tài khoản
            </Text>

            <Button
                title="Đăng ký Ứng viên"
                onPress={() => navigation.navigate("RegisterUngVien")}
            />

            <View style={{ height: 15 }} />

            <Button
                title="Đăng ký Nhà tuyển dụng"
                onPress={() => navigation.navigate("RegisterNhaTuyenDung")}
            />
        </View>
    );
}
