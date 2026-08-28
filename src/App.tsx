import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { DebtorRecord, AppSettings, CreateDebtInput, BackupPayload } from './types/contracts';
import { DebtFilterType, DebtorViewState } from './types/viewState';
import { StorageEngine, DEFAULT_SETTINGS } from './services/storage';
import { DebtManager } from './services/debtManager';
import { Header } from './components/Header';
import { SummaryCards } from './components/SummaryCards';
import { QuickAddForm } from './components/QuickAddForm';
import { SearchBar } from './components/SearchBar';
import { DebtorCard } from './components/DebtorCard';
import { DebtorDetailModal } from './components/DebtorDetailModal';
import { SettleConfirmModal } from './components/SettleConfirmModal';
import { SettingsModal } from './components/SettingsModal';
import { BackupRestoreModal } from './components/BackupRestoreModal';
import { ToastContainer, ToastMessage } from './components/Toast';
import { formatCurrency, generateId } from './utils/formatters';
import { PlusCircle, UtensilsCrossed, Sparkles } from 'lucide-react';

export const App: React.FC = () => {
  // Persistence state
  const [records, setRecords] = useState<DebtorRecord[]>(() => StorageEngine.loadRecords());
  const [settings, setSettings] = useState<AppSettings>(() => StorageEngine.loadSettings());

  // UI state
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState<DebtFilterType>('active');
  const [isQuickAddOpen, setIsQuickAddOpen] = useState(true);
  const [presetCustomerName, setPresetCustomerName] = useState('');
  const [selectedDebtorId, setSelectedDebtorId] = useState<string | null>(null);
  const [settleConfirmDebtor, setSettleConfirmDebtor] = useState<DebtorViewState | null>(null);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isBackupRestoreOpen, setIsBackupRestoreOpen] = useState(false);
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  // Auto persist records
  useEffect(() => {
    StorageEngine.saveRecords(records);
  }, [records]);

  // Auto persist settings
  useEffect(() => {
    StorageEngine.saveSettings(settings);
  }, [settings]);

  // Show Toast notification helper
  const showToast = useCallback((message: string, type: 'success' | 'error' | 'info' = 'success') => {
    const newToast: ToastMessage = {
      id: generateId('TOAST'),
      type,
      message,
    };
    setToasts((prev) => [...prev, newToast]);
  }, []);

  const dismissToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  // Projection ViewState
  const viewState = useMemo(() => {
    return DebtManager.buildAppViewState(
      records,
      settings,
      searchQuery,
      activeFilter,
      selectedDebtorId || undefined,
      isQuickAddOpen,
      isSettingsOpen,
      isBackupRestoreOpen
    );
  }, [
    records,
    settings,
    searchQuery,
    activeFilter,
    selectedDebtorId,
    isQuickAddOpen,
    isSettingsOpen,
    isBackupRestoreOpen,
  ]);

  // Actions
  const handleAddDebt = (input: CreateDebtInput) => {
    try {
      const { updatedRecords, affectedRecord } = DebtManager.addDebtEntry(records, input);
      setRecords(updatedRecords);
      setPresetCustomerName('');
      showToast(
        `Đã ghi nợ ${input.quantity} suất (${formatCurrency(input.quantity * input.pricePerMeal)}) cho "${affectedRecord.name}".`,
        'success'
      );
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Lỗi khi ghi nợ.';
      showToast(msg, 'error');
    }
  };

  const handleSettleDebtor = (debtorId: string) => {
    const target = records.find((r) => r.id === debtorId);
    const updated = DebtManager.settleDebtor(records, debtorId);
    setRecords(updated);
    setSettleConfirmDebtor(null);
    if (target) {
      showToast(`Đã xác nhận thanh toán nợ cho "${target.name}".`, 'success');
    }
  };

  const handleDeleteHistoryEntry = (debtorId: string, entryId: string) => {
    const updated = DebtManager.deleteHistoryEntry(records, debtorId, entryId);
    setRecords(updated);
  };

  const handleUpdateDebtorInfo = (debtorId: string, name: string, phone?: string) => {
    const updated = DebtManager.updateDebtor(records, debtorId, name, phone);
    setRecords(updated);
  };

  const handleDeleteDebtor = (debtorId: string) => {
    const updated = DebtManager.deleteDebtor(records, debtorId);
    setRecords(updated);
    if (selectedDebtorId === debtorId) {
      setSelectedDebtorId(null);
    }
  };

  const handleSaveSettings = (newSettings: AppSettings) => {
    setSettings(newSettings);
    showToast('Đã lưu thông tin cài đặt quán.', 'success');
  };

  const handleImportBackup = (payload: BackupPayload) => {
    setRecords(payload.records);
    if (payload.settings) {
      setSettings(payload.settings);
    }
  };

  const handleClearAllData = () => {
    setRecords([]);
    setSettings(DEFAULT_SETTINGS);
  };

  const handleAddMoreDebtForCustomer = (debtor: DebtorViewState) => {
    setPresetCustomerName(debtor.name);
    setIsQuickAddOpen(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans text-slate-800 antialiased selection:bg-emerald-500 selection:text-white">
      {/* Toast Notifications */}
      <ToastContainer toasts={toasts} onDismiss={dismissToast} />

      {/* Header */}
      <Header
        settings={settings}
        onOpenSettings={() => setIsSettingsOpen(true)}
        onOpenBackup={() => setIsBackupRestoreOpen(true)}
        onOpenQuickAdd={() => setIsQuickAddOpen((prev) => !prev)}
        isQuickAddOpen={isQuickAddOpen}
      />

      {/* Main Container */}
      <main className="flex-1 w-full max-w-xl mx-auto px-4 py-4 space-y-4 pb-20">
        {/* Top Summary Cards */}
        <SummaryCards summary={viewState.summary} />

        {/* Quick Add Form Section */}
        {isQuickAddOpen && (
          <QuickAddForm
            settings={settings}
            existingRecords={records}
            onSubmit={handleAddDebt}
            onCancel={presetCustomerName ? () => setPresetCustomerName('') : undefined}
            presetCustomerName={presetCustomerName}
          />
        )}

        {/* Search & Filter Bar */}
        <SearchBar
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          activeFilter={activeFilter}
          onFilterChange={setActiveFilter}
          activeCount={viewState.summary.totalActiveDebtors}
          settledCount={viewState.summary.totalSettledDebtors}
          totalCount={records.length}
        />

        {/* Debtor Cards List */}
        <div className="space-y-3">
          {viewState.filteredDebtors.length === 0 ? (
            <div className="bg-white rounded-2xl border border-slate-200 p-8 text-center space-y-3">
              <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center mx-auto text-slate-400">
                {searchQuery ? <UtensilsCrossed className="w-6 h-6" /> : <Sparkles className="w-6 h-6 text-amber-500" />}
              </div>
              <div className="space-y-1">
                <h3 className="text-sm font-bold text-slate-700">
                  {searchQuery
                    ? `Không tìm thấy khách nào có tên "${searchQuery}"`
                    : activeFilter === 'active'
                    ? 'Hiện không có khách nào đang nợ!'
                    : 'Chưa có dữ liệu trong danh sách.'}
                </h3>
                <p className="text-xs text-slate-400">
                  {searchQuery
                    ? 'Bạn có thể bấm ghi nợ mới với tên này.'
                    : 'Bấm nút "Ghi Nợ" phía trên để thêm khách nợ đầu tiên.'}
                </p>
              </div>

              {searchQuery && (
                <button
                  type="button"
                  onClick={() => {
                    setPresetCustomerName(searchQuery);
                    setIsQuickAddOpen(true);
                    setSearchQuery('');
                  }}
                  className="inline-flex items-center gap-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-xs active:scale-95 transition-all"
                >
                  <PlusCircle className="w-4 h-4" />
                  <span>Ghi Nợ Cho "{searchQuery}"</span>
                </button>
              )}
            </div>
          ) : (
            viewState.filteredDebtors.map((debtor) => (
              <DebtorCard
                key={debtor.id}
                debtor={debtor}
                onSettle={(d) => setSettleConfirmDebtor(d)}
                onAddMoreDebt={(d) => handleAddMoreDebtForCustomer(d)}
                onViewDetail={(d) => setSelectedDebtorId(d.id)}
              />
            ))
          )}
        </div>
      </main>

      {/* Detail Modal */}
      {viewState.selectedDebtorDetail && (
        <DebtorDetailModal
          debtor={viewState.selectedDebtorDetail}
          settings={settings}
          onClose={() => setSelectedDebtorId(null)}
          onSettle={handleSettleDebtor}
          onDeleteEntry={handleDeleteHistoryEntry}
          onUpdateInfo={handleUpdateDebtorInfo}
          onDeleteDebtor={handleDeleteDebtor}
          onShowToast={showToast}
        />
      )}

      {/* Settle Confirm Modal */}
      <SettleConfirmModal
        debtor={settleConfirmDebtor}
        onConfirm={() => settleConfirmDebtor && handleSettleDebtor(settleConfirmDebtor.id)}
        onCancel={() => setSettleConfirmDebtor(null)}
      />

      {/* Settings Modal */}
      {isSettingsOpen && (
        <SettingsModal
          settings={settings}
          onSave={handleSaveSettings}
          onClose={() => setIsSettingsOpen(false)}
        />
      )}

      {/* Backup & Restore Modal */}
      {isBackupRestoreOpen && (
        <BackupRestoreModal
          records={records}
          settings={settings}
          onImportBackup={handleImportBackup}
          onClearAllData={handleClearAllData}
          onClose={() => setIsBackupRestoreOpen(false)}
          onShowToast={showToast}
        />
      )}
    </div>
  );
};
