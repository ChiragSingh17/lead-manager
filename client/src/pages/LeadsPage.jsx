import { useEffect, useState } from 'react';
import {
  AlertCircle,
  BadgeCheck,
  CircleSlash,
  ListFilter,
  Loader2,
  PhoneCall,
  Plus,
  RefreshCw,
  Search,
  Sparkles,
  Target,
  X,
} from 'lucide-react';
import api from '../api/client.js';
import AppLayout from '../components/AppLayout.jsx';
import ConfirmDialog from '../components/ConfirmDialog.jsx';
import LeadModal from '../components/LeadModal.jsx';
import LeadTable from '../components/LeadTable.jsx';
import Pagination from '../components/Pagination.jsx';
import StatCard from '../components/StatCard.jsx';
import Toasts from '../components/Toasts.jsx';
import { useToasts } from '../hooks/useToasts.js';
import { LEAD_STATUSES } from '../utils/constants.js';
import { pluralize } from '../utils/format.js';
import { getApiError } from '../utils/validation.js';

const emptyStats = {
  total: 0,
  byStatus: { New: 0, Contacted: 0, Qualified: 0, Lost: 0 },
};

const statusCards = [
  { key: 'New', label: 'New leads', icon: Sparkles, tone: 'blue' },
  { key: 'Contacted', label: 'Contacted', icon: PhoneCall, tone: 'amber' },
  { key: 'Qualified', label: 'Qualified', icon: BadgeCheck, tone: 'green' },
  { key: 'Lost', label: 'Lost', icon: CircleSlash, tone: 'rose' },
];

function percentage(count, total) {
  if (!total) return 0;
  return Math.round((count / total) * 100);
}

export default function LeadsPage() {
  const { toasts, notify, dismiss } = useToasts();
  const [leads, setLeads] = useState([]);
  const [stats, setStats] = useState(emptyStats);
  const [pagination, setPagination] = useState({ page: 1, limit: 8, total: 0, totalPages: 1 });
  const [loading, setLoading] = useState(true);
  const [statsLoading, setStatsLoading] = useState(true);
  const [listError, setListError] = useState('');
  const [searchInput, setSearchInput] = useState('');
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');
  const [sort, setSort] = useState('createdAt');
  const [order, setOrder] = useState('desc');
  const [page, setPage] = useState(1);
  const [refreshToken, setRefreshToken] = useState(0);
  const [statsToken, setStatsToken] = useState(0);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingLead, setEditingLead] = useState(null);
  const [deletingLead, setDeletingLead] = useState(null);

  useEffect(() => {
    const timer = setTimeout(() => {
      setSearch(searchInput.trim());
      setPage(1);
    }, 350);
    return () => clearTimeout(timer);
  }, [searchInput]);

  useEffect(() => {
    let active = true;
    setLoading(true);
    setListError('');

    api
      .get('/leads', {
        params: { search, status, page, sort, order, limit: 8 },
      })
      .then(({ data }) => {
        if (!active) return;
        setLeads(data.data);
        setPagination(data.pagination);
        if (page > data.pagination.totalPages) {
          setPage(data.pagination.totalPages);
        }
      })
      .catch((error) => {
        if (!active) return;
        setListError(getApiError(error, 'Could not load leads. Check that the API is running.'));
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [search, status, page, sort, order, refreshToken]);

  useEffect(() => {
    let active = true;
    setStatsLoading(true);

    api
      .get('/leads/stats')
      .then(({ data }) => {
        if (active) setStats(data);
      })
      .catch(() => {
        if (active) setStats(emptyStats);
      })
      .finally(() => {
        if (active) setStatsLoading(false);
      });

    return () => {
      active = false;
    };
  }, [statsToken]);

  function refreshAll() {
    setRefreshToken((current) => current + 1);
    setStatsToken((current) => current + 1);
  }

  function openAddModal() {
    setEditingLead(null);
    setModalOpen(true);
  }

  function openEditModal(lead) {
    setEditingLead(lead);
    setModalOpen(true);
  }

  function closeModal() {
    setModalOpen(false);
    setEditingLead(null);
  }

  async function handleSave(values) {
    if (editingLead) {
      await api.patch(`/leads/${editingLead.id}`, values);
      notify('Lead updated.');
    } else {
      await api.post('/leads', values);
      setPage(1);
      notify('Lead added to your pipeline.');
    }

    closeModal();
    refreshAll();
  }

  async function handleDelete() {
    await api.delete(`/leads/${deletingLead.id}`);
    setDeletingLead(null);
    notify('Lead deleted.');
    setStatsToken((current) => current + 1);

    if (leads.length === 1 && page > 1) {
      setPage((current) => current - 1);
    } else {
      setRefreshToken((current) => current + 1);
    }
  }

  function handleSort(field) {
    if (sort === field) {
      setOrder((current) => (current === 'asc' ? 'desc' : 'asc'));
    } else {
      setSort(field);
      setOrder(field === 'createdAt' ? 'desc' : 'asc');
    }
    setPage(1);
  }

  function clearFilters() {
    setSearchInput('');
    setSearch('');
    setStatus('');
    setPage(1);
  }

  const hasFilters = Boolean(search || status);
  const total = stats.total || pagination.total;

  return (
    <>
      <AppLayout leadCount={statsLoading ? null : total}>
        <div className="page">
          <header className="page-header">
            <div>
              <span className="eyebrow">Workspace / Leads</span>
              <h1>Your lead pipeline</h1>
              <p>Capture opportunities, keep context, and move every conversation forward.</p>
            </div>
            <div className="header-actions">
              <button
                type="button"
                className="button button-secondary refresh-button"
                onClick={refreshAll}
                disabled={loading}
              >
                <RefreshCw size={17} className={loading ? 'spin' : ''} />
                Refresh
              </button>
              <button type="button" className="button button-primary" onClick={openAddModal}>
                <Plus size={18} />
                Add lead
              </button>
            </div>
          </header>

          <section className="stats-grid" aria-label="Pipeline overview">
            <StatCard
              label="Total leads"
              value={total}
              icon={Target}
              tone="dark"
              detail="Across every stage"
              loading={statsLoading}
            />
            {statusCards.map((card) => {
              const count = stats.byStatus?.[card.key] || 0;
              return (
                <StatCard
                  key={card.key}
                  label={card.label}
                  value={count}
                  icon={card.icon}
                  tone={card.tone}
                  detail={`${percentage(count, total)}% of pipeline`}
                  loading={statsLoading}
                />
              );
            })}
          </section>

          <section className="panel">
            <div className="toolbar">
              <div className="search-field">
                <Search size={18} className="search-icon" />
                <input
                  type="search"
                  value={searchInput}
                  onChange={(event) => setSearchInput(event.target.value)}
                  placeholder="Search by name, company, or email"
                  aria-label="Search leads"
                />
                {searchInput ? (
                  <button
                    type="button"
                    className="search-clear"
                    onClick={() => setSearchInput('')}
                    aria-label="Clear search"
                  >
                    <X size={15} />
                  </button>
                ) : null}
              </div>

              <div className="filter-select">
                <ListFilter size={17} />
                <select
                  value={status}
                  onChange={(event) => {
                    setStatus(event.target.value);
                    setPage(1);
                  }}
                  aria-label="Filter by status"
                >
                  <option value="">All statuses</option>
                  {LEAD_STATUSES.map((item) => (
                    <option key={item} value={item}>{item}</option>
                  ))}
                </select>
              </div>
            </div>
          </section>

          <section className="panel leads-panel">
            <div className="panel-head">
              <div>
                <h2>{hasFilters ? 'Filtered leads' : 'All leads'}</h2>
                <p>
                  {loading
                    ? 'Loading your pipeline…'
                    : `${pluralize(pagination.total, 'lead')} ${hasFilters ? 'matched' : 'in your pipeline'}`}
                </p>
              </div>
              {hasFilters ? (
                <button type="button" className="text-button" onClick={clearFilters}>
                  <X size={15} />
                  Clear filters
                </button>
              ) : null}
            </div>

            {listError ? (
              <div className="error-state">
                <span className="error-icon"><AlertCircle size={24} /></span>
                <h3>Could not load your leads</h3>
                <p>{listError}</p>
                <button type="button" className="button button-secondary" onClick={refreshAll}>
                  {loading ? <Loader2 size={16} className="spin" /> : <RefreshCw size={16} />}
                  Try again
                </button>
              </div>
            ) : (
              <>
                <LeadTable
                  leads={leads}
                  loading={loading}
                  sort={sort}
                  order={order}
                  onSort={handleSort}
                  onEdit={openEditModal}
                  onDelete={setDeletingLead}
                  onAdd={openAddModal}
                  onClearFilters={clearFilters}
                  hasFilters={hasFilters}
                />
                <Pagination
                  page={pagination.page}
                  totalPages={pagination.totalPages}
                  total={pagination.total}
                  limit={pagination.limit}
                  onChange={setPage}
                />
              </>
            )}
          </section>

          <footer className="page-footer">
            <span>Lead Manager</span>
            <span>React · Node.js · MongoDB</span>
          </footer>
        </div>
      </AppLayout>

      {modalOpen ? (
        <LeadModal
          key={editingLead?.id || 'new-lead'}
          lead={editingLead}
          onClose={closeModal}
          onSave={handleSave}
        />
      ) : null}

      {deletingLead ? (
        <ConfirmDialog
          lead={deletingLead}
          onClose={() => setDeletingLead(null)}
          onConfirm={handleDelete}
        />
      ) : null}

      <Toasts toasts={toasts} onDismiss={dismiss} />
    </>
  );
}
