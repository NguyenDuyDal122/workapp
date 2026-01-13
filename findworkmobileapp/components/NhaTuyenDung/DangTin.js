import { useEffect, useState } from "react";
import {
    View,
    Text,
    TextInput,
    Button,
    StyleSheet,
    ScrollView,
    ActivityIndicator,
    Alert,
} from "react-native";
import API, { endpoints } from "../../configs/API";
import { useNavigation } from "@react-navigation/native";
import DateTimePicker from "@react-native-community/datetimepicker";
import { Picker } from "@react-native-picker/picker";

export default function DangTin() {
    const navigation = useNavigation();

    const [loading, setLoading] = useState(false);
    const [nganhNgheList, setNganhNgheList] = useState([]);
    const [tieuDe, setTieuDe] = useState("");
    const [nganhNghe, setNganhNghe] = useState("");
    const [diaDiem, setDiaDiem] = useState("");
    const [mucLuongTu, setMucLuongTu] = useState("");
    const [mucLuongDen, setMucLuongDen] = useState("");
    const [donViLuong, setDonViLuong] = useState("VNĐ");
    const [moTaCongViec, setMoTaCongViec] = useState("");
    const [yeuCau, setYeuCau] = useState("");
    const [daiNgo, setDaiNgo] = useState("");
    const [hanNopHoSo, setHanNopHoSo] = useState(new Date());
    const [showDatePicker, setShowDatePicker] = useState(false);

    // Load danh mục ngành nghề
    useEffect(() => {
        const fetchNganhNghe = async () => {
            try {
                const res = await API.get(endpoints.nganhnghe);
                setNganhNgheList(res.data);
            } catch (err) {
                console.log("Lỗi load ngành nghề:", err.response?.data || err);
            }
        };
        fetchNganhNghe();
    }, []);

    const handleSubmit = async () => {
        if (!tieuDe || !nganhNghe || !diaDiem || !mucLuongTu || !mucLuongDen) {
            Alert.alert("Lỗi", "Vui lòng nhập đầy đủ các trường bắt buộc");
            return;
        }

        setLoading(true);
        try {
            await API.post("/tintuyendung/", {
                tieu_de: tieuDe,
                nganh_nghe_id: Number(nganhNghe),
                dia_diem: diaDiem,
                muc_luong_tu: Number(mucLuongTu),
                muc_luong_den: Number(mucLuongDen),
                don_vi_luong: donViLuong,
                mo_ta_cong_viec: moTaCongViec,
                yeu_cau: yeuCau,
                dai_ngo: daiNgo,
                han_nop_ho_so: hanNopHoSo.toISOString().split("T")[0], // gửi dạng YYYY-MM-DD
                so_luong_tuyen: Number(10),
            });
            Alert.alert("Thành công", "Đăng tin tuyển dụng thành công!");
            navigation.goBack();
        } catch (err) {
            console.log("STATUS:", err.response?.status);
            console.log("HEADERS:", err.response?.headers);
            console.log("RAW DATA:", err.response?.data);

            Alert.alert(
                "Lỗi server",
                "Backend đang lỗi (500). Kiểm tra server log."
            );
        }

        finally {
            setLoading(false);
        }
    };

    return (
        <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 20 }}>
            <Text style={styles.label}>Tiêu đề (*)</Text>
            <TextInput
                style={styles.input}
                placeholder="Nhập tiêu đề công việc"
                value={tieuDe}
                onChangeText={setTieuDe}
            />

            <Text style={styles.label}>Ngành nghề (*)</Text>
            <View style={styles.pickerWrapper}>
                <Picker
                    selectedValue={nganhNghe}
                    onValueChange={(value) => setNganhNghe(value)}
                >
                    <Picker.Item label="Chọn ngành nghề" value="" />
                    {nganhNgheList.map((item) => (
                        <Picker.Item key={item.id} label={item.ten} value={item.id} />
                    ))}
                </Picker>
            </View>

            <Text style={styles.label}>Địa điểm (*)</Text>
            <TextInput
                style={styles.input}
                placeholder="Nhập địa điểm"
                value={diaDiem}
                onChangeText={setDiaDiem}
            />

            <Text style={styles.label}>Mức lương (*)</Text>
            <View style={{ flexDirection: "row", gap: 8 }}>
                <TextInput
                    style={[styles.input, { flex: 1 }]}
                    placeholder="Từ"
                    keyboardType="numeric"
                    value={mucLuongTu}
                    onChangeText={setMucLuongTu}
                />
                <TextInput
                    style={[styles.input, { flex: 1 }]}
                    placeholder="Đến"
                    keyboardType="numeric"
                    value={mucLuongDen}
                    onChangeText={setMucLuongDen}
                />
                <TextInput
                    style={[styles.input, { flex: 1 }]}
                    placeholder="VNĐ"
                    value={donViLuong}
                    onChangeText={setDonViLuong}
                />
            </View>

            <Text style={styles.label}>Mô tả công việc</Text>
            <TextInput
                style={[styles.input, { height: 80 }]}
                multiline
                value={moTaCongViec}
                onChangeText={setMoTaCongViec}
            />

            <Text style={styles.label}>Yêu cầu ứng viên</Text>
            <TextInput
                style={[styles.input, { height: 80 }]}
                multiline
                value={yeuCau}
                onChangeText={setYeuCau}
            />

            <Text style={styles.label}>Chế độ đãi ngộ</Text>
            <TextInput
                style={[styles.input, { height: 60 }]}
                multiline
                value={daiNgo}
                onChangeText={setDaiNgo}
            />

            <Text style={styles.label}>Hạn nộp hồ sơ (*)</Text>
            <Button title={hanNopHoSo.toDateString()} onPress={() => setShowDatePicker(true)} />
            {showDatePicker && (
                <DateTimePicker
                    value={hanNopHoSo}
                    mode="date"
                    display="default"
                    onChange={(event, selectedDate) => {
                        setShowDatePicker(false);
                        if (selectedDate) setHanNopHoSo(selectedDate);
                    }}
                />
            )}

            {loading ? (
                <ActivityIndicator size="large" color="blue" style={{ marginTop: 20 }} />
            ) : (
                <Button title="Đăng tin tuyển dụng" onPress={handleSubmit} />
            )}
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, padding: 16 },
    label: { fontWeight: "bold", marginTop: 12, marginBottom: 4 },
    input: {
        borderWidth: 1,
        borderColor: "#ccc",
        borderRadius: 8,
        paddingHorizontal: 10,
        paddingVertical: 8,
    },
    pickerWrapper: {
        borderWidth: 1,
        borderColor: "#ccc",
        borderRadius: 8,
    },
});
