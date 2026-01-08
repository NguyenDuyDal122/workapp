from django.contrib import admin
from django.urls import reverse
from django.utils import timezone
from django.utils.html import format_html
from .models import *


@admin.register(User)
class UserAdmin(admin.ModelAdmin):
    list_display = (
        'avatar_preview',
        'username',
        'email',
        'vai_tro',
        'is_active',
        'is_staff',
        'date_joined'
    )

    readonly_fields = ('avatar_preview', 'last_login', 'date_joined')

    fieldsets = (
        ('Thông tin đăng nhập', {
            'fields': ('username', 'password')
        }),
        ('Thông tin cá nhân', {
            'fields': ('email', 'so_dien_thoai', 'avatar', 'avatar_preview')
        }),
        ('Phân quyền', {
            'fields': ('vai_tro', 'is_active', 'is_staff', 'is_superuser')
        }),
        ('Thời gian', {
            'fields': ('last_login', 'date_joined')
        }),
    )

    def save_model(self, request, obj, form, change):
        # Nếu user mới hoặc đổi password
        if not change or 'password' in form.changed_data:
            obj.set_password(obj.password)

        # Lưu file avatar (trigger upload lên Cloudinary)
        avatar_file = form.cleaned_data.get('avatar')
        if avatar_file:
            obj.avatar = avatar_file  # File object, CloudinaryStorage sẽ upload khi obj.save()

        obj.save()  # <- phải gọi save() sau khi gán file

    def avatar_preview(self, obj):
        if obj.avatar:
            return format_html(
                '<img src="{}" style="width:50px; height:50px; border-radius:50%; object-fit:cover;" />',
                obj.avatar.url
            )
        return "Chưa có ảnh"

    avatar_preview.short_description = "Avatar"

class UngVienAdmin(admin.ModelAdmin):
    list_display = ('ho_ten', 'user_email', 'ngay_sinh', 'trinh_do', 'kinh_nghiem', 'xem_cv')
    list_filter = ['trinh_do', 'gioi_tinh', 'kinh_nghiem']
    search_fields = ['ho_ten', 'user__email', 'user__so_dien_thoai']

    fieldsets = (
    ('Thông tin cá nhân', {
        'fields': ('user', 'ho_ten', 'ngay_sinh', 'gioi_tinh')
    }),
    ('Thông tin nghề nghiệp', {
        'fields': ('trinh_do', 'kinh_nghiem', 'ky_nang', 'mo_ta_ban_than')
    }),
    ('Hồ sơ', {
        'fields': ('cv_file',)
    }),
    )

    def user_email(self, obj):
        return obj.user.email
    user_email.short_description = "Email"

    def kinh_nghiem(self, obj):
        return f"{obj.kinh_nghiem} năm"
    kinh_nghiem.short_description = "Kinh nghiệm"

    def xem_cv(self, obj):
        if obj.cv_file:
            return format_html('<a href="{}" target="_blank" class="button">📄 Xem CV</a>', obj.cv_file.url)
        return "Chưa có CV"
    xem_cv.short_description = "Xem CV"

    class Media:
        css = {
            'all': ('/static/css/style.css',)
        }

class NhaTuyenDungAdmin(admin.ModelAdmin):
    list_display =  ['ten_cong_ty', 'hien_thi_logo', 'ma_so_thue', 'linh_vuc', 'trang_thai_mau', 'ngay_duyet', 'xem_chi_tiet']
    list_filter = ['trang_thai', 'linh_vuc', 'quy_mo', 'ngay_duyet']
    search_fields = ['ten_cong_ty', 'ma_so_thue', 'user__username', 'user__email']
    readonly_fields = ['ngay_duyet', 'nguoi_duyet']
    date_hierarchy = 'ngay_duyet'

    fieldsets = (
    ('Thông tin cơ bản', {
        'fields': ('user', 'ten_cong_ty', 'logo', 'ma_so_thue')
    }),
    ('Thông tin doanh nghiệp', {
        'fields': ('linh_vuc', 'quy_mo', 'mo_ta')
    }),
    ('Trạng thái phê duyệt', {
        'fields': ('trang_thai', 'ngay_duyet', 'nguoi_duyet')
    })
    )

    def hien_thi_logo(self, obj):
        if obj.logo:
            return format_html('<img src="{}" width="60" height="60" style="object-fit: contain;" />', obj.logo.url)
        return "Chưa có"
    hien_thi_logo.short_description = "Logo"

    def trang_thai_mau(self, obj):
        colors = {
            'cho_duyet': 'orange',
            'da_duyet': 'green',
            'tu_choi': 'red'
        }
        return format_html(
            '<span style="padding: 5px 10px; background-color: {}; color: white; border-radius: 5px;">{}</span>',
            colors.get(obj.trang_thai, 'gray'),
            obj.get_trang_thai_display()
        )

    trang_thai_mau.short_description = "Trạng thái"

    def xem_chi_tiet(self, obj):
        url = (
                reverse('admin:findwork_tintuyendung_changelist')
                + f'?nha_tuyen_dung__id__exact={obj.id}'
        )
        return format_html('<a href="{}">Xem tin</a>', url)

    xem_chi_tiet.short_description = "Tin tuyển dụng"

    actions = ['duyet_nha_tuyen_dung', 'tu_choi_nha_tuyen_dung']
    def duyet_nha_tuyen_dung(self, request, queryset):
        updated = queryset.filter(trang_thai='cho_duyet').update(
            trang_thai='da_duyet',
            ngay_duyet=timezone.now(),
            nguoi_duyet=request.user
        )
        self.message_user(request, f'Đã duyệt {updated} nhà tuyển dụng.')
    duyet_nha_tuyen_dung.short_description = "✅ Phê duyệt nhà tuyển dụng đã chọn"

    def tu_choi_nha_tuyen_dung(self, request, queryset):
        updated = queryset.update(trang_thai='tu_choi')
        self.message_user(request, f'Đã từ chối {updated} nhà tuyển dụng.')

    tu_choi_nha_tuyen_dung.short_description = "❌ Từ chối nhà tuyển dụng đã chọn"

class TinTuyenDungAdmin(admin.ModelAdmin):
    list_display = ['tieu_de', 'nha_tuyen_dung', 'nganh_nghe', 'muc_luong_tu','muc_luong_den',
                    'trang_thai_mau', 'tin_noi_bat', 'so_ho_so', 'luot_xem', 'ngay_dang']
    list_filter = ['trang_thai', 'nganh_nghe', 'tin_noi_bat', 'ngay_dang']
    search_fields = ['tieu_de', 'vi_tri', 'nha_tuyen_dung__ten_cong_ty']
    date_hierarchy = 'ngay_dang'
    readonly_fields = ['luot_xem', 'ngay_dang']

    fieldsets = (
        ('Thông tin cơ bản', {
            'fields': ('nha_tuyen_dung', 'tieu_de', 'nganh_nghe')
        }),
        ('Mô tả công việc', {
            'fields': ('mo_ta_cong_viec', 'yeu_cau')
        }),
        ('Lương & Phúc lợi', {
            'fields': (('muc_luong_tu', 'muc_luong_den', 'don_vi_luong'), 'dai_ngo')
        }),
        ('Thông tin khác', {
            'fields': ('dia_diem', 'so_luong_tuyen', 'han_nop_ho_so', 'trang_thai')
        }),
        ('Gói nổi bật', {
            'fields': ('tin_noi_bat', 'ngay_het_han_noi_bat'),
            'classes': ('collapse',)
        }),
        ('Thống kê', {
            'fields': ('luot_xem', 'ngay_dang'),
            'classes': ('collapse',)
        }),
    )

    def muc_luong_hien_thi(self, obj):
        return format_html(
            '<span style="color: green; font-weight: bold;">{:,.0f} - {:,.0f} {}</span>',
            obj.muc_luong_tu, obj.muc_luong_den, obj.don_vi_luong
        )

    muc_luong_hien_thi.short_description = "Mức lương"

    def trang_thai_mau(self, obj):
        colors = {
            'dang_tuyen': 'green',
            'het_han': 'orange',
            'dong': 'red'
        }
        return format_html(
            '<span style="padding: 3px 8px; background-color: {}; color: white; border-radius: 3px; font-size: 12px;">{}</span>',
            colors.get(obj.trang_thai, 'gray'),
            obj.get_trang_thai_display()
        )

    trang_thai_mau.short_description = "Trạng thái"

    def noi_bat(self, obj):
        if obj.la_noi_bat:
            return format_html('<span style="color: gold; font-size: 18px;">⭐</span>')
        return "-"

    noi_bat.short_description = "Nổi bật"

    def so_ho_so(self, obj):
        count = obj.ho_so.count()
        url = (
                reverse('admin:findwork_hosoungtuyen_changelist')
                + f'?tin_tuyen_dung__id__exact={obj.id}'
        )
        return format_html('<a href="{}"><b>{} hồ sơ</b></a>', url, count)

    so_ho_so.short_description = "Hồ sơ ứng tuyển"

    # Actions
    actions = ['danh_dau_noi_bat', 'dong_tin_tuyen_dung', 'mo_lai_tin_tuyen_dung']

    def danh_dau_noi_bat(self, request, queryset):
        updated = queryset.update(
            la_noi_bat=True,
            ngay_het_han_noi_bat=timezone.now() + timezone.timedelta(days=30)
        )
        self.message_user(request, f'Đã đánh dấu nổi bật {updated} tin tuyển dụng.')

    danh_dau_noi_bat.short_description = "⭐ Đánh dấu nổi bật (30 ngày)"

    def dong_tin_tuyen_dung(self, request, queryset):
        updated = queryset.update(trang_thai='dong')
        self.message_user(request, f'Đã đóng {updated} tin tuyển dụng.')

    dong_tin_tuyen_dung.short_description = "🔒 Đóng tin tuyển dụng"

    def mo_lai_tin_tuyen_dung(self, request, queryset):
        updated = queryset.update(trang_thai='dang_tuyen')
        self.message_user(request, f'Đã mở lại {updated} tin tuyển dụng.')

    mo_lai_tin_tuyen_dung.short_description = "🔓 Mở lại tin tuyển dụng"

class HoSoUngTuyenAdmin(admin.ModelAdmin):
    list_display = ['ung_vien', 'tin_tuyen_dung_ngan', 'trang_thai_mau', 'danh_gia_sao', 'ngay_nop', 'xem_cv']
    list_filter = ['trang_thai', 'danh_gia', 'ngay_nop']
    search_fields = ['ung_vien__ho_ten', 'tin_tuyen_dung__tieu_de']
    date_hierarchy = 'ngay_nop'
    readonly_fields = ['ngay_nop']

    fieldsets = (
        ('Thông tin ứng tuyển', {
            'fields': ('tin_tuyen_dung', 'ung_vien', 'ngay_nop')
        }),
        ('Hồ sơ', {
            'fields': ('cv_dinh_kem',)
        }),
        ('Đánh giá', {
            'fields': ('trang_thai', 'danh_gia', 'ghi_chu_nha_tuyen_dung')
        }),
    )

    def tin_tuyen_dung_ngan(self, obj):
        return obj.tin_tuyen_dung.tieu_de[:50] + "..." if len(
            obj.tin_tuyen_dung.tieu_de) > 50 else obj.tin_tuyen_dung.tieu_de

    tin_tuyen_dung_ngan.short_description = "Tin tuyển dụng"

    def trang_thai_mau(self, obj):
        colors = {
            'moi_nop': 'blue',
            'da_xem': 'gray',
            'phu_hop': 'green',
            'khong_phu_hop': 'red',
            'phong_van': 'orange',
            'trung_tuyen': 'darkgreen',
            'tu_choi': 'darkred'
        }
        return format_html(
            '<span style="padding: 3px 8px; background-color: {}; color: white; '
            'border-radius: 3px; font-size: 11px;">{}</span>',
            colors.get(obj.trang_thai, 'gray'),
            obj.get_trang_thai_display()
        )

    trang_thai_mau.short_description = "Trạng thái"

    def danh_gia_sao(self, obj):
        if obj.danh_gia:
            stars = '⭐' * obj.danh_gia
            return format_html('<span style="font-size: 16px;">{}</span>', stars)
        return "Chưa đánh giá"

    danh_gia_sao.short_description = "Đánh giá"

    def xem_cv(self, obj):
        if obj.cv_dinh_kem:
            return format_html('<a href="{}" target="_blank" class="button">📄 Xem CV</a>', obj.cv_dinh_kem.url)
        return "Không có"

    xem_cv.short_description = "CV"

    # Actions
    actions = ['danh_dau_phu_hop', 'moi_phong_van', 'tu_choi_ho_so']

    def danh_dau_phu_hop(self, request, queryset):
        updated = queryset.update(trang_thai='phu_hop')
        self.message_user(request, f'Đã đánh dấu {updated} hồ sơ phù hợp.')

    danh_dau_phu_hop.short_description = "✅ Đánh dấu phù hợp"

    def moi_phong_van(self, request, queryset):
        updated = queryset.update(trang_thai='phong_van')
        self.message_user(request, f'Đã mời {updated} ứng viên phỏng vấn.')

    moi_phong_van.short_description = "📞 Mời phỏng vấn"

    def tu_choi_ho_so(self, request, queryset):
        updated = queryset.update(trang_thai='tu_choi')
        self.message_user(request, f'Đã từ chối {updated} hồ sơ.')

    tu_choi_ho_so.short_description = "❌ Từ chối"

class SoSanhCongViecAdmin(admin.ModelAdmin):
    pass

class GiaoDichAdmin(admin.ModelAdmin):
    pass

class GoiDichVuAdmin(admin.ModelAdmin):
    pass

class NganhNgheAdmin(admin.ModelAdmin):
    list_display = ['ten', 'hien_thi_icon', 'so_luong_tin', 'mo_ta']
    search_fields = ['ten']

    def hien_thi_icon(self, obj):
        if obj.icon:
            return format_html('<img src="{}" width="40" height="40" />', obj.icon.url)
        return "Chưa có"
    hien_thi_icon.short_description = 'Icon'

    def so_luong_tin(self, obj):
        count = obj.tin_tuyen_dung.count()
        return format_html('<span style="font-weight: bold; color: blue;">{}</span>', count)
    so_luong_tin.short_description = "Số tin tuyển dụng"

    def mo_ta(self, obj):
        return obj.mo_ta[:50] + "..." if len(obj.mo_ta) > 50 else obj.mo_ta
    mo_ta.short_description = "Mô tả"

# Register your models here.
admin.site.register(NganhNghe, NganhNgheAdmin)
admin.site.register(UngVien, UngVienAdmin)
admin.site.register(NhaTuyenDung, NhaTuyenDungAdmin)
admin.site.register(TinTuyenDung, TinTuyenDungAdmin)
admin.site.register(HoSoUngTuyen, HoSoUngTuyenAdmin)
admin.site.register(SoSanhCongViec, SoSanhCongViecAdmin)
admin.site.register(GiaoDich, GiaoDichAdmin)
admin.site.register(GoiDichVu, GoiDichVuAdmin)