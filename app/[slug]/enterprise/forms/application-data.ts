export const GRAB_APPLICATION_REASONS = [
  'Aplikasi Grab Eror',
  'Pembelian dan Tagihan',
  'Alamat Pengantar Salah',
  'Penerima Tidak Aktif atau Fiktif',
  'Pelanggan tidak bisa di Hubungi',
  'Pelanggan Tidak Mau Membayar',
  'Orderan Tidak Sesuai Pesanan',
] as const;

export type GrabApplicationReason = (typeof GRAB_APPLICATION_REASONS)[number];

export type ApplicationFormSource = 'reimbursement' | 'pendapat' | 'lainnya';

export type GrabApplicationData = {
  name: string;
  phone: string;
  total: string;
  orderNumber: string;
  reason: string;
};

export const EMPTY_GRAB_APPLICATION: GrabApplicationData = {
  name: '',
  phone: '',
  total: '',
  orderNumber: '',
  reason: '',
};
