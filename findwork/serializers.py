from rest_framework import serializers
from .models import *

# ================= USER =================
class UserSerializer(serializers.ModelSerializer):
    avatar = serializers.ImageField(required=False)

    class Meta:
        model = User
        exclude = ('password',)

# ================= ỨNG VIÊN =================
class UngVienSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)

    class Meta:
        model = UngVien
        fields = '__all__'

# ================= NHÀ TUYỂN DỤNG =================
class NhaTuyenDungSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)

    class Meta:
        model = NhaTuyenDung
        fields = '__all__'

# ================= NGÀNH NGHỀ =================
class NganhNgheSerializer(serializers.ModelSerializer):
    class Meta:
        model = NganhNghe
        fields = '__all__'

# ================= TIN TUYỂN DỤNG =================
class TinTuyenDungSerializer(serializers.ModelSerializer):
    nha_tuyen_dung = NhaTuyenDungSerializer(read_only=True)

    class Meta:
        model = TinTuyenDung
        fields = '__all__'

# ================= HỒ SƠ ỨNG TUYỂN =================
class HoSoUngTuyenSerializer(serializers.ModelSerializer):
    ung_vien = UngVienSerializer(read_only=True)

    class Meta:
        model = HoSoUngTuyen
        fields = '__all__'

# ================= SO SÁNH =================
class SoSanhCongViecSerializer(serializers.ModelSerializer):
    class Meta:
        model = SoSanhCongViec
        fields = '__all__'

# ================= GÓI DỊCH VỤ =================
class GoiDichVuSerializer(serializers.ModelSerializer):
    class Meta:
        model = GoiDichVu
        fields = '__all__'

# ================= GIAO DỊCH =================
class GiaoDichSerializer(serializers.ModelSerializer):
    class Meta:
        model = GiaoDich
        fields = '__all__'
