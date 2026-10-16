'use client';

import React, { useState } from 'react';
import { useAdmin } from '../../../lib/context/AdminContext';
import { PageHeader } from '../../../components/ui/PageHeader';
import { ConfirmDialog } from '../../../components/ui/ConfirmDialog';
import { useToast } from '../../../components/ui/Toast';
import { formatRupiah } from '../../../lib/utils/formatters';
import {
  Settings,
  Save,
  RotateCcw,
  Sparkles,
  CreditCard,
  Crown,
  Shield,
  Layers,
  Database,
  CheckCircle2,
} from 'lucide-react';

export default function SettingsPage() {
  const {
    settings,
    updateSettings,
    resetAllDataToDefault,
    series,
    episodes,
    users,
    transactions,
  } = useAdmin();
  const { success } = useToast();

  const [appName, setAppName] = useState(settings.appName);
  const [tagline, setTagline] = useState(settings.tagline);
  const [supportEmail, setSupportEmail] = useState(settings.supportEmail);
  const [defaultFreeEpisodes, setDefaultFreeEpisodes] = useState(settings.defaultFreeEpisodes);
  const [plans, setPlans] = useState(settings.plans);

  const [isResetModalOpen, setIsResetModalOpen] = useState(false);

  const handlePlanPriceChange = (planId: string, newPrice: number) => {
    setPlans((prev) =>
      prev.map((p) => (p.id === planId ? { ...p, price: newPrice } : p))
    );
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    updateSettings({
      appName,
      tagline,
      supportEmail,
      defaultFreeEpisodes,
      plans,
    });
    success('Pengaturan Disimpan', 'Konfigurasi brand, paket langganan, dan demo berhasil diperbarui.');
  };

  const handleResetConfirm = () => {
    resetAllDataToDefault();
    setAppName('HUMORA');
    setTagline('Scroll. laugh. repeat.');
    setDefaultFreeEpisodes(2);
    setIsResetModalOpen(false);
    success('Data Demo Direset', 'Katalog dan analitik dikembalikan ke kondisi bawaan awal.');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <PageHeader
        title="Pengaturan Admin & Platform"
        description="Konfigurasi identitas brand HUMORA, aturan batas episode gratis, paket langganan premium, dan kontrol data simulasi."
        breadcrumbs={[{ label: 'Pengaturan' }]}
        actions={
          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsResetModalOpen(true)}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-[#D94152]/30 bg-[#FEECEF] text-xs font-bold text-[#D94152] hover:bg-[#FCD8DF] transition-colors"
            >
              <RotateCcw className="w-4 h-4" /> Reset Data Demo
            </button>
            <button
              onClick={handleSave}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#4B0B7A] hover:bg-[#3B0762] text-xs font-bold text-white transition-all shadow-xs"
            >
              <Save className="w-4 h-4 text-[#FFD52E]" /> Simpan Pengaturan
            </button>
          </div>
        }
      />

      <form onSubmit={handleSave} className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Column (2 cols) */}
        <div className="lg:col-span-2 space-y-6">
          {/* Brand Identity Card */}
          <div className="bg-white p-6 rounded-2xl border border-[#EEE8F0] shadow-xs space-y-4">
            <h3 className="text-sm font-bold text-[#24172B] uppercase tracking-wider pb-2 border-b border-[#EEE8F0]">
              Identitas Brand Platform
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-[#24172B] uppercase tracking-wide mb-1.5">
                  Nama Platform
                </label>
                <input
                  type="text"
                  value={appName}
                  onChange={(e) => setAppName(e.target.value)}
                  className="w-full bg-[#F8F7FA] border border-[#EEE8F0] rounded-xl px-4 py-2.5 text-sm font-bold text-[#24172B]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#24172B] uppercase tracking-wide mb-1.5">
                  Tagline Resmi
                </label>
                <input
                  type="text"
                  value={tagline}
                  onChange={(e) => setTagline(e.target.value)}
                  className="w-full bg-[#F8F7FA] border border-[#EEE8F0] rounded-xl px-4 py-2.5 text-sm text-[#24172B]"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-[#24172B] uppercase tracking-wide mb-1.5">
                Email Dukungan Pengguna
              </label>
              <input
                type="email"
                value={supportEmail}
                onChange={(e) => setSupportEmail(e.target.value)}
                className="w-full bg-[#F8F7FA] border border-[#EEE8F0] rounded-xl px-4 py-2.5 text-sm text-[#24172B]"
              />
            </div>

            {/* Brand Colors Palette Preview */}
            <div className="pt-2">
              <span className="block text-xs font-bold text-[#786F7D] uppercase tracking-wider mb-2">
                Palet Warna Resmi HUMORA
              </span>
              <div className="grid grid-cols-3 sm:grid-cols-6 gap-2 text-center text-[10px] font-bold">
                <div className="p-2 rounded-xl bg-[#FFD52E] text-[#21052F] shadow-2xs">
                  #FFD52E
                  <span className="block text-[8px] opacity-80">Brand Yellow</span>
                </div>
                <div className="p-2 rounded-xl bg-[#4B0B7A] text-white shadow-2xs">
                  #4B0B7A
                  <span className="block text-[8px] opacity-80">Primary Purple</span>
                </div>
                <div className="p-2 rounded-xl bg-[#21052F] text-white shadow-2xs">
                  #21052F
                  <span className="block text-[8px] opacity-80">Dark Purple</span>
                </div>
                <div className="p-2 rounded-xl bg-[#7028B8] text-white shadow-2xs">
                  #7028B8
                  <span className="block text-[8px] opacity-80">Light Purple</span>
                </div>
                <div className="p-2 rounded-xl bg-[#F8F7FA] text-[#24172B] border border-[#EEE8F0]">
                  #F8F7FA
                  <span className="block text-[8px] opacity-80">Neutral Bg</span>
                </div>
                <div className="p-2 rounded-xl bg-[#21865B] text-white shadow-2xs">
                  #21865B
                  <span className="block text-[8px] opacity-80">Success</span>
                </div>
              </div>
            </div>
          </div>

          {/* Subscription Plans Pricing Configuration Card */}
          <div className="bg-white p-6 rounded-2xl border border-[#EEE8F0] shadow-xs space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-[#EEE8F0]">
              <h3 className="text-sm font-bold text-[#24172B] uppercase tracking-wider flex items-center gap-2">
                <Crown className="w-4 h-4 text-[#FFD52E]" /> Konfigurasi Paket Langganan Premium
              </h3>
              <span className="text-xs text-[#786F7D]">Selaras dengan checkout mobile app</span>
            </div>

            <p className="text-xs text-[#786F7D]">
              Ubah nominal harga paket demo di bawah ini. Nilai ini menjadi acuan paket yang tampil di simulasi pembayaran mobile HUMORA.
            </p>

            <div className="space-y-4">
              {plans.map((plan) => (
                <div
                  key={plan.id}
                  className="p-4 rounded-xl border border-[#EEE8F0] bg-[#FAF8FB] flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="font-bold text-sm text-[#24172B]">{plan.name}</h4>
                      {plan.badge && (
                        <span className="px-2 py-0.5 rounded-full text-[9px] font-bold bg-[#FFD52E] text-[#21052F]">
                          {plan.badge}
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-[#786F7D] mt-0.5">{plan.description}</p>
                    <span className="text-[11px] text-[#4B0B7A] font-semibold">
                      Durasi Aktif: {plan.periodLabel} ({plan.durationDays} hari)
                    </span>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <span className="text-xs font-bold text-[#786F7D]">Harga (Rp):</span>
                    <input
                      type="number"
                      step={1000}
                      value={plan.price}
                      onChange={(e) => handlePlanPriceChange(plan.id, Number(e.target.value))}
                      className="w-32 bg-white border border-[#EEE8F0] rounded-xl px-3 py-2 text-xs font-black text-[#24172B] text-right"
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Side Column: Rules & Demo Reset (1 col) */}
        <div className="space-y-6">
          {/* Content Rule Card */}
          <div className="bg-white p-5 rounded-2xl border border-[#EEE8F0] shadow-xs space-y-4">
            <h3 className="text-xs font-bold text-[#24172B] uppercase tracking-wider pb-2 border-b border-[#EEE8F0]">
              Aturan Konten Platform
            </h3>

            <div>
              <label className="block text-xs font-bold text-[#24172B] uppercase tracking-wide mb-1.5">
                Batas Episode Gratis (Free Preview)
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  min={1}
                  max={5}
                  value={defaultFreeEpisodes}
                  onChange={(e) => setDefaultFreeEpisodes(Number(e.target.value))}
                  className="w-20 bg-[#F8F7FA] border border-[#EEE8F0] rounded-xl px-3 py-2 text-sm font-black text-[#24172B] text-center"
                />
                <span className="text-xs text-[#786F7D]">episode pertama per series</span>
              </div>
              <p className="text-[10px] text-[#786F7D] mt-1.5 leading-snug">
                Nilai ini menjadi aturan bawaan saat menambahkan episode baru (Episode 1-{defaultFreeEpisodes} gratis, selanjutnya otomatis disarankan premium).
              </p>
            </div>
          </div>

          {/* LocalStorage Demo State Summary */}
          <div className="bg-white p-5 rounded-2xl border border-[#EEE8F0] shadow-xs space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-[#EEE8F0]">
              <h3 className="text-xs font-bold text-[#24172B] uppercase tracking-wider flex items-center gap-1.5">
                <Database className="w-3.5 h-3.5 text-[#4B0B7A]" /> Ringkasan Data Lokal
              </h3>
              <span className="text-[10px] font-bold text-[#21865B] bg-[#EAF8F1] px-2 py-0.5 rounded-full">
                Tersimpan di Browser
              </span>
            </div>

            <ul className="space-y-2 text-xs">
              <li className="flex justify-between py-1 border-b border-[#F6F1F8]">
                <span className="text-[#786F7D]">Total Series Tersimpan:</span>
                <span className="font-bold text-[#24172B]">{series.length} Series</span>
              </li>
              <li className="flex justify-between py-1 border-b border-[#F6F1F8]">
                <span className="text-[#786F7D]">Total Episode Terdaftar:</span>
                <span className="font-bold text-[#24172B]">{episodes.length} Episode</span>
              </li>
              <li className="flex justify-between py-1 border-b border-[#F6F1F8]">
                <span className="text-[#786F7D]">Pengguna Demo:</span>
                <span className="font-bold text-[#24172B]">{users.length} Akun</span>
              </li>
              <li className="flex justify-between py-1">
                <span className="text-[#786F7D]">Transaksi Tercatat:</span>
                <span className="font-bold text-[#24172B]">{transactions.length} Data</span>
              </li>
            </ul>

            <div className="pt-2">
              <button
                type="button"
                onClick={() => setIsResetModalOpen(true)}
                className="w-full py-2.5 px-4 rounded-xl border border-[#D94152]/30 bg-[#FEECEF] text-xs font-bold text-[#D94152] hover:bg-[#FCD8DF] transition-colors flex items-center justify-center gap-2"
              >
                <RotateCcw className="w-4 h-4" /> Reset Semua Data Demo
              </button>
            </div>
          </div>
        </div>
      </form>

      {/* Reset Confirmation Dialog */}
      <ConfirmDialog
        isOpen={isResetModalOpen}
        title="Reset Semua Data ke Kondisi Awal?"
        message="Tindakan ini akan mengembalikan data series, episode, kategori, subtitle, user, dan transaksi ke kondisi bawaan awal HUMORA. Seluruh perubahan lokal Anda akan digantikan dengan dataset demo asli."
        confirmLabel="Ya, Reset Semua Data"
        cancelLabel="Batal"
        variant="danger"
        onConfirm={handleResetConfirm}
        onCancel={() => setIsResetModalOpen(false)}
      />
    </div>
  );
}
