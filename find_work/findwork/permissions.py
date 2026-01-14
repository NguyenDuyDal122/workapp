from rest_framework.permissions import BasePermission
from .models import *

class IsAdmin(BasePermission):
    def has_permission(self, request, view):
        return request.user.is_authenticated and request.user.vai_tro == 'admin'


class IsNhaTuyenDung(BasePermission):
    def has_permission(self, request, view):
        print("USER:", request.user)
        print("AUTH:", request.user.is_authenticated)

        try:
            ntd = request.user.nha_tuyen_dung
            print("NTD STATUS:", ntd.trang_thai)
        except Exception as e:
            print("ERROR:", e)
            return False

        return ntd.trang_thai == 'da_duyet'


class IsUngVien(BasePermission):
    def has_permission(self, request, view):
        return request.user.is_authenticated and request.user.vai_tro == 'ung_vien'
