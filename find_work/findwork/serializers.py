from rest_framework import serializers
from .models import *

class RegisterSerializer(serializers.ModelSerializer):
    avatar = serializers.ImageField(required=False)

    class Meta:
        model = User
        fields = [
            'username', 'password', 'email',
            'so_dien_thoai', 'vai_tro', 'avatar'
        ]
        extra_kwargs = {
            'password': {'write_only': True}
        }

    def create(self, validated_data):
        avatar = validated_data.pop('avatar', None)
        vai_tro = validated_data.get('vai_tro')

        user = User.objects.create_user(**validated_data)

        if avatar:
            user.avatar = avatar
            user.save()

        return user

class UserSerializer(serializers.ModelSerializer):
    avatar = serializers.ImageField(use_url=True, required=False)

    class Meta:
        model = User
        fields = [
            'id',
            'username',
            'email',
            'vai_tro',
            'avatar'
        ]

class UngVienSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)

    class Meta:
        model = UngVien
        fields = '__all__'

class NhaTuyenDungSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)

    class Meta:
        model = NhaTuyenDung
        fields = '__all__'

class NganhNgheSerializer(serializers.ModelSerializer):
    class Meta:
        model = NganhNghe
        fields = '__all__'

class TinTuyenDungSerializer(serializers.ModelSerializer):
    mo_ta_cong_viec = serializers.CharField(required=False, allow_blank=True)
    yeu_cau = serializers.CharField(required=False, allow_blank=True)
    dai_ngo = serializers.CharField(required=False, allow_blank=True)

    nha_tuyen_dung = NhaTuyenDungSerializer(read_only=True)
    nganh_nghe = NganhNgheSerializer(read_only=True)
    nganh_nghe_id = serializers.PrimaryKeyRelatedField(
        queryset=NganhNghe.objects.all(),
        source='nganh_nghe',
        write_only=True
    )

    class Meta:
        model = TinTuyenDung
        fields = '__all__'

class TinTuyenDungShortSerializer(serializers.ModelSerializer):
    nha_tuyen_dung = NhaTuyenDungSerializer(read_only=True)

    class Meta:
        model = TinTuyenDung
        fields = [
            'id',
            'tieu_de',
            'dia_diem',
            'muc_luong_tu',
            'muc_luong_den',
            'don_vi_luong',
            'nha_tuyen_dung'
        ]

class HoSoUngTuyenSerializer(serializers.ModelSerializer):
    ung_vien = UngVienSerializer(read_only=True)
    tin_tuyen_dung = TinTuyenDungShortSerializer(read_only=True)

    class Meta:
        model = HoSoUngTuyen
        fields = '__all__'

class SoSanhCongViecSerializer(serializers.ModelSerializer):
    class Meta:
        model = SoSanhCongViec
        fields = '__all__'

class GoiDichVuSerializer(serializers.ModelSerializer):
    class Meta:
        model = GoiDichVu
        fields = '__all__'

class GiaoDichSerializer(serializers.ModelSerializer):
    class Meta:
        model = GiaoDich
        fields = '__all__'
