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
import { useNavigation, useRoute } from "@react-navigation/native";
import DateTimePicker from "@react-native-community/datetimepicker";
import { Picker } from "@react-native-picker/picker";

export default function SuaTin() {
    const navigation = useNavigation();
    const route = useRoute();
    const { tin } = route.params;

    const [loading, setLoading] = useState(false);
    const [nganhNgheList, setNganhNgheList] = useState([]);

    const [tieuDe, setTieuDe] = useState(tin.tieu_de);
    const [nganhNghe, setNganhNghe] = useState(tin.nganh_nghe?.id || "");
    const [diaDiem, setDiaDiem] = useState(tin.dia_diem);
    const [mucLuongTu, setMucLuongTu] = useState(String(tin.muc_luong_tu));
    const [mucLuongDen, setMucLuongDen] = useState(String(tin.muc_luong_den));
    const [donViLuong, setDonViLuong] = useState(tin.don_vi_luong);
    const [moTaCongViec, setMoTaCongViec] = useState(tin.mo_ta_cong_viec || "");
    const [yeuCau, setYeuCau] = useState(tin.yeu_cau || "");
    const [daiNgo, setDaiNgo] = useState(tin.dai_ngo || "");
    const [soLuong, setSoLuong] = useState(String(tin.so_luong_tuyen));
    const [hanNopHoSo, setHanNopHoSo] = useState(new Date(tin.han_nop_ho_so));
    const [showDatePicker, setShowDatePicker] = useState(false);

    useEffect(() => {
        const loadNganhNghe = async () => {
            try {
                const res = await API.get(endpoints.nganhnghe);
                setNganhNgheList(res.data);
            } catch (err) {
                console.log(err.response?.data || err);
            }
        };
        loadNganhNghe();
    }, []);

    const handleUpdate = async () => {
        if (!tieuDe || !nganhNghe || !diaDiem) {
            Alert.alert("Lỗi", "Vui lòng nhập đầy đủ thông tin bắt buộc");
            return;
        }

        setLoading(true);
        try {
            await API.patch(`${endpoints.tintuyendung}${tin.id}/`, {
                tieu_de: tieuDe,
                nganh_nghe_id: Number(nganhNghe),
                dia_diem: diaDiem,
                muc_luong_tu: Number(mucLuongTu),
                muc_luong_den: Number(mucLuongDen),
                don_vi_luong: donViLuong,
                mo_ta_cong_viec: moTaCongViec,
                yeu_cau: yeuCau,
                dai_ngo: daiNgo,
                so_luong_tuyen: Number(soLuong),
                han_nop_ho_so: hanNopHoSo.toISOString().split("T")[0],
            });

            Alert.alert("Thành công", "Cập nhật tin tuyển dụng thành công!");
            navigation.goBack();
        } catch (err) {
            console.log("STATUS:", err.response?.status);
            console.log("DATA:", err.response?.data);
            Alert.alert("Lỗi", "Không thể cập nhật tin");
        } finally {
            setLoading(false);
        }
    };

    return (
        <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 20 }}>
            <Text style={styles.label}>Tiêu đề</Text>
            <TextInput style={styles.input} value={tieuDe} onChangeText={setTieuDe} />

            <Text style={styles.label}>Ngành nghề</Text>
            <View style={styles.pickerWrapper}>
                <Picker selectedValue={nganhNghe} onValueChange={setNganhNghe}>
                    <Picker.Item label="Chọn ngành nghề" value="" />
                    {nganhNgheList.map((item) => (
                        <Picker.Item key={item.id} label={item.ten} value={item.id} />
                    ))}
                </Picker>
            </View>

            <Text style={styles.label}>Địa điểm</Text>
            <TextInput style={styles.input} value={diaDiem} onChangeText={setDiaDiem} />

            <Text style={styles.label}>Mức lương</Text>
            <View style={{ flexDirection: "row", gap: 8 }}>
                <TextInput
                    style={[styles.input, { flex: 1 }]}
                    keyboardType="numeric"
                    value={mucLuongTu}
                    onChangeText={setMucLuongTu}
                />
                <TextInput
                    style={[styles.input, { flex: 1 }]}
                    keyboardType="numeric"
                    value={mucLuongDen}
                    onChangeText={setMucLuongDen}
                />
                <TextInput
                    style={[styles.input, { flex: 1 }]}
                    value={donViLuong}
                    onChangeText={setDonViLuong}
                />
            </View>

            <Text style={styles.label}>Số lượng tuyển</Text>
            <TextInput
                style={styles.input}
                keyboardType="numeric"
                value={soLuong}
                onChangeText={setSoLuong}
            />

            <Text style={styles.label}>Mô tả công việc</Text>
            <TextInput
                style={[styles.input, { height: 80 }]}
                multiline
                value={moTaCongViec}
                onChangeText={setMoTaCongViec}
            />

            <Text style={styles.label}>Yêu cầu</Text>
            <TextInput
                style={[styles.input, { height: 80 }]}
                multiline
                value={yeuCau}
                onChangeText={setYeuCau}
            />

            <Text style={styles.label}>Đãi ngộ</Text>
            <TextInput
                style={[styles.input, { height: 60 }]}
                multiline
                value={daiNgo}
                onChangeText={setDaiNgo}
            />

            <Text style={styles.label}>Hạn nộp hồ sơ</Text>
            <Button title={hanNopHoSo.toDateString()} onPress={() => setShowDatePicker(true)} />

            {showDatePicker && (
                <DateTimePicker
                    value={hanNopHoSo}
                    mode="date"
                    onChange={(e, d) => {
                        setShowDatePicker(false);
                        if (d) setHanNopHoSo(d);
                    }}
                />
            )}

            {loading ? (
                <ActivityIndicator size="large" style={{ marginTop: 20 }} />
            ) : (
                <Button title="Lưu thay đổi" onPress={handleUpdate} />
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
