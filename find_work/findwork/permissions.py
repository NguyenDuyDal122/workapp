from rest_framework.permissions import BasePermission

class IsAdmin(BasePermission):
    def has_permission(self, request, view):
        return request.user.is_authenticated and request.user.vai_tro == 'admin'


class IsNhaTuyenDung(BasePermission):
    def has_permission(self, request, view):
        return request.user.is_authenticated and request.user.vai_tro == 'nha_tuyen_dung'


class IsUngVien(BasePermission):
    def has_permission(self, request, view):
        return request.user.is_authenticated and request.user.vai_tro == 'ung_vien'
