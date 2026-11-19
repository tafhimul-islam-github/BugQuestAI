import React from 'react';
import { AvailabilityStatus, ReviewStatus } from '../api/client';

const REVIEW_STYLES: Record<ReviewStatus, string> = {
  draft: 'bg-slate-100 text-slate-700 border-slate-200',
  pending_review: 'bg-amber-50 text-amber-800 border-amber-200',
  changes_requested: 'bg-rose-50 text-rose-700 border-rose-200',
  approved: 'bg-emerald-50 text-emerald-700 border-emerald-200',
};

const REVIEW_LABELS: Record<ReviewStatus, string> = {
  draft: 'Draft',
  pending_review: 'Pending review',
  changes_requested: 'Changes requested',
  approved: 'Approved',
};

const AVAILABILITY_STYLES: Record<AvailabilityStatus, string> = {
  unpublished: 'bg-slate-50 text-slate-600 border-slate-200',
  published: 'bg-blue-50 text-blue-700 border-blue-200',
  disabled: 'bg-orange-50 text-orange-700 border-orange-200',
  archived: 'bg-slate-200/80 text-slate-600 border-slate-300',
};

const AVAILABILITY_LABELS: Record<AvailabilityStatus, string> = {
  unpublished: 'Unpublished',
  published: 'Published',
  disabled: 'Disabled',
  archived: 'Archived',
};

export const ReviewStatusBadge: React.FC<{ status?: ReviewStatus }> = ({ status = 'draft' }) => (
  <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-semibold border ${REVIEW_STYLES[status] || REVIEW_STYLES.draft}`}>
    {REVIEW_LABELS[status] || status}
  </span>
);

export const AvailabilityStatusBadge: React.FC<{ status?: AvailabilityStatus }> = ({ status = 'unpublished' }) => (
  <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-semibold border ${AVAILABILITY_STYLES[status] || AVAILABILITY_STYLES.unpublished}`}>
    {AVAILABILITY_LABELS[status] || status}
  </span>
);

export const FeedbackStatusBadge: React.FC<{ status: string }> = ({ status }) => {
  const styles: Record<string, string> = {
    open: 'bg-rose-50 text-rose-700 border-rose-200',
    in_progress: 'bg-amber-50 text-amber-800 border-amber-200',
    resolved: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    dismissed: 'bg-slate-100 text-slate-600 border-slate-200',
  };
  const labels: Record<string, string> = {
    open: 'Open',
    in_progress: 'In progress',
    resolved: 'Resolved',
    dismissed: 'Dismissed',
  };
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-semibold border ${styles[status] || styles.open}`}>
      {labels[status] || status}
    </span>
  );
};

export const SeverityBadge: React.FC<{ severity: string }> = ({ severity }) => {
  const styles: Record<string, string> = {
    high: 'bg-rose-100 text-rose-800 border-rose-200',
    medium: 'bg-amber-50 text-amber-800 border-amber-200',
    low: 'bg-slate-100 text-slate-600 border-slate-200',
  };
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-semibold border capitalize ${styles[severity] || styles.medium}`}>
      {severity}
    </span>
  );
};
