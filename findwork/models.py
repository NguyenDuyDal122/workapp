from cloudinary.models import CloudinaryField
from django.contrib.auth.models import AbstractUser
from django.core.validators import MinValueValidator, MaxValueValidator
from django.db import models
from django.utils import timezone
from ckeditor.fields import RichTextField
# Create your models here.
class User(AbstractUser):
    VAI_TRO_CHOICES = [
        ('admin', 'Quản trị viên'),
        ('nha_tuyen_dung', 'Nhà tuyển dụng'),
        ('ung_vien', 'Ứng viên'),
    ]
    vai_tro = models.CharField(max_length=20, choices=VAI_TRO_CHOICES, default='ung_vien')
    so_dien_thoai = models.CharField(max_length=20, blank=True, null=True)
    avatar = models.ImageField(upload_to='avatars/', null=True, blank=True)
    dia_chi = RichTextField(blank=True, null=True)
    class Meta:
        verbose_name = "Người dùng"
        verbose_name_plural = "Người dùng"


class BaseModel(models.Model):
    created_date = models.DateTimeField(auto_now_add=True)
    updated_date = models.DateTimeField(auto_now=True)
    active = models.BooleanField(default=True)

    class Meta:
        abstract = True #Xem BaseModels là lớp trừu tượng chung, không tạo DB

#Hồ sơ ứng viên
class UngVien(BaseModel):
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='ung_vien')
    ho_ten = models.CharField(null=False, max_length=200)
    ngay_sinh = models.DateField()
    gioi_tinh = models.CharField(null=False, max_length=10, choices=[('nam', 'Nam'), ('nu', 'Nữ'), ('khac', 'Khác')])
    trinh_do = models.CharField(null=False, max_length=100, verbose_name="Trình độ học vấn")
    kinh_nghiem = models.CharField(null=False, max_length=100, verbose_name="Kinh nghiem")
    ky_nang = RichTextField(null=True, blank=True)
    mo_ta_ban_than = models.TextField(blank=True, null=True)
    cv_file = models.FileField(upload_to='ungvien/%Y/%m', null=True, blank=True, verbose_name="File CV")

    class Meta:
        verbose_name = "Ứng viên"
        verbose_name_plural = "Ứng viên"
#Nhà tuyển dụng
class NhaTuyenDung(BaseModel):
    TRANG_THAI_CHOICES = [
        ('cho_duyet', 'Chờ duyệt'),
        ('da_duyet', 'Đã duyệt'),
        ('tu_choi', 'Từ chối'),
    ]

    user = models.OneToOneField(User, on_delete=models.CASCADE)
    ten_cong_ty = models.CharField(max_length=255, verbose_name="Tên công ty")
    logo = models.ImageField(upload_to='nhatuyendung/%Y/%m')
    ma_so_thue = models.CharField(max_length=50, unique=True, verbose_name="Mã số thuế")
    linh_vuc = models.CharField(max_length=200, verbose_name="Lĩnh vực hoạt động")
    quy_mo = models.CharField(max_length=100, verbose_name="Quy mô nhân sự")
    mo_ta = RichTextField(verbose_name="Mô tả công ty")
    trang_thai = models.CharField(max_length=20,choices=TRANG_THAI_CHOICES, default='cho_duyet')
    ngay_duyet = models.DateTimeField(blank=True, null=True)
    nguoi_duyet = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, related_name='nha_tuyen_dung_da_duyet')
    class Meta:
        verbose_name = "Nhà tuyển dụng"
        verbose_name_plural = "Nhà tuyển dụng"

    def __str__(self):
        return self.ten_cong_ty
#Danh mục
class NganhNghe(BaseModel):
    ten = models.CharField(max_length=255, unique=True)
    mo_ta = RichTextField(blank=True)
    icon = models.ImageField(upload_to='nganhnghe/%Y/%m', null=True, blank=True)

    class Meta:
        verbose_name = "Ngành nghề"
        verbose_name_plural = "Ngành nghề"

    def __str__(self):
        return self.ten

#Tin tuyển dụng
class TinTuyenDung(BaseModel): #ck

    TRANG_THAI_CHOICES = [
        ('dang_tuyen', 'Đang tuyển'),
        ('het_han', 'Hết hạn'),
        ('dong', 'Đã đóng'),
    ]
    nha_tuyen_dung = models.ForeignKey(NhaTuyenDung, on_delete=models.CASCADE, related_name='tin_tuyen_dung')
    nganh_nghe = models.ForeignKey(NganhNghe, on_delete=models.SET_NULL, null=True, related_name='tin_tuyen_dung')
    tieu_de = models.CharField( max_length=300, verbose_name="Vị trí") #Tên vị trí
    mo_ta_cong_viec = RichTextField(verbose_name="Mô tả công việc") #mô tả công việc
    yeu_cau  = RichTextField(verbose_name="Yêu cầu ứng viên") #Yêu câầu ứng viên

    muc_luong_tu  = models.DecimalField(max_digits=15, decimal_places=0, null=False, blank=False)
    muc_luong_den  = models.DecimalField(max_digits=15, decimal_places=0, null=False, blank=False)
    don_vi_luong =models.CharField(max_length=50, default='VNĐ')

    dai_ngo = RichTextField(verbose_name="Chế độ đãi ngộ") #Chế độ đãi ngộ
    dia_diem = models.CharField(max_length=300, verbose_name="Địa điểm làm việc")
    so_luong_tuyen = models.IntegerField(default=1, validators=[MinValueValidator(1)])

    ngay_dang = models.DateTimeField(auto_now_add=True)
    han_nop_ho_so = models.DateField(verbose_name="Hạn nộp hồ sơ")
    trang_thai = models.CharField(max_length=20, choices=TRANG_THAI_CHOICES, default='dang_tuyen')

    #Mở rộng gói tin nổi bật
    tin_noi_bat = models.BooleanField(default=False)
    ngay_het_han_noi_bat = models.DateTimeField(null=True, blank=True)
    luot_xem = models.IntegerField(default=0)

    class Meta:
        verbose_name = "Tin tuyển dụng"
        verbose_name_plural = "Tin tuyển dụng"
        ordering = ['-ngay_dang']

    def __str__(self):
        return f"{self.tieu_de} - {self.nha_tuyen_dung.ten_cong_ty}"

    def kiem_tra_het_han(self):
        if self.han_nop_ho_so < timezone.now().date():
            self.trang_thai = 'het_han'
            self.save()

#Hồ sơ ứng tuyển
class HoSoUngTuyen(BaseModel):
    TRANG_THAI_CHOICES = [
        ('moi_nop', 'Mới nộp'),
        ('da_xem', 'Đã xem'),
        ('phu_hop', 'Phù hợp'),
        ('khong_phu_hop', 'Không phù hợp'),
        ('phong_van', 'Mời phỏng vấn'),
        ('trung_tuyen', 'Trúng tuyển'),
        ('tu_choi', 'Từ chối'),
    ]
    tin_tuyen_dung = models.ForeignKey(TinTuyenDung, on_delete=models.CASCADE, related_name='ho_so')
    ung_vien = models.ForeignKey(UngVien, on_delete=models.CASCADE, related_name='ho_so_ung_tuyen')
    ngay_nop = models.DateTimeField(auto_now_add=True)
    trang_thai = models.CharField(max_length=20, choices=TRANG_THAI_CHOICES, default='moi_nop')
    cv_dinh_kem = models.FileField(upload_to="cv_dinh", null=True, blank=True)
    danh_gia = models.IntegerField(null=True, blank=True, validators=[MinValueValidator(1), MaxValueValidator(5)])
    ghi_chu_nha_tuyen_dung = RichTextField( blank=True)

    class Meta:
        verbose_name = "Hồ sơ ứng tuyển"
        verbose_name_plural = "Hồ sơ ứng tuyển"
        ordering = ['-ngay_nop']
        unique_together = ['tin_tuyen_dung', 'ung_vien']

    def __str__(self):
        return f"{self.ung_vien.ho_ten} - {self.tin_tuyen_dung.tieu_de}"

#Lưu và so sánh công việc
class SoSanhCongViec(BaseModel):
    ung_vien = models.ForeignKey(UngVien, on_delete=models.CASCADE, related_name='so_sanh')
    tin_tuyen_dung = models.ManyToManyField(TinTuyenDung, related_name='duoc_so_sanh')
    ghi_chu = RichTextField(blank=True, null=True)


    class Meta:
        verbose_name = "So sánh công việc"
        verbose_name_plural = "So sánh công việc"

   #Mở rộng
class GoiDichVu(BaseModel):
    LOAI_GOI_CHOICES = [
        ('noi_bat_tin', 'Tin tuyển dụng nổi bật'),
        ('uu_tien_ho_so', 'Hồ sơ ứng viên ưu tiên'),
        ('dang_nhieu_tin', 'Đăng nhiều tin tuyển dụng'),
    ]
    ten_goi = models.CharField(max_length=200)
    loai_goi = models.CharField(max_length=30, choices=LOAI_GOI_CHOICES)
    mo_ta = RichTextField()
    gia = models.DecimalField(max_digits=12, decimal_places=0)
    thoi_han_ngay = models.IntegerField(verbose_name="Thời hạn (ngày)")
    tinh_nang = RichTextField(verbose_name="Các tính năng")

    class Meta:
        verbose_name = "Gói dịch vụ"
        verbose_name_plural = "Gói dịch vụ"

    def __str__(self):
        return self.ten_goi


# Model Giao dịch thanh toán (mở rộng)
class GiaoDich(models.Model):
    PHUONG_THUC_CHOICES = [
        ('tien_mat', 'Tiền mặt'),
        ('paypal', 'PayPal'),
        ('stripe', 'Stripe'),
        ('momo', 'MoMo'),
        ('zalopay', 'ZaloPay'),
    ]

    TRANG_THAI_CHOICES = [
        ('cho_thanh_toan', 'Chờ thanh toán'),
        ('thanh_cong', 'Thành công'),
        ('that_bai', 'Thất bại'),
        ('hoan_tien', 'Hoàn tiền'),
    ]

    nguoi_dung = models.ForeignKey(User, on_delete=models.CASCADE, related_name='giao_dich')
    goi_dich_vu = models.ForeignKey(GoiDichVu, on_delete=models.SET_NULL, null=True)
    ma_giao_dich = models.CharField(max_length=100, unique=True)
    so_tien = models.DecimalField(max_digits=12, decimal_places=0)
    phuong_thuc = models.CharField(max_length=20, choices=PHUONG_THUC_CHOICES)
    trang_thai = models.CharField(max_length=20, choices=TRANG_THAI_CHOICES, default='cho_thanh_toan')
    ngay_tao = models.DateTimeField(auto_now_add=True)
    ngay_thanh_toan = models.DateTimeField(null=True, blank=True)
    ghi_chu = RichTextField(blank=True, null=True)

    class Meta:
        verbose_name = "Giao dịch"
        verbose_name_plural = "Giao dịch"
        ordering = ['-ngay_tao']

    def __str__(self):
        return f"{self.ma_giao_dich} - {self.nguoi_dung.username}"