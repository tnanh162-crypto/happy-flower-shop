export default function Footer() {
  return (
    <footer className="mt-20 border-t border-cream-300 bg-cream-200/60">
      <div className="container-shop py-10 grid gap-8 md:grid-cols-3">
        <div>
          <p className="font-display text-xl mb-2">Happy Flower - Hoa sáp Hải Phòng</p>
          <p className="text-sm text-ink-soft leading-relaxed max-w-xs">
            Hoa tươi mỗi ngày, giao trong 2 giờ nội thành. Nhận đặt hoa sỉ và hợp tác cộng tác viên.
          </p>
        </div>
        <div className="text-sm text-ink-soft">
          <p className="font-medium text-ink mb-2">Liên hệ</p>
          <p>Hotline: 0345142829</p>
          <p>Địa chỉ: 3/107/280 Trần Nguyên Hãn, Lê Chân, Hải Phòng</p>
        </div>
        <div className="text-sm text-ink-soft">
          <p className="font-medium text-ink mb-2">Bảng giá</p>
          <p>Khách lẻ · Khách sỉ · Cộng tác viên</p>
          <p className="mt-1">Liên hệ để đăng ký tài khoản sỉ / CTV.</p>
        </div>
      </div>
      <div className="text-center text-xs text-ink-soft/70 pb-6">
        © {new Date().getFullYear()} Happy Flower - Hoa sáp Hải Phòng. Đã đăng ký bản quyền.
      </div>
    </footer>
  );
}
