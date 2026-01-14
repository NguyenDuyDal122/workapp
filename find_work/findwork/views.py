from rest_framework import viewsets, permissions, status, mixins, serializers
from rest_framework.decorators import action
from rest_framework.exceptions import PermissionDenied
from rest_framework.response import Response
from rest_framework.parsers import MultiPartParser, FormParser, JSONParser   # ✅ BẮT BUỘC

from django.utils import timezone
from django.db.models import Count, Sum
from django.shortcuts import render
from django.contrib.admin.views.decorators import staff_member_required

from .serializers import *
from .permissions import *
from findwork import paginators

from .models import (
    User, UngVien, NhaTuyenDung,
    TinTuyenDung, HoSoUngTuyen, GiaoDich,
    SoSanhCongViec, GoiDichVu      # ✅ THIẾU TRƯỚC ĐÓ
)

@staff_member_required
def thong_ke_admin(request):
    now = timezone.now()

    tong_tin = TinTuyenDung.objects.count()
    tong_ntd = NhaTuyenDung.objects.count()
    tong_uv = UngVien.objects.count()
    tong_hoso = HoSoUngTuyen.objects.count()

    tong_doanh_thu = (
        GiaoDich.objects
        .filter(trang_thai='da_thanh_toan')
        .aggregate(total=Sum('so_tien'))['total'] or 0
    )

    tin_theo_thang = (
        TinTuyenDung.objects
        .filter(ngay_dang__year=now.year)
        .values('ngay_dang__month')
        .annotate(total=Count('id'))
        .order_by('ngay_dang__month')
    )

    ho_so_theo_thang = (
        HoSoUngTuyen.objects
        .filter(ngay_nop__year=now.year)
        .values('ngay_nop__month')
        .annotate(total=Count('id'))
        .order_by('ngay_nop__month')
    )

    top_ntd = (
        TinTuyenDung.objects
        .values('nha_tuyen_dung__ten_cong_ty')
        .annotate(total=Count('id'))
        .order_by('-total')[:5]
    )

    top_nganh = (
        TinTuyenDung.objects
        .values('nganh_nghe__ten')
        .annotate(total=Count('id'))
        .order_by('-total')[:5]
    )

    return render(request, 'thong_ke.html', {
        'tong_tin': tong_tin,
        'tong_ntd': tong_ntd,
        'tong_uv': tong_uv,
        'tong_hoso': tong_hoso,
        'tong_doanh_thu': tong_doanh_thu,
        'tin_theo_thang': tin_theo_thang,
        'ho_so_theo_thang': ho_so_theo_thang,
        'top_ntd': top_ntd,
        'top_nganh': top_nganh,
    })


class UserView(viewsets.ModelViewSet):
    serializer_class = UserSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        if self.request.user.is_staff:
            return User.objects.all()
        return User.objects.filter(id=self.request.user.id)

    @action(
        methods=['post'],
        detail=False,
        parser_classes=[MultiPartParser, FormParser]
    )
    def upload_avatar(self, request):
        avatar = request.FILES.get('avatar')

        if not avatar:
            return Response({"error": "No avatar"}, status=400)

        request.user.avatar = avatar
        request.user.save()
        return Response(self.get_serializer(request.user).data)

    @action(methods=['get', 'patch'], detail=False)
    def me(self, request):
        serializer = self.get_serializer(
            request.user,
            data=request.data,
            partial=True
        )
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(serializer.data)


class RegisterView(mixins.CreateModelMixin,
                   viewsets.GenericViewSet):
    queryset = User.objects.all()
    serializer_class = RegisterSerializer
    permission_classes = [permissions.AllowAny]

class UngVienView(viewsets.ModelViewSet):
    serializer_class = UngVienSerializer
    permission_classes = [permissions.IsAuthenticated]
    parser_classes = [MultiPartParser, FormParser, JSONParser]

    def get_queryset(self):
        return UngVien.objects.filter(user=self.request.user)

    def perform_create(self, serializer):
        if hasattr(self.request.user, 'ung_vien'):
            raise serializers.ValidationError(
                {"detail": "Ứng viên đã có hồ sơ"}
            )

        serializer.save(user=self.request.user)

class NhaTuyenDungView(
    mixins.CreateModelMixin,
    mixins.ListModelMixin,
    mixins.RetrieveModelMixin,
    mixins.UpdateModelMixin,
    viewsets.GenericViewSet
):
    queryset = NhaTuyenDung.objects.all()
    serializer_class = NhaTuyenDungSerializer
    permission_classes = [permissions.IsAuthenticated]

    @action(methods=['patch'], detail=True, permission_classes=[IsAdmin])
    def duyet(self, request, pk=None):
        nt = self.get_object()
        if request.data.get('trang_thai') not in ['da_duyet', 'tu_choi']:
            return Response({'error': 'Trạng thái không hợp lệ'}, status=400)
        nt.trang_thai = request.data.get('trang_thai')
        nt.nguoi_duyet = request.user
        nt.ngay_duyet = timezone.now()
        nt.save()
        return Response({'message': 'Đã duyệt'})

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)

    def get_queryset(self):
        qs = super().get_queryset()
        trang_thai = self.request.query_params.get('trang_thai')
        if trang_thai:
            qs = qs.filter(trang_thai=trang_thai)
        return qs

    @action(
        methods=['post'],
        detail=True,
        parser_classes=[MultiPartParser],
        permission_classes=[permissions.IsAuthenticated]
    )
    def upload_logo(self, request, pk=None):
        ntd = self.get_object()
        logo = request.FILES.get('logo')

        if not logo:
            return Response({"error": "No logo"}, status=400)

        ntd.logo = logo
        ntd.save()
        return Response(self.get_serializer(ntd).data)

class NganhNgheView(viewsets.ReadOnlyModelViewSet):
    queryset = NganhNghe.objects.all()
    serializer_class = NganhNgheSerializer
    permission_classes = [permissions.AllowAny]

class TinTuyenDungView(viewsets.ModelViewSet):
    serializer_class = TinTuyenDungSerializer
    pagination_class = paginators.TinTuyenPaginators

    def get_queryset(self):
        qs = TinTuyenDung.objects.all().select_related(
            'nha_tuyen_dung', 'nganh_nghe'
        )

        # CHỈ FILTER KHI LIST (GET)
        if self.action == 'list':
            qs = qs.filter(trang_thai='dang_tuyen')

            q = self.request.query_params.get('q')
            nganh = self.request.query_params.get('nganh_nghe')
            dia_diem = self.request.query_params.get('dia_diem')

            if q:
                qs = qs.filter(tieu_de__icontains=q)

            if nganh:
                qs = qs.filter(nganh_nghe__ten__icontains=nganh)

            if dia_diem:
                qs = qs.filter(dia_diem__icontains=dia_diem)

        return qs

    def get_permissions(self):
        if self.action in ['create', 'update', 'partial_update', 'destroy']:
            return [permissions.IsAuthenticated(), IsNhaTuyenDung()]
        return [permissions.AllowAny()]

    def perform_create(self, serializer):
        try:
            nha_tuyen_dung = self.request.user.nha_tuyen_dung
        except NhaTuyenDung.DoesNotExist:
            raise PermissionDenied("Bạn không phải nhà tuyển dụng")

        if nha_tuyen_dung.trang_thai != 'da_duyet':
            raise PermissionDenied("Tài khoản nhà tuyển dụng chưa được duyệt")

        serializer.save(nha_tuyen_dung=nha_tuyen_dung)

    def perform_update(self, serializer):
        instance = self.get_object()
        if instance.nha_tuyen_dung != self.request.user.nha_tuyen_dung:
            raise PermissionDenied("Bạn không có quyền sửa tin này")
        serializer.save()

    def perform_destroy(self, instance):
        if instance.nha_tuyen_dung != self.request.user.nha_tuyen_dung:
            raise PermissionDenied("Bạn không có quyền xoá tin này")

        instance.trang_thai = 'dong'
        instance.save()


class HoSoUngTuyenView(
    mixins.CreateModelMixin,
    mixins.ListModelMixin,
    mixins.RetrieveModelMixin,
    viewsets.GenericViewSet
):
    queryset = HoSoUngTuyen.objects.all()
    serializer_class = HoSoUngTuyenSerializer
    permission_classes = [permissions.IsAuthenticated]

    def perform_create(self, serializer):
        if not hasattr(self.request.user, 'ung_vien'):
            raise PermissionDenied("Chỉ ứng viên mới được ứng tuyển")

        ung_vien = self.request.user.ung_vien

        tin = serializer.validated_data['tin_tuyen_dung']

        if not tin.active:
            raise serializers.ValidationError("Tin tuyển dụng đã đóng")

        if HoSoUngTuyen.objects.filter(
                ung_vien=ung_vien,
                tin_tuyen_dung=tin
        ).exists():
            raise serializers.ValidationError("Bạn đã ứng tuyển tin này rồi")

        serializer.save(ung_vien=ung_vien)

    @action(methods=['patch'], detail=True, permission_classes=[IsNhaTuyenDung])
    def danh_gia(self, request, pk=None):
        hs = self.get_object()

        if hs.tin_tuyen_dung.nha_tuyen_dung != request.user.nha_tuyen_dung:
            raise PermissionDenied("Không có quyền đánh giá hồ sơ này")

        trang_thai = request.data.get('trang_thai')

        valid_status = dict(HoSoUngTuyen.TRANG_THAI_CHOICES).keys()
        if trang_thai not in valid_status:
            return Response({'error': 'Trạng thái không hợp lệ'}, status=400)

        hs.trang_thai = trang_thai
        hs.danh_gia = request.data.get('danh_gia')
        hs.save()

        return Response({
            'message': 'Đã cập nhật trạng thái',
            'trang_thai': hs.trang_thai
        })

    def get_queryset(self):
        user = self.request.user

        if user.is_staff:
            return HoSoUngTuyen.objects.all()

        if hasattr(user, 'ung_vien'):
            return HoSoUngTuyen.objects.filter(ung_vien=user.ung_vien)

        if hasattr(user, 'nha_tuyen_dung'):
            return HoSoUngTuyen.objects.filter(
                tin_tuyen_dung__nha_tuyen_dung=user.nha_tuyen_dung
            )

        return HoSoUngTuyen.objects.none()

    @action(
        methods=['get'],
        detail=False,
        permission_classes=[IsNhaTuyenDung]
    )
    def thong_ke(self, request):
        ntd = request.user.nha_tuyen_dung

        qs = HoSoUngTuyen.objects.filter(
            tin_tuyen_dung__nha_tuyen_dung=ntd
        )

        tong_hoso = qs.count()

        theo_trang_thai = (
            qs.values('trang_thai')
            .annotate(total=Count('id'))
        )

        theo_tin = (
            qs.values('tin_tuyen_dung__tieu_de')
            .annotate(total=Count('id'))
            .order_by('-total')
        )

        return Response({
            "tong_hoso": tong_hoso,
            "theo_trang_thai": theo_trang_thai,
            "theo_tin": theo_tin
        })

class SoSanhCongViecView(
    mixins.CreateModelMixin,
    mixins.ListModelMixin,
    viewsets.GenericViewSet
):
    queryset = SoSanhCongViec.objects.all()
    serializer_class = SoSanhCongViecSerializer
    permission_classes = [IsUngVien]

class GoiDichVuView(viewsets.ReadOnlyModelViewSet):
    queryset = GoiDichVu.objects.all()
    serializer_class = GoiDichVuSerializer

class GiaoDichView(
    mixins.CreateModelMixin,
    mixins.ListModelMixin,
    viewsets.GenericViewSet
):
    queryset = GiaoDich.objects.all()
    serializer_class = GiaoDichSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        if user.is_staff:
            return GiaoDich.objects.all()
        return GiaoDich.objects.filter(user=user)

