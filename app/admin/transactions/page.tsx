'use client';

import React, { useState, useMemo } from 'react';
import { useAdmin } from '../../../lib/context/AdminContext';
import { PageHeader } from '../../../components/ui/PageHeader';
import { StatCard } from '../../../components/ui/StatCard';
import { SearchFilterBar } from '../../../components/ui/SearchFilterBar';
import { StatusBadge } from '../../../components/ui/StatusBadge';
import { Pagination } from '../../../components/ui/Pagination';
import { EmptyState } from '../../../components/ui/EmptyState';
import { useToast } from '../../../components/ui/Toast';
import { formatDateTime, formatRupiah, formatNumber } from '../../../lib/utils/formatters';
import { AdminTransaction } from '../../../lib/types/admin';
import {
  Receipt,
  CheckCircle2,
  Clock,
  AlertCircle,
  X,
  FileCheck,
  ShieldCheck,
  Eye,
  Crown,
  AlertTriangle,
  Check,
} from 'lucide-react';

export default function TransactionsPage() {
  const { transactions, verifyTransaction } = useAdmin();
  const { success, error } = useToast();

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'success' | 'failed'>('all');
  const [methodFilter, setMethodFilter] = useState('all');

  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  // Modals state
  const [selectedTxForVerification, setSelectedTxForVerification] = useState<AdminTransaction | null>(null);
  const [selectedTxForReceipt, setSelectedTxForReceipt] = useState<AdminTransaction | null>(null);
  const [proofZoomUrl, setProofZoomUrl] = useState<string | null>(null);

  // Rejection reason state inside verification modal
  const [isRejecting, setIsRejecting] = useState(false);
  const [rejectionReason, setRejectionReason] = useState('Bukti pembayaran tidak sesuai atau palsu');
  const [customRejectionReason, setCustomRejectionReason] = useState('');

  // Filtering transactions
  const filteredTransactions = useMemo(() => {
    return transactions.filter((tx) => {
      if (searchQuery) {
        const q = searchQuery.toLowerCase();
        const matchId = tx.id.toLowerCase().includes(q);
        const matchName = tx.userName.toLowerCase().includes(q);
        const matchRef = tx.referenceNumber?.toLowerCase().includes(q) || false;
        if (!matchId && !matchName && !matchRef) return false;
      }
      if (statusFilter !== 'all' && tx.status !== statusFilter) {
        return false;
      }
      if (methodFilter !== 'all' && tx.paymentMethod !== methodFilter) {
        return false;
      }
      return true;
    });
  }, [transactions, searchQuery, statusFilter, methodFilter]);

  const totalPages = Math.ceil(filteredTransactions.length / itemsPerPage) || 1;
  const paginatedTransactions = filteredTransactions.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const totalSuccessAmount = transactions
    .filter((t) => t.status === 'success')
    .reduce((acc, t) => acc + t.total, 0);

  const pendingCount = transactions.filter((t) => t.status === 'pending').length;
  const successCount = transactions.filter((t) => t.status === 'success').length;
  const failedCount = transactions.filter((t) => t.status === 'failed').length;

  // Handle Admin Approving a Transaction
  const handleApprove = (tx: AdminTransaction) => {
    verifyTransaction(tx.id, 'approve');
    setSelectedTxForVerification(null);
    setIsRejecting(false);
    success(
      'Pembayaran Disetujui & Terverifikasi!',
      `Akun ${tx.userName} kini aktif berlangganan ${tx.planName}. Hak akses Premium telah diberikan.`
    );
  };

  // Handle Admin Rejecting a Transaction
  const handleReject = (tx: AdminTransaction) => {
    const finalReason = rejectionReason === 'Lainnya' ? customRejectionReason.trim() || 'Bukti transfer tidak valid' : rejectionReason;
    verifyTransaction(tx.id, 'reject', finalReason);
    setSelectedTxForVerification(null);
    setIsRejecting(false);
    error(
      'Pembayaran Ditolak',
      `Transaksi ${tx.id} ditandai tidak valid. Alasan: "${finalReason}".`
    );
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Verifikasi & Riwayat Transaksi"
        description="Periksa bukti foto pembayaran langganan dari pengguna, verifikasi keabsahan dana, dan setujui atau tolak transaksi langganan."
        breadcrumbs={[{ label: 'Transaksi' }]}
      />

      {/* KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <StatCard
          title="Menunggu Verifikasi"
          value={pendingCount.toString()}
          subtitle="Bukti bayar perlu diperiksa"
          icon={<Clock className="w-5 h-5" />}
          iconBg="bg-[#FFF5E8]"
          iconColor="text-[#E58A16]"
        />
        <StatCard
          title="Diverifikasi / Sukses"
          value={formatNumber(successCount)}
          subtitle="Langganan pengguna aktif"
          icon={<CheckCircle2 className="w-5 h-5" />}
          iconBg="bg-[#EAF8F1]"
          iconColor="text-[#21865B]"
        />
        <StatCard
          title="Ditolak / Tidak Valid"
          value={failedCount.toString()}
          subtitle="Bukti palsu / kurang bayar"
          icon={<AlertCircle className="w-5 h-5" />}
          iconBg="bg-[#FEECEF]"
          iconColor="text-[#D94152]"
        />
        <StatCard
          title="Total Pendapatan Terverifikasi"
          value={formatRupiah(totalSuccessAmount)}
          subtitle="Dari transaksi disetujui"
          icon={<Receipt className="w-5 h-5" />}
          iconBg="bg-[#F6F1F8]"
          iconColor="text-[#4B0B7A]"
        />
      </div>

      {/* Pending Attention Banner */}
      {pendingCount > 0 && (
        <div className="p-4 rounded-2xl bg-[#FFF9E0] border border-[#FFD52E] flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-[#FFD52E] text-[#21052F] font-bold flex items-center justify-center shrink-0">
              <AlertTriangle className="w-5 h-5 text-[#21052F]" />
            </div>
            <div>
              <p className="text-xs font-black text-[#21052F] uppercase tracking-wide">
                Ada {pendingCount} Pembayaran Menunggu Verifikasi Admin
              </p>
              <p className="text-[11px] text-[#786F7D] mt-0.5">
                Pengguna telah mengunggah foto bukti pembayaran. Harap verifikasi keabsahan bukti struk sebelum menyetujui hak akses Premium.
              </p>
            </div>
          </div>
          <button
            onClick={() => setStatusFilter('pending')}
            className="px-3.5 py-1.5 rounded-xl bg-[#4B0B7A] text-white text-xs font-bold shrink-0 hover:bg-[#3B0762] transition-colors"
          >
            Filter Menunggu ({pendingCount})
          </button>
        </div>
      )}

      {/* Search and Filters */}
      <SearchFilterBar
        searchValue={searchQuery}
        onSearchChange={(val) => {
          setSearchQuery(val);
          setCurrentPage(1);
        }}
        searchPlaceholder="Cari ID transaksi (TRX-...), nama pengguna, atau no referensi..."
        hasActiveFilters={statusFilter !== 'all' || methodFilter !== 'all' || !!searchQuery}
        onResetFilters={() => {
          setSearchQuery('');
          setStatusFilter('all');
          setMethodFilter('all');
          setCurrentPage(1);
        }}
      >
        <select
          value={statusFilter}
          onChange={(e) => {
            setStatusFilter(e.target.value as 'all' | 'pending' | 'success' | 'failed');
            setCurrentPage(1);
          }}
          className="bg-[#F8F7FA] border border-[#EEE8F0] rounded-xl px-3 py-2 text-xs font-semibold text-[#24172B] focus:outline-hidden"
        >
          <option value="all">Semua Status</option>
          <option value="pending">⏳ Menunggu Verifikasi</option>
          <option value="success">✓ Diverifikasi / Berhasil</option>
          <option value="failed">✕ Ditolak</option>
        </select>

        <select
          value={methodFilter}
          onChange={(e) => {
            setMethodFilter(e.target.value);
            setCurrentPage(1);
          }}
          className="bg-[#F8F7FA] border border-[#EEE8F0] rounded-xl px-3 py-2 text-xs font-semibold text-[#24172B] focus:outline-hidden"
        >
          <option value="all">Semua Metode</option>
          <option value="BCA Virtual Account">BCA Virtual Account</option>
          <option value="QRIS">QRIS</option>
          <option value="Mandiri VA">Mandiri VA</option>
          <option value="GoPay">GoPay</option>
          <option value="ShopeePay">ShopeePay</option>
        </select>
      </SearchFilterBar>

      {/* Transactions Table */}
      {filteredTransactions.length === 0 ? (
        <EmptyState
          icon={<Receipt className="w-7 h-7" />}
          title="Tidak Ada Transaksi"
          description="Tidak ada catatan transaksi yang sesuai dengan filter pencarian Anda."
        />
      ) : (
        <div className="bg-white rounded-2xl border border-[#EEE8F0] shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-[#FAF8FB] text-[11px] font-bold text-[#786F7D] uppercase tracking-wider border-b border-[#EEE8F0]">
                  <th className="py-3.5 px-4">ID Transaksi</th>
                  <th className="py-3.5 px-4">Pelanggan</th>
                  <th className="py-3.5 px-4">Paket Langganan</th>
                  <th className="py-3.5 px-4">Metode Bayar</th>
                  <th className="py-3.5 px-4 text-right">Total Tagihan</th>
                  <th className="py-3.5 px-4 text-center">Status Pembayaran</th>
                  <th className="py-3.5 px-4">Bukti Pembayaran</th>
                  <th className="py-3.5 px-4 text-right">Tindakan Admin</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#EEE8F0]">
                {paginatedTransactions.map((tx) => {
                  const isPending = tx.status === 'pending';

                  return (
                    <tr
                      key={tx.id}
                      className={`transition-colors ${
                        isPending ? 'bg-[#FFFDF5] hover:bg-[#FFF9E6]' : 'hover:bg-[#FAF8FB]'
                      }`}
                    >
                      <td className="py-3.5 px-4 font-mono font-bold text-[#4B0B7A]">
                        {tx.id}
                      </td>

                      <td className="py-3.5 px-4">
                        <p className="font-bold text-[#24172B]">{tx.userName}</p>
                        <span className="text-[10px] text-[#786F7D] font-mono">{tx.userEmail}</span>
                      </td>

                      <td className="py-3.5 px-4">
                        <span className="font-bold text-[#24172B] block">{tx.planName}</span>
                        <span className="text-[10px] text-[#786F7D]">
                          {tx.planDurationDays || (tx.planId === 'annual' ? 365 : tx.planId === 'quarterly' ? 90 : 30)} Hari Akses
                        </span>
                      </td>

                      <td className="py-3.5 px-4">
                        <span className="px-2 py-0.5 rounded bg-[#F8F7FA] font-medium text-[#786F7D] border border-[#EEE8F0]">
                          {tx.paymentMethod}
                        </span>
                      </td>

                      <td className="py-3.5 px-4 text-right font-black text-[#24172B]">
                        {formatRupiah(tx.total)}
                      </td>

                      <td className="py-3.5 px-4 text-center">
                        <StatusBadge type="transaction" value={tx.status} />
                      </td>

                      <td className="py-3.5 px-4">
                        {tx.paymentProofUrl ? (
                          <button
                            type="button"
                            onClick={() => setSelectedTxForVerification(tx)}
                            className="inline-flex items-center gap-1.5 px-2 py-1 rounded-lg bg-white border border-[#EEE8F0] hover:border-[#4B0B7A] text-[11px] font-bold text-[#4B0B7A] transition-colors shadow-2xs"
                          >
                            <Eye className="w-3.5 h-3.5 text-[#4B0B7A]" />
                            Lihat Foto Bukti
                          </button>
                        ) : (
                          <span className="text-[11px] text-[#786F7D] italic">Tidak ada foto</span>
                        )}
                      </td>

                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          {isPending ? (
                            <button
                              onClick={() => {
                                setSelectedTxForVerification(tx);
                                setIsRejecting(false);
                              }}
                              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#4B0B7A] hover:bg-[#3B0762] text-white text-xs font-bold shadow-xs transition-all animate-pulse"
                            >
                              <ShieldCheck className="w-3.5 h-3.5 text-[#FFD52E]" />
                              Periksa & Verifikasi
                            </button>
                          ) : (
                            <>
                              <button
                                onClick={() => setSelectedTxForVerification(tx)}
                                className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-[#F8F7FA] text-[#786F7D] hover:text-[#24172B] hover:bg-[#EEE8F0] transition-colors"
                              >
                                Detail Bukti
                              </button>
                              <button
                                onClick={() => setSelectedTxForReceipt(tx)}
                                className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-[#F6F1F8] text-[#4B0B7A] hover:bg-[#E9DEEF] transition-colors"
                              >
                                Kuitansi
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            totalItems={filteredTransactions.length}
            itemsPerPage={itemsPerPage}
            onPageChange={setCurrentPage}
            onItemsPerPageChange={(size) => {
              setItemsPerPage(size);
              setCurrentPage(1);
            }}
          />
        </div>
      )}

      {/* ========================================================================= */}
      {/* 1. MODAL VERIFIKASI PEMBAYARAN OLEH ADMIN                                */}
      {/* ========================================================================= */}
      {selectedTxForVerification && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl max-w-3xl w-full p-6 shadow-2xl border border-[#EEE8F0] transform animate-in zoom-in-95 duration-200 space-y-5 max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-3 border-b border-[#EEE8F0]">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-[#F6F1F8] text-[#4B0B7A] flex items-center justify-center font-bold">
                  <ShieldCheck className="w-5 h-5 text-[#4B0B7A]" />
                </div>
                <div>
                  <h3 className="text-base font-black text-[#24172B] flex items-center gap-2">
                    Verifikasi Pembayaran Pengguna
                    <span className="font-mono text-xs text-[#786F7D] font-normal">
                      ({selectedTxForVerification.id})
                    </span>
                  </h3>
                  <p className="text-xs text-[#786F7D]">
                    Periksa kesesuaian struk transfer dengan paket langganan yang dipilih pengguna.
                  </p>
                </div>
              </div>
              <button
                onClick={() => {
                  setSelectedTxForVerification(null);
                  setIsRejecting(false);
                }}
                className="p-1.5 text-[#786F7D] hover:text-[#24172B] rounded-xl hover:bg-[#F8F7FA] transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Content: Proof Photo (Left) vs Data Comparison (Right) */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
              {/* Left: Proof Preview */}
              <div className="md:col-span-5 space-y-2">
                <label className="block text-xs font-bold text-[#24172B] uppercase tracking-wide">
                  Foto Bukti Transfer Terlampir:
                </label>
                <div
                  onClick={() => selectedTxForVerification.paymentProofUrl && setProofZoomUrl(selectedTxForVerification.paymentProofUrl)}
                  className="rounded-2xl border border-[#EEE8F0] overflow-hidden bg-[#FAF8FB] p-2 relative group cursor-pointer hover:border-[#4B0B7A] transition-all shadow-inner"
                >
                  {selectedTxForVerification.paymentProofUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={selectedTxForVerification.paymentProofUrl}
                      alt="Bukti Transfer"
                      className="w-full h-80 object-contain rounded-xl bg-white transition-transform group-hover:scale-[1.02]"
                    />
                  ) : (
                    <div className="h-64 flex flex-col items-center justify-center text-center p-4 text-[#786F7D]">
                      <AlertCircle className="w-8 h-8 text-[#D94152] mb-2" />
                      <p className="font-bold text-xs">Pengguna Belum Melampirkan Bukti Foto</p>
                      <p className="text-[10px] mt-1">Pembayaran tidak dapat disetujui tanpa bukti transfer.</p>
                    </div>
                  )}

                  {selectedTxForVerification.paymentProofUrl && (
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity rounded-2xl text-white text-xs font-bold gap-1.5 backdrop-blur-2xs">
                      <Eye className="w-4 h-4" /> Klik untuk Perbesar
                    </div>
                  )}
                </div>
                <p className="text-[10px] text-center text-[#786F7D]">
                  Format foto: Struk m-Banking / e-Wallet / QRIS
                </p>
              </div>

              {/* Right: Validation Checklist & Comparison */}
              <div className="md:col-span-7 space-y-4">
                {/* Status Box */}
                <div className="p-3.5 rounded-2xl bg-[#FAF8FB] border border-[#EEE8F0] flex items-center justify-between">
                  <div>
                    <span className="text-[10px] text-[#786F7D] font-bold uppercase tracking-wider block">
                      Status Transaksi
                    </span>
                    <span className="text-sm font-black text-[#24172B] mt-0.5 block">
                      {selectedTxForVerification.status === 'pending'
                        ? 'Menunggu Verifikasi Admin'
                        : selectedTxForVerification.status === 'success'
                        ? 'Telah Disetujui (Aktif)'
                        : 'Telah Ditolak'}
                    </span>
                  </div>
                  <StatusBadge type="transaction" value={selectedTxForVerification.status} />
                </div>

                {/* Validation Attributes */}
                <div className="space-y-2 text-xs border border-[#EEE8F0] rounded-2xl p-4 bg-white">
                  <h4 className="font-bold text-xs text-[#24172B] uppercase tracking-wider pb-2 border-b border-[#EEE8F0] flex items-center justify-between">
                    <span>Data Verifikasi Pembayaran</span>
                    <span className="text-[10px] font-semibold text-[#4B0B7A] bg-[#F6F1F8] px-2 py-0.5 rounded-md">
                      Pencocokan Data
                    </span>
                  </h4>

                  <div className="flex justify-between py-1 border-b border-[#F8F7FA]">
                    <span className="text-[#786F7D]">Pengguna:</span>
                    <span className="font-bold text-[#24172B] text-right">
                      {selectedTxForVerification.userName}
                    </span>
                  </div>

                  <div className="flex justify-between py-1 border-b border-[#F8F7FA]">
                    <span className="text-[#786F7D]">Paket yang Dibeli:</span>
                    <span className="font-bold text-[#4B0B7A] text-right flex items-center gap-1">
                      <Crown className="w-3.5 h-3.5 text-[#FFD52E]" />
                      {selectedTxForVerification.planName}
                    </span>
                  </div>

                  <div className="flex justify-between py-1 border-b border-[#F8F7FA]">
                    <span className="text-[#786F7D]">Nominal Tagihan:</span>
                    <span className="font-black text-sm text-[#24172B] text-right">
                      {formatRupiah(selectedTxForVerification.total)}
                    </span>
                  </div>

                  <div className="flex justify-between py-1 border-b border-[#F8F7FA]">
                    <span className="text-[#786F7D]">Metode / Saluran:</span>
                    <span className="font-semibold text-[#24172B] text-right">
                      {selectedTxForVerification.paymentMethod}
                    </span>
                  </div>

                  <div className="flex justify-between py-1 border-b border-[#F8F7FA]">
                    <span className="text-[#786F7D]">Nama di Bukti Transfer:</span>
                    <span className="font-bold text-[#24172B] text-right">
                      {selectedTxForVerification.senderName || selectedTxForVerification.userName}
                    </span>
                  </div>

                  <div className="flex justify-between py-1 border-b border-[#F8F7FA]">
                    <span className="text-[#786F7D]">No. Referensi / Mutasi:</span>
                    <span className="font-mono font-bold text-[#24172B] text-right">
                      {selectedTxForVerification.referenceNumber || '-'}
                    </span>
                  </div>

                  <div className="flex justify-between py-1">
                    <span className="text-[#786F7D]">Waktu Pengajuan:</span>
                    <span className="font-medium text-[#786F7D] text-right">
                      {formatDateTime(selectedTxForVerification.createdAt)}
                    </span>
                  </div>
                </div>

                {/* System / Admin Warning notes if any */}
                {selectedTxForVerification.notes && (
                  <div className="p-3 rounded-xl bg-[#FFF9E0] border border-[#FFD52E] text-xs text-[#21052F] flex items-start gap-2">
                    <AlertTriangle className="w-4 h-4 text-[#D97706] shrink-0 mt-0.5" />
                    <p className="leading-relaxed">
                      <strong>Catatan Sistem:</strong> {selectedTxForVerification.notes}
                    </p>
                  </div>
                )}

                {/* Rejection Details if already rejected */}
                {selectedTxForVerification.status === 'failed' && (
                  <div className="p-3 rounded-xl bg-[#FEECEF] border border-[#FECDD3] text-xs text-[#991B1B] space-y-1">
                    <p className="font-bold flex items-center gap-1.5">
                      <AlertCircle className="w-4 h-4 text-[#D94152]" /> Transaksi Telah Ditolak
                    </p>
                    <p className="text-[11px]">
                      <strong>Alasan:</strong> {selectedTxForVerification.rejectionReason || 'Bukti transfer tidak valid'}
                    </p>
                    {selectedTxForVerification.verifiedAt && (
                      <p className="text-[10px] text-[#7F1D1D]/80">
                        Diproses pada: {formatDateTime(selectedTxForVerification.verifiedAt)} oleh {selectedTxForVerification.verifiedBy || 'Admin'}
                      </p>
                    )}
                  </div>
                )}

                {/* Approval details if already approved */}
                {selectedTxForVerification.status === 'success' && (
                  <div className="p-3 rounded-xl bg-[#EAF8F1] border border-[#C6EFD9] text-xs text-[#14532D] space-y-1">
                    <p className="font-bold flex items-center gap-1.5">
                      <CheckCircle2 className="w-4 h-4 text-[#21865B]" /> Transaksi Telah Diverifikasi & Disetujui
                    </p>
                    <p className="text-[11px]">
                      Langganan akun <strong>{selectedTxForVerification.userName}</strong> aktif berstatus Premium.
                    </p>
                    {selectedTxForVerification.verifiedAt && (
                      <p className="text-[10px] text-[#14532D]/80">
                        Disetujui pada: {formatDateTime(selectedTxForVerification.verifiedAt)} oleh {selectedTxForVerification.verifiedBy || 'Admin'}
                      </p>
                    )}
                  </div>
                )}

                {/* ============================================================ */}
                {/* ACTION BUTTONS (FOR PENDING TRANSACTIONS)                    */}
                {/* ============================================================ */}
                {selectedTxForVerification.status === 'pending' && (
                  <div className="pt-2 space-y-3">
                    {!isRejecting ? (
                      <div className="grid grid-cols-2 gap-3">
                        <button
                          type="button"
                          onClick={() => setIsRejecting(true)}
                          className="px-4 py-2.5 rounded-xl border border-[#D94152] text-[#D94152] hover:bg-[#FEECEF] text-xs font-bold transition-colors flex items-center justify-center gap-1.5"
                        >
                          <X className="w-4 h-4" /> Tolak Pembayaran
                        </button>

                        <button
                          type="button"
                          onClick={() => handleApprove(selectedTxForVerification)}
                          className="px-4 py-2.5 rounded-xl bg-[#21865B] hover:bg-[#1A6E4A] text-white text-xs font-black transition-all flex items-center justify-center gap-1.5 shadow-md"
                        >
                          <Check className="w-4 h-4" /> Setujui Pembayaran
                        </button>
                      </div>
                    ) : (
                      /* Reject Reason Form */
                      <div className="p-4 rounded-2xl bg-[#FFF5F6] border border-[#FECDD3] space-y-3 animate-in fade-in duration-150">
                        <div className="flex items-center justify-between">
                          <label className="block text-xs font-bold text-[#991B1B] uppercase tracking-wide">
                            Pilih Alasan Penolakan:
                          </label>
                          <button
                            type="button"
                            onClick={() => setIsRejecting(false)}
                            className="text-[11px] text-[#786F7D] hover:underline"
                          >
                            Batal
                          </button>
                        </div>

                        <select
                          value={rejectionReason}
                          onChange={(e) => setRejectionReason(e.target.value)}
                          className="w-full bg-white border border-[#FECDD3] rounded-xl px-3 py-2 text-xs font-semibold text-[#24172B] focus:outline-hidden"
                        >
                          <option value="Bukti pembayaran tidak sesuai atau palsu">
                            Bukti pembayaran terindikasi editan / bohongan / palsu
                          </option>
                          <option value="Nominal transfer kurang dari harga paket yang dipilih">
                            Nominal transfer kurang / tidak sesuai dengan harga paket
                          </option>
                          <option value="Dana tidak ditemukan pada mutasi rekening bank">
                            Dana transfer belum masuk pada mutasi rekening
                          </option>
                          <option value="Foto bukti transfer buram atau tidak terbaca">
                            Foto bukti struk buram, terpotong, atau tidak terbaca
                          </option>
                          <option value="Lainnya">Alasan Lainnya (Ketik sendiri)</option>
                        </select>

                        {rejectionReason === 'Lainnya' && (
                          <input
                            type="text"
                            value={customRejectionReason}
                            onChange={(e) => setCustomRejectionReason(e.target.value)}
                            placeholder="Tuliskan alasan penolakan secara spesifik..."
                            className="w-full bg-white border border-[#FECDD3] rounded-xl px-3 py-2 text-xs text-[#24172B]"
                          />
                        )}

                        <div className="flex justify-end gap-2 pt-1">
                          <button
                            type="button"
                            onClick={() => setIsRejecting(false)}
                            className="px-3 py-1.5 rounded-lg border border-[#EEE8F0] bg-white text-xs font-semibold text-[#786F7D]"
                          >
                            Batal
                          </button>
                          <button
                            type="button"
                            onClick={() => handleReject(selectedTxForVerification)}
                            className="px-4 py-1.5 rounded-lg bg-[#D94152] hover:bg-[#B91C1C] text-white text-xs font-bold"
                          >
                            Konfirmasi Tolak
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 2. MODAL ZOOM FOTO BUKTI PEMBAYARAN                                      */}
      {/* ========================================================================= */}
      {proofZoomUrl && (
        <div
          onClick={() => setProofZoomUrl(null)}
          className="fixed inset-0 z-[130] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-150 cursor-pointer"
        >
          <div className="relative max-w-lg w-full bg-white rounded-3xl p-3 shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <div className="flex justify-between items-center px-3 py-2 border-b border-[#EEE8F0] mb-2">
              <span className="text-xs font-bold text-[#24172B]">Pratinjau Bukti Transfer Penuh</span>
              <button
                onClick={() => setProofZoomUrl(null)}
                className="p-1 rounded-lg text-[#786F7D] hover:text-[#24172B]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={proofZoomUrl} alt="Bukti Transfer Penuh" className="w-full max-h-[75vh] object-contain rounded-2xl" />
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 4. MODAL KUITANSI PEMBAYARAN (RECEIPT)                                   */}
      {/* ========================================================================= */}
      {selectedTxForReceipt && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-[#EEE8F0] transform animate-in zoom-in-95 duration-200 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[#EEE8F0]">
              <div className="flex items-center gap-2">
                <FileCheck className="w-5 h-5 text-[#21865B]" />
                <h3 className="text-base font-bold text-[#24172B]">Kuitansi Pembayaran HUMORA</h3>
              </div>
              <button
                onClick={() => setSelectedTxForReceipt(null)}
                className="p-1 text-[#786F7D] hover:text-[#24172B] rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="text-center py-2 bg-[#FAF8FB] rounded-xl border border-[#EEE8F0]">
              <span className="text-[11px] text-[#786F7D] uppercase font-bold tracking-wider">
                Total Dibayar
              </span>
              <p className="text-2xl font-black text-[#24172B] mt-0.5">{formatRupiah(selectedTxForReceipt.total)}</p>
              <div className="mt-1 flex items-center justify-center">
                <StatusBadge type="transaction" value={selectedTxForReceipt.status} />
              </div>
            </div>

            <div className="space-y-2 text-xs">
              <div className="flex justify-between py-1.5 border-b border-[#F6F1F8]">
                <span className="text-[#786F7D]">ID Transaksi:</span>
                <span className="font-mono font-bold text-[#4B0B7A]">{selectedTxForReceipt.id}</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-[#F6F1F8]">
                <span className="text-[#786F7D]">Pelanggan:</span>
                <span className="font-bold text-[#24172B]">{selectedTxForReceipt.userName}</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-[#F6F1F8]">
                <span className="text-[#786F7D]">Paket:</span>
                <span className="font-semibold text-[#24172B]">{selectedTxForReceipt.planName}</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-[#F6F1F8]">
                <span className="text-[#786F7D]">Metode Bayar:</span>
                <span className="font-semibold text-[#24172B]">{selectedTxForReceipt.paymentMethod}</span>
              </div>
              {selectedTxForReceipt.referenceNumber && (
                <div className="flex justify-between py-1.5 border-b border-[#F6F1F8]">
                  <span className="text-[#786F7D]">No. Referensi:</span>
                  <span className="font-mono font-bold text-[#24172B]">{selectedTxForReceipt.referenceNumber}</span>
                </div>
              )}
              <div className="flex justify-between py-1.5">
                <span className="text-[#786F7D]">Waktu:</span>
                <span className="font-medium text-[#786F7D]">{formatDateTime(selectedTxForReceipt.createdAt)}</span>
              </div>
            </div>

            <div className="pt-3 border-t border-[#EEE8F0] flex items-center justify-between text-xs">
              <span className="text-[#786F7D] text-[10px] italic">*Simulasi prototype frontend HUMORA</span>
              <button
                onClick={() => setSelectedTxForReceipt(null)}
                className="px-4 py-2 rounded-xl bg-[#4B0B7A] text-white text-xs font-bold hover:bg-[#3B0762]"
              >
                Tutup Kuitansi
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
