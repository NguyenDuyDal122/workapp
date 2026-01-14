import React, { useEffect, useState } from "react";
import {
    View,
    Text,
    FlatList,
    TouchableOpacity,
    StyleSheet,
    Alert,
    ScrollView,
    TextInput
} from "react-native";
import API, { endpoints } from "../../configs/API";

export default function SoSanhCongViec() {
    const [jobs, setJobs] = useState([]);
    const [selectedJobs, setSelectedJobs] = useState([]);
    const [note, setNote] = useState("");
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        loadJobs();
    }, []);

    const loadJobs = async () => {
        try {
            let res = await API.get(endpoints.tintuyendung);
            setJobs(res.data.results || res.data);
        } catch (err) {
            console.error(err);
            Alert.alert("Lỗi", "Không tải được danh sách công việc");
        }
    };

    const toggleSelect = (job) => {
        const exists = selectedJobs.find(j => j.id === job.id);

        if (exists) {
            setSelectedJobs(selectedJobs.filter(j => j.id !== job.id));
        } else {
            if (selectedJobs.length >= 3) {
                Alert.alert("Thông báo", "Chỉ so sánh tối đa 3 công việc");
                return;
            }
            setSelectedJobs([...selectedJobs, job]);
        }
    };

    const saveCompare = async () => {
        if (selectedJobs.length < 2) {
            Alert.alert("Thông báo", "Chọn ít nhất 2 công việc để so sánh");
            return;
        }

        setLoading(true);
        try {
            await API.post(endpoints.soSanhCongViec, {
                tin_tuyen_dung: selectedJobs.map(j => j.id),
                ghi_chu: note
            });

            Alert.alert("Thành công", "Đã lưu so sánh công việc");
            setSelectedJobs([]);
            setNote("");
        } catch (err) {
            console.error(err);
            Alert.alert("Lỗi", "Không thể lưu so sánh");
        } finally {
            setLoading(false);
        }
    };

    const renderJob = ({ item }) => {
        const selected = selectedJobs.find(j => j.id === item.id);

        return (
            <TouchableOpacity
                style={[
                    styles.jobCard,
                    selected && styles.selected
                ]}
                onPress={() => toggleSelect(item)}
            >
                <Text style={styles.title}>{item.tieu_de}</Text>
                <Text>Công ty: {item.nha_tuyen_dung?.ten_cong_ty}</Text>
                <Text>
                    Lương: {item.muc_luong_tu} - {item.muc_luong_den} {item.don_vi_luong}
                </Text>
                <Text>Địa điểm: {item.dia_diem}</Text>
            </TouchableOpacity>
        );
    };

    return (
        <ScrollView style={styles.container}>
            <Text style={styles.header}>📊 So sánh công việc</Text>

            <FlatList
                data={jobs}
                renderItem={renderJob}
                keyExtractor={(item) => item.id.toString()}
                scrollEnabled={false}
            />

            {selectedJobs.length >= 2 && (
                <>
                    <Text style={styles.subHeader}>🔍 Bảng so sánh</Text>

                    {selectedJobs.map(job => (
                        <View key={job.id} style={styles.compareBox}>
                            <Text style={styles.compareTitle}>{job.tieu_de}</Text>
                            <Text>Công ty: {job.nha_tuyen_dung?.ten_cong_ty}</Text>
                            <Text>Lương: {job.muc_luong_tu} - {job.muc_luong_den}</Text>
                            <Text>Địa điểm: {job.dia_diem}</Text>
                        </View>
                    ))}

                    <TextInput
                        placeholder="Ghi chú so sánh..."
                        value={note}
                        onChangeText={setNote}
                        style={styles.noteInput}
                        multiline
                    />

                    <TouchableOpacity
                        style={styles.saveBtn}
                        onPress={saveCompare}
                        disabled={loading}
                    >
                        <Text style={styles.saveText}>
                            {loading ? "Đang lưu..." : "💾 Lưu so sánh"}
                        </Text>
                    </TouchableOpacity>
                </>
            )}
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        padding: 12,
        backgroundColor: "#f5f5f5"
    },
    header: {
        fontSize: 22,
        fontWeight: "bold",
        marginBottom: 10
    },
    subHeader: {
        fontSize: 18,
        fontWeight: "bold",
        marginVertical: 10
    },
    jobCard: {
        backgroundColor: "#fff",
        padding: 12,
        marginBottom: 10,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: "#ddd"
    },
    selected: {
        borderColor: "#007BFF",
        backgroundColor: "#eaf2ff"
    },
    title: {
        fontSize: 16,
        fontWeight: "bold"
    },
    compareBox: {
        backgroundColor: "#fff",
        padding: 10,
        marginBottom: 8,
        borderRadius: 8
    },
    compareTitle: {
        fontWeight: "bold",
        fontSize: 16
    },
    noteInput: {
        backgroundColor: "#fff",
        borderRadius: 8,
        padding: 10,
        minHeight: 80,
        marginVertical: 10
    },
    saveBtn: {
        backgroundColor: "#007BFF",
        padding: 14,
        borderRadius: 8,
        alignItems: "center",
        marginBottom: 30
    },
    saveText: {
        color: "#fff",
        fontWeight: "bold",
        fontSize: 16
    }
});
