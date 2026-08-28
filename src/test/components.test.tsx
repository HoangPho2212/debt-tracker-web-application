import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { Header } from '../components/Header';
import { SummaryCards } from '../components/SummaryCards';
import { DebtorCard } from '../components/DebtorCard';
import { DebtorViewState, SummaryStatsViewState } from '../types/viewState';
import { AppSettings } from '../types/contracts';

const mockSettings: AppSettings = {
  restaurantName: 'Quán Cơm Thúy Nga',
  defaultMealPrice: 35000,
  phoneContact: '0987654321',
  currency: 'VNĐ',
};

const mockSummary: SummaryStatsViewState = {
  totalActiveDebt: 105000,
  formattedTotalActiveDebt: '105.000 đ',
  totalActiveDebtors: 3,
  totalSettledDebtors: 5,
  todayRecordedAmount: 70000,
  formattedTodayRecordedAmount: '70.000 đ',
  todayMealsCount: 2,
};

const mockDebtor: DebtorViewState = {
  id: 'KH_1',
  name: 'Anh Tuấn Viettel',
  normalizedName: 'anh tuan viettel',
  phone: '0987654321',
  totalDebt: 70000,
  formattedTotalDebt: '70.000 đ',
  status: 'active',
  entryCount: 2,
  latestEntryDisplayDate: '12:30 28/08/2026',
  history: [
    {
      entryId: 'ENT_1',
      timestamp: '2026-08-28T12:30:00.000Z',
      displayDate: '12:30 28/08/2026',
      quantity: 2,
      pricePerMeal: 35000,
      amount: 70000,
      note: 'Cơm sườn',
    },
  ],
};

describe('UI Components', () => {
  it('Header should render restaurant name and buttons', () => {
    const onOpenSettings = vi.fn();
    const onOpenBackup = vi.fn();
    const onOpenQuickAdd = vi.fn();

    render(
      <Header
        settings={mockSettings}
        onOpenSettings={onOpenSettings}
        onOpenBackup={onOpenBackup}
        onOpenQuickAdd={onOpenQuickAdd}
        isQuickAddOpen={false}
      />
    );

    expect(screen.getByText('Quán Cơm Thúy Nga')).toBeInTheDocument();
    
    const settingsBtn = screen.getByLabelText('Cài đặt quán');
    fireEvent.click(settingsBtn);
    expect(onOpenSettings).toHaveBeenCalledTimes(1);
  });

  it('SummaryCards should render statistics properly', () => {
    render(<SummaryCards summary={mockSummary} />);

    expect(screen.getByText('105.000 đ')).toBeInTheDocument();
    expect(screen.getByText(/3\s*khách chưa trả/)).toBeInTheDocument();
    expect(screen.getByText('70.000 đ')).toBeInTheDocument();
    expect(screen.getByText(/2\s*suất ghi hôm nay/)).toBeInTheDocument();
  });

  it('DebtorCard should render customer info and trigger callbacks', () => {
    const onSettle = vi.fn();
    const onAddMoreDebt = vi.fn();
    const onViewDetail = vi.fn();

    render(
      <DebtorCard
        debtor={mockDebtor}
        onSettle={onSettle}
        onAddMoreDebt={onAddMoreDebt}
        onViewDetail={onViewDetail}
      />
    );

    expect(screen.getByText('Anh Tuấn Viettel')).toBeInTheDocument();
    expect(screen.getByText('70.000 đ')).toBeInTheDocument();
    expect(screen.getByText(/2 lần nợ/)).toBeInTheDocument();

    const settleBtn = screen.getByText('Đã Thanh Toán');
    fireEvent.click(settleBtn);
    expect(onSettle).toHaveBeenCalledWith(mockDebtor);
  });
});
