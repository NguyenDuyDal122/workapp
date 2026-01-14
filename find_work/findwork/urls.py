from django.contrib import admin
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from findwork import views

r = DefaultRouter()
r.register('ungvien', views.UngVienView, basename='ung_vien')
r.register('nguoidung', views.UserView, basename='nguoi_dung')
r.register('nhatuyendung', views.NhaTuyenDungView, basename='nha_tuyen_dung')
r.register('nganhnghe', views.NganhNgheView, basename='nganh_nghe')
r.register('tintuyendung', views.TinTuyenDungView, basename='tin_tuyen_dung')
r.register('hoso', views.HoSoUngTuyenView, basename='ho_so')
r.register('sosanh', views.SoSanhCongViecView, basename='so_sanh')
r.register('goidichvu', views.GoiDichVuView, basename='goi_dich_vu')
r.register('giaodich', views.GiaoDichView, basename='giao_dich')
r.register('register', views.RegisterView, basename='register')


urlpatterns = [
    path('', include(r.urls)),
]