from rest_framework import viewsets, permissions, status, mixins
from rest_framework.decorators import action
from rest_framework.response import Response
from .serializers import *
from .permissions import *
from findwork import paginators

# ================= USER =================
class UserView(viewsets.ReadOnlyModelViewSet):
    queryset = User.objects.all()
    serializer_class = UserSerializer
    permission_classes = [permissions.IsAuthenticated]

# ================= ỨNG VIÊN =================
class UngVienView(viewsets.ReadOnlyModelViewSet):
    queryset = UngVien.objects.filter(active=True)
    serializer_class = UngVienSerializer

# ================= NHÀ TUYỂN DỤNG =================
class NhaTuyenDungView(
    mixins.CreateModelMixin,
    mixins.ListModelMixin,
    mixins.RetrieveModelMixin,
    viewsets.GenericViewSet
):
    queryset = NhaTuyenDung.objects.all()
    serializer_class = NhaTuyenDungSerializer
    permission_classes = [permissions.IsAuthenticated]

    @action(methods=['patch'], detail=True, permission_classes=[IsAdmin])
    def duyet(self, request, pk=None):
        nt = self.get_object()
        nt.trang_thai = request.data.get('trang_thai')
        nt.nguoi_duyet = request.user
        nt.ngay_duyet = timezone.now()
        nt.save()
        return Response({'message': 'Đã duyệt'})

# ================= NGÀNH NGHỀ =================
class NganhNgheView(viewsets.ReadOnlyModelViewSet):
    queryset = NganhNghe.objects.all()
    serializer_class = NganhNgheSerializer

# ================= TIN TUYỂN DỤNG =================
class TinTuyenDungView(viewsets.ModelViewSet):
    queryset = TinTuyenDung.objects.filter(active=True)
    serializer_class = TinTuyenDungSerializer
    pagination_class = paginators.TinTuyenPaginators

    def get_permissions(self):
        if self.action in ['create', 'update', 'destroy']:
            return [IsNhaTuyenDung()]
        return [permissions.AllowAny()]

    def get_queryset(self):
        qs = self.queryset
        q = self.request.query_params.get('q')
        nganh = self.request.query_params.get('nganh_nghe')
        dia_diem = self.request.query_params.get('dia_diem')

        if q:
            qs = qs.filter(tieu_de__icontains=q)
        if nganh:
            qs = qs.filter(nganh_nghe_id=nganh)
        if dia_diem:
            qs = qs.filter(dia_diem__icontains=dia_diem)

        return qs

# ================= HỒ SƠ ỨNG TUYỂN =================
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
        serializer.save(ung_vien=self.request.user.ung_vien)

    @action(methods=['patch'], detail=True, permission_classes=[IsNhaTuyenDung])
    def danh_gia(self, request, pk=None):
        hs = self.get_object()
        hs.trang_thai = request.data.get('trang_thai')
        hs.danh_gia = request.data.get('danh_gia')
        hs.save()
        return Response({'message': 'Đã đánh giá'})

# ================= SO SÁNH =================
class SoSanhCongViecView(
    mixins.CreateModelMixin,
    mixins.ListModelMixin,
    viewsets.GenericViewSet
):
    queryset = SoSanhCongViec.objects.all()
    serializer_class = SoSanhCongViecSerializer
    permission_classes = [IsUngVien]

# ================= GÓI DỊCH VỤ =================
class GoiDichVuView(viewsets.ReadOnlyModelViewSet):
    queryset = GoiDichVu.objects.all()
    serializer_class = GoiDichVuSerializer

# ================= GIAO DỊCH =================
class GiaoDichView(
    mixins.CreateModelMixin,
    mixins.ListModelMixin,
    viewsets.GenericViewSet
):
    queryset = GiaoDich.objects.all()
    serializer_class = GiaoDichSerializer
    permission_classes = [permissions.IsAuthenticated]
