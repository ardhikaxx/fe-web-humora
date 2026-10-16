'use client';

import React, { useState } from 'react';
import { useAdmin } from '../../../lib/context/AdminContext';
import { PageHeader } from '../../../components/ui/PageHeader';
import { ConfirmDialog } from '../../../components/ui/ConfirmDialog';
import { useToast } from '../../../components/ui/Toast';
import { generateSlug, formatDate } from '../../../lib/utils/formatters';
import { AdminCategory } from '../../../lib/types/admin';
import {
  FolderTree,
  Plus,
  Edit,
  Trash2,
  CheckCircle2,
  X,
  AlertTriangle,
  Layers,
} from 'lucide-react';

export default function CategoriesPage() {
  const { categories, series, addCategory, updateCategory, deleteCategory } = useAdmin();
  const { success, error } = useToast();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<AdminCategory | null>(null);

  // Form state
  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [description, setDescription] = useState('');
  const [active, setActive] = useState(true);
  const [formErrors, setFormErrors] = useState<{ [key: string]: string }>({});

  // Deletion modal
  const [catToDelete, setCatToDelete] = useState<AdminCategory | null>(null);

  const openCreateModal = () => {
    setEditingCategory(null);
    setName('');
    setSlug('');
    setDescription('');
    setActive(true);
    setFormErrors({});
    setIsModalOpen(true);
  };

  const openEditModal = (cat: AdminCategory) => {
    setEditingCategory(cat);
    setName(cat.name);
    setSlug(cat.slug);
    setDescription(cat.description);
    setActive(cat.active);
    setFormErrors({});
    setIsModalOpen(true);
  };

  const handleNameChange = (val: string) => {
    setName(val);
    if (!editingCategory) {
      setSlug(generateSlug(val));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const errors: { [key: string]: string } = {};
    if (!name.trim()) errors.name = 'Nama kategori wajib diisi';
    if (!slug.trim()) errors.slug = 'Slug wajib diisi';

    // Slug unique check
    const existingSlug = categories.find((c) => c.slug === slug.trim() && c.id !== editingCategory?.id);
    if (existingSlug) errors.slug = 'Slug kategori ini sudah terdaftar';

    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      error('Validasi Gagal', 'Mohon periksa kolom yang ditandai merah.');
      return;
    }

    if (editingCategory) {
      updateCategory(editingCategory.id, {
        name: name.trim(),
        slug: slug.trim(),
        description: description.trim(),
        active,
      });
      success('Kategori Diperbarui', `Kategori "${name}" berhasil diubah.`);
    } else {
      addCategory({
        name: name.trim(),
        slug: slug.trim(),
        description: description.trim(),
        active,
      });
      success('Kategori Dibuat', `Kategori "${name}" berhasil ditambahkan.`);
    }

    setIsModalOpen(false);
  };

  const handleDeleteConfirm = () => {
    if (catToDelete) {
      deleteCategory(catToDelete.id);
      success('Kategori Dihapus', `Kategori "${catToDelete.name}" telah dihapus.`);
      setCatToDelete(null);
    }
  };

  // Check how many series are using this category
  const getSeriesCountForCategory = (catName: string) => {
    return series.filter((s) => s.genres.includes(catName)).length;
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Manajemen Kategori & Genre"
        description="Atur kategori dan genre cerita untuk klasifikasi series dan filter eksplorasi di aplikasi mobile."
        breadcrumbs={[{ label: 'Kategori' }]}
        actions={
          <button
            onClick={openCreateModal}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#4B0B7A] hover:bg-[#3B0762] text-xs font-bold text-white transition-all shadow-xs"
          >
            <Plus className="w-4 h-4 text-[#FFD52E]" /> Tambah Kategori
          </button>
        }
      />

      {/* Categories Table */}
      <div className="bg-white rounded-2xl border border-[#EEE8F0] shadow-xs overflow-hidden">
        <div className="p-5 border-b border-[#EEE8F0] flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-[#24172B] uppercase tracking-wider">
              Daftar Kategori ({categories.length})
            </h3>
            <p className="text-xs text-[#786F7D] mt-0.5">
              Kategori yang aktif langsung tersedia pada form pembuatan series dan episode.
            </p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-[#FAF8FB] text-[11px] font-bold text-[#786F7D] uppercase tracking-wider border-b border-[#EEE8F0]">
                <th className="py-3 px-4">Nama Kategori</th>
                <th className="py-3 px-4">Slug URL</th>
                <th className="py-3 px-4">Deskripsi</th>
                <th className="py-3 px-4 text-center">Jumlah Series</th>
                <th className="py-3 px-4 text-center">Status</th>
                <th className="py-3 px-4">Tanggal Dibuat</th>
                <th className="py-3 px-4 text-right">Tindakan</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#EEE8F0]">
              {categories.map((cat) => {
                const sCount = getSeriesCountForCategory(cat.name);

                return (
                  <tr key={cat.id} className="hover:bg-[#FAF8FB] transition-colors">
                    <td className="py-3 px-4 font-bold text-[#24172B] text-sm">
                      <div className="flex items-center gap-2">
                        <span className="w-2.5 h-2.5 rounded-full bg-[#4B0B7A]" />
                        {cat.name}
                      </div>
                    </td>

                    <td className="py-3 px-4 font-mono text-[#786F7D]">
                      /{cat.slug}
                    </td>

                    <td className="py-3 px-4 text-[#786F7D] max-w-xs truncate">
                      {cat.description || '-'}
                    </td>

                    <td className="py-3 px-4 text-center">
                      <span className="px-2 py-0.5 rounded-full bg-[#F6F1F8] font-bold text-[#4B0B7A]">
                        {sCount} Series
                      </span>
                    </td>

                    <td className="py-3 px-4 text-center">
                      {cat.active ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-[#EAF8F1] text-[#21865B] font-semibold text-[11px]">
                          <CheckCircle2 className="w-3 h-3" /> Aktif
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full bg-[#F8F7FA] text-[#786F7D] font-medium text-[11px]">
                          Nonaktif
                        </span>
                      )}
                    </td>

                    <td className="py-3 px-4 text-[#786F7D] font-medium">
                      {formatDate(cat.createdAt)}
                    </td>

                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => openEditModal(cat)}
                          className="p-1.5 rounded-lg text-[#786F7D] hover:text-[#4B0B7A] hover:bg-[#F6F1F8] transition-colors"
                          title="Edit Kategori"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => setCatToDelete(cat)}
                          className="p-1.5 rounded-lg text-[#786F7D] hover:text-[#D94152] hover:bg-[#FEECEF] transition-colors"
                          title="Hapus Kategori"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add / Edit Category Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-[#EEE8F0] transform animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between pb-3 border-b border-[#EEE8F0] mb-4">
              <h3 className="text-base font-bold text-[#24172B]">
                {editingCategory ? 'Edit Kategori' : 'Tambah Kategori Baru'}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1 text-[#786F7D] hover:text-[#24172B] hover:bg-[#F6F1F8] rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-[#24172B] uppercase tracking-wide mb-1.5">
                  Nama Kategori <span className="text-[#D94152]">*</span>
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => handleNameChange(e.target.value)}
                  placeholder="Misal: Komedi, Slice of Life..."
                  className={`w-full bg-[#F8F7FA] border rounded-xl px-4 py-2.5 text-sm text-[#24172B] focus:bg-white focus:outline-hidden ${
                    formErrors.name ? 'border-[#D94152]' : 'border-[#EEE8F0] focus:border-[#4B0B7A]'
                  }`}
                />
                {formErrors.name && <p className="text-xs text-[#D94152] mt-1">{formErrors.name}</p>}
              </div>

              <div>
                <label className="block text-xs font-bold text-[#24172B] uppercase tracking-wide mb-1.5">
                  Slug URL <span className="text-[#D94152]">*</span>
                </label>
                <input
                  type="text"
                  value={slug}
                  onChange={(e) => setSlug(e.target.value)}
                  placeholder="komedi"
                  className={`w-full bg-[#F8F7FA] border rounded-xl px-4 py-2.5 text-sm font-mono text-[#24172B] focus:bg-white focus:outline-hidden ${
                    formErrors.slug ? 'border-[#D94152]' : 'border-[#EEE8F0] focus:border-[#4B0B7A]'
                  }`}
                />
                {formErrors.slug && <p className="text-xs text-[#D94152] mt-1">{formErrors.slug}</p>}
              </div>

              <div>
                <label className="block text-xs font-bold text-[#24172B] uppercase tracking-wide mb-1.5">
                  Deskripsi Kategori
                </label>
                <textarea
                  rows={3}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Penjelasan ringkas mengenai genre ini..."
                  className="w-full bg-[#F8F7FA] border border-[#EEE8F0] rounded-xl p-3 text-sm text-[#24172B] focus:bg-white focus:outline-hidden"
                />
              </div>

              <div className="flex items-center gap-2.5 pt-1">
                <input
                  type="checkbox"
                  id="catActive"
                  checked={active}
                  onChange={(e) => setActive(e.target.checked)}
                  className="rounded text-[#4B0B7A] focus:ring-[#4B0B7A] w-4 h-4"
                />
                <label htmlFor="catActive" className="text-xs font-bold text-[#24172B] cursor-pointer">
                  Aktifkan kategori ini di filter katalog
                </label>
              </div>

              <div className="mt-6 pt-4 border-t border-[#EEE8F0] flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-[#EEE8F0] text-xs font-semibold text-[#24172B] hover:bg-[#F8F7FA]"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-[#4B0B7A] hover:bg-[#3B0762] text-xs font-bold text-white transition-all shadow-xs"
                >
                  {editingCategory ? 'Simpan Perubahan' : 'Tambah Kategori'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation with Series Guard warning */}
      <ConfirmDialog
        isOpen={!!catToDelete}
        title={`Hapus Kategori "${catToDelete?.name}"?`}
        message={
          catToDelete && getSeriesCountForCategory(catToDelete.name) > 0
            ? `Peringatan: Kategori ini saat ini sedang digunakan oleh ${getSeriesCountForCategory(
                catToDelete.name
              )} series. Menghapus kategori ini akan menghapusnya dari daftar filter katalog.`
            : `Apakah Anda yakin ingin menghapus kategori "${catToDelete?.name}"?`
        }
        confirmLabel="Ya, Hapus Kategori"
        cancelLabel="Batal"
        variant="danger"
        onConfirm={handleDeleteConfirm}
        onCancel={() => setCatToDelete(null)}
      />
    </div>
  );
}
