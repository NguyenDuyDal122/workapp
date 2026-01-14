import { useEffect, useState } from "react";
import {
    View,
    Text,
    TextInput,
    Image,
    FlatList,
    ActivityIndicator,
    Button,
    StyleSheet,
    TouchableOpacity,
    Modal,
    Pressable,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import API, { endpoints } from "../../configs/API";
import { useNavigation } from "@react-navigation/native";

export default function Home() {
    const [user, setUser] = useState(null);
    const [loadingUser, setLoadingUser] = useState(true);

    const [tinTuyenDung, setTinTuyenDung] = useState([]);
    const [loadingTin, setLoadingTin] = useState(true);

    const [nganhNgheFilter, setNganhNgheFilter] = useState("");
    const [menuVisible, setMenuVisible] = useState(false);

    const navigation = useNavigation();

    useEffect(() => {
        const loadUser = async () => {
            try {
                const token = await AsyncStorage.getItem("access_token");
                if (token) {
                    const res = await API.get(endpoints.currentUser);
                    setUser(res.data);
                }
            } catch (err) {
                console.log("API error:", err.response?.data || err);
            } finally {
                setLoadingUser(false);
            }
        };
        loadUser();
    }, []);

    const fetchTinTuyenDung = async (q = "") => {
        setLoadingTin(true);
        try {
            const res = await API.get(endpoints.tintuyendung, {
                params: { q },
            });
            setTinTuyenDung(res.data.results || []);
        } catch (err) {
            console.log("API error:", err.response?.data || err);
        } finally {
            setLoadingTin(false);
        }
    };

    useEffect(() => {
        fetchTinTuyenDung();
    }, []);

    const handleSearch = () => {
        fetchTinTuyenDung(nganhNgheFilter);
    };

    const logout = async () => {
        await AsyncStorage.clear();
        setUser(null);
        navigation.replace("Login");
    };

    const handleMenuItem = (action) => {
        setMenuVisible(false);
        switch (action) {
            case "my_profile":
                navigation.navigate("HoSoCaNhan");
                break;
            case "history":
                navigation.navigate("LichSuUngTuyen");
                break;
            case "compare_jobs":
                navigation.navigate("SoSanhCongViec");
                break;
            case "manage_jobs":
                navigation.navigate("QuanLyTin");
                break;
            case "manage_company":
                navigation.navigate("QuanLyThongTin");
                break;
            case "post_job":
                navigation.navigate("DangTin");
                break;
            case "my_jobs":
                navigation.navigate("HoSoUngTuyen");
                break;
            case "statistics":
                navigation.navigate("ThongKeHoSo");
                break;
            default:
                break;
        }
    };


    return (
        <View style={{ flex: 1, padding: 16 }}>
            {/* ===== HEADER ===== */}
            <View style={styles.headerContainer}>
                <Text style={styles.headerTitle}>Trang chủ</Text>

                {loadingUser ? (
                    <ActivityIndicator />
                ) : user ? (
                    <View style={styles.userContainer}>
                        {user.avatar && (
                            <Image
                                source={{ uri: user.avatar }}
                                style={styles.avatar}
                            />
                        )}
                        <TouchableOpacity onPress={() => setMenuVisible(true)}>
                            <Text style={styles.menuButton}>☰ Menu</Text>
                        </TouchableOpacity>
                    </View>
                ) : (
                    <Button
                        title="Đăng nhập"
                        onPress={() => navigation.navigate("Login")}
                    />
                )}
            </View>

            {/* ===== SEARCH ===== */}
            <View style={{ marginBottom: 16 }}>
                <TextInput
                    style={styles.input}
                    placeholder="Tìm theo ngành nghề, tên công việc, công ty..."
                    value={nganhNgheFilter}
                    onChangeText={setNganhNgheFilter}
                    onSubmitEditing={handleSearch}
                />
            </View>

            {/* ===== DANH SÁCH TIN TUYỂN DỤNG ===== */}
            {loadingTin ? (
                <ActivityIndicator size="large" color="blue" />
            ) : (
                <FlatList
                    data={tinTuyenDung}
                    keyExtractor={(item) => item.id.toString()}
                    renderItem={({ item }) => (
                        <View style={styles.card}>
                            <View style={styles.cardHeader}>
                                {item.nha_tuyen_dung.logo && (
                                    <Image
                                        source={{ uri: item.nha_tuyen_dung.logo }}
                                        style={styles.logo}
                                    />
                                )}
                                <Text style={styles.title}>{item.tieu_de}</Text>
                            </View>
                            <Text>Lương: {item.muc_luong_tu} - {item.muc_luong_den} {item.don_vi_luong}</Text>
                            <Text>Địa điểm: {item.dia_diem}</Text>
                            <Text>Ngành nghề: {item.nganh_nghe?.ten || "Chưa có"}</Text>
                            <Text>Số lượng tuyển: {item.so_luong_tuyen}</Text>

                            <Button
                                title="Xem chi tiết"
                                onPress={() => navigation.navigate("TinTuyenDungDetail", { id: item.id })}
                            />
                        </View>
                    )}
                />
            )}

            {/* ===== MODAL MENU ===== */}
            <Modal
                transparent={true}
                visible={menuVisible}
                animationType="fade"
                onRequestClose={() => setMenuVisible(false)}
            >
                <Pressable style={styles.modalOverlay} onPress={() => setMenuVisible(false)}>
                    <View style={styles.menuContainer}>
                        {user?.vai_tro === "ung_vien" ? (
                            <>
                                <Button title="Hồ sơ của tôi" onPress={() => handleMenuItem("my_profile")} />
                                <Button title="Lịch sử ứng tuyển" onPress={() => handleMenuItem("history")} />
                                <Button title="So sánh công việc" onPress={() => handleMenuItem("compare_jobs")} />
                                <Button title="Đăng xuất" onPress={logout} color="red" />
                            </>
                        ) : (
                            <>
                                <Button title="Quản lý tin tuyển dụng" onPress={() => handleMenuItem("manage_jobs")} />
                                <Button title="Quản lý thông tin doanh nghiệp" onPress={() => handleMenuItem("manage_company")} />
                                <Button title="Hồ sơ ứng viên" onPress={() => handleMenuItem("my_jobs")} />
                                <Button title="Đăng tin tuyển dụng" onPress={() => handleMenuItem("post_job")} />
                                <Button title="Thống kê" onPress={() => handleMenuItem("statistics")} />
                                <Button title="Đăng xuất" onPress={logout} color="red" />
                            </>
                        )}
                    </View>
                </Pressable>
            </Modal>
        </View>
    );
}

const styles = StyleSheet.create({
    headerContainer: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: 16,
    },
    headerTitle: { fontSize: 20, fontWeight: "bold" },
    userContainer: { flexDirection: "row", alignItems: "center" },
    avatar: { width: 40, height: 40, borderRadius: 20, marginRight: 8 },
    menuButton: { fontSize: 18, color: "#007bff", marginLeft: 8 },

    input: {
        borderWidth: 1,
        borderColor: "#ccc",
        borderRadius: 8,
        paddingHorizontal: 10,
        paddingVertical: 8,
        marginBottom: 8,
    },

    card: {
        borderWidth: 1,
        borderColor: "#ccc",
        padding: 12,
        marginBottom: 12,
        borderRadius: 8,
        backgroundColor: "#fff",
    },
    cardHeader: { flexDirection: "row", alignItems: "center", marginBottom: 8 },
    logo: { width: 40, height: 40, marginRight: 8, borderRadius: 5 },
    title: { fontSize: 16, fontWeight: "bold", flexShrink: 1 },

    modalOverlay: {
        flex: 1,
        backgroundColor: "rgba(0,0,0,0.3)",
        justifyContent: "flex-start",
        alignItems: "flex-end",
    },
    menuContainer: {
        backgroundColor: "#fff",
        padding: 16,
        marginTop: 50,
        marginRight: 16,
        borderRadius: 8,
        width: 200,
        shadowColor: "#000",
        shadowOpacity: 0.25,
        shadowRadius: 4,
        elevation: 5,
    },
});
