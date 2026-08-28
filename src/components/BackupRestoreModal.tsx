import React, { useState, useRef } from 'react';
import {
  X,
  Download,
  Upload,
  Database,
  AlertTriangle,
  FileCheck,
  Trash2,
} from 'lucide-react';
import { DebtorRecord, AppSettings, BackupPayload } from '../types/contracts';
import { StorageEngine } from '../services/storage';

interface BackupRestoreModalProps {
  records: DebtorRecord[];
  settings: AppSettings;
  onImportBackup: (payload: BackupPayload) => void;
  onClearAllData: () => void;
  onClose: () => void;
  onShowToast: (message: string, type: 'success' | 'error' | 'info') => void;
}

export const BackupRestoreModal: React.FC<BackupRestoreModalProps> = ({
  records,
  settings,
  onImportBackup,
  onClearAllData,
  onClose,
  onShowToast,
}) => {
  const [pendingBackup, setPendingBackup] = useState<BackupPayload | null>(null);
  const [confirmClear, setConfirmClear] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleExport = () => {
    try {
      StorageEngine.downloadBackupFile(records, settings);
      onShowToast('Đã tải xuống file sao lưu JSON thành công!', 'success');
    } catch {
      onShowToast('Lỗi khi xuất file sao lưu.', 'error');
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setErrorMsg(null);
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const content = event.target?.result as string;
        const validated = StorageEngine.parseAndValidateBackup(content);
        setPendingBackup(validated);
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : 'Tệp không hợp lệ.';
        setErrorMsg(msg);
        setPendingBackup(null);
      }
    };
    reader.onerror = () => {
      setErrorMsg('Không thể đọc tệp sao lưu.');
    };
    reader.readAsText(file);
  };

  const handleApplyImport = () => {
    if (!pendingBackup) return;
    onImportBackup(pendingBackup);
    setPendingBackup(null);
    onShowToast(`Đã phục hồi thành công ${pendingBackup.records.length} khách hàng!`, 'success');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-fade-in">
      <div className="w-full max-w-md bg-white rounded-3xl p-5 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto animate-scale-up">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-sky-100 text-sky-700">
              <Database className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">
                Sao Lưu & Phục Hồi
              </h3>
              <p className="text-xs text-slate-500">Bảo vệ dữ liệu sổ nợ an toàn</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-600 rounded-xl"
            aria-label="Đóng"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {errorMsg && (
          <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 text-xs font-medium flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 flex-shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Export Section */}
        <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200/80 space-y-2.5">
          <div className="flex items-center gap-2 text-slate-800 font-bold text-sm">
            <Download className="w-4 h-4 text-emerald-600" />
            <span>1. Xuất file sao lưu (Backup)</span>
          </div>
          <p className="text-xs text-slate-500">
            Tải về 1 file `.json` chứa toàn bộ {records.length} khách hàng và lịch sử nợ. Bạn có thể gửi qua Zalo hoặc lưu lên Google Drive.
          </p>
          <button
            type="button"
            onClick={handleExport}
            className="w-full min-h-[44px] py-2.5 px-4 bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white font-bold text-xs rounded-xl shadow-xs flex items-center justify-center gap-2 transition-all active:scale-95"
          >
            <Download className="w-4 h-4" />
            <span>TẢI VỀ FILE SAO LƯU (.JSON)</span>
          </button>
        </div>

        {/* Import Section */}
        <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200/80 space-y-2.5">
          <div className="flex items-center gap-2 text-slate-800 font-bold text-sm">
            <Upload className="w-4 h-4 text-sky-600" />
            <span>2. Phục hồi dữ liệu (Restore)</span>
          </div>
          <p className="text-xs text-slate-500">
            Chọn file sao lưu `.json` đã lưu trước đó để nạp lại dữ liệu khi đổi điện thoại hoặc xóa nhầm trình duyệt.
          </p>

          <input
            ref={fileInputRef}
            type="file"
            accept=".json,application/json"
            onChange={handleFileChange}
            className="hidden"
          />

          {!pendingBackup ? (
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="w-full min-h-[44px] py-2.5 px-4 bg-sky-600 hover:bg-sky-700 active:bg-sky-800 text-white font-bold text-xs rounded-xl shadow-xs flex items-center justify-center gap-2 transition-all active:scale-95"
            >
              <Upload className="w-4 h-4" />
              <span>CHỌN FILE SAO LƯU TỪ MÁY</span>
            </button>
          ) : (
            <div className="p-3 bg-sky-50 border border-sky-200 rounded-xl space-y-2">
              <div className="flex items-center gap-2 text-sky-900 font-bold text-xs">
                <FileCheck className="w-4 h-4 text-sky-600" />
                <span>File hợp lệ: {pendingBackup.records.length} khách nợ</span>
              </div>
              <p className="text-[11px] text-sky-700">
                Xuất lúc: {new Date(pendingBackup.exportedAt).toLocaleString('vi-VN')}
              </p>
              <div className="flex gap-2 pt-1">
                <button
                  type="button"
                  onClick={handleApplyImport}
                  className="flex-1 py-2 bg-sky-600 hover:bg-sky-700 text-white font-bold text-xs rounded-lg"
                >
                  Xác Nhận Nạp Dữ Liệu
                </button>
                <button
                  type="button"
                  onClick={() => setPendingBackup(null)}
                  className="px-3 py-2 bg-slate-200 text-slate-700 text-xs font-semibold rounded-lg"
                >
                  Hủy
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Danger Zone */}
        <div className="pt-2 border-t border-slate-100">
          {!confirmClear ? (
            <button
              type="button"
              onClick={() => setConfirmClear(true)}
              className="text-xs text-rose-600 hover:text-rose-700 font-semibold flex items-center gap-1.5 p-1"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Xóa sạch toàn bộ sổ nợ</span>
            </button>
          ) : (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl space-y-2">
              <div className="text-xs font-bold text-rose-800">
                Bạn có chắc chắn muốn xóa toàn bộ dữ liệu?
              </div>
              <p className="text-[11px] text-rose-600">
                Hành động này không thể hoàn tác nếu bạn chưa tải file sao lưu!
              </p>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => {
                    onClearAllData();
                    setConfirmClear(false);
                    onShowToast('Đã xóa sạch dữ liệu sổ nợ.', 'info');
                    onClose();
                  }}
                  className="flex-1 py-2 bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs rounded-lg"
                >
                  Xóa Tất Cả
                </button>
                <button
                  type="button"
                  onClick={() => setConfirmClear(false)}
                  className="px-3 py-2 bg-slate-200 text-slate-700 text-xs font-semibold rounded-lg"
                >
                  Hủy Bỏ
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
