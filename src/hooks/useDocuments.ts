import { useEffect, useState } from 'react';
import {
  PRIVACY_POLICY_CONTENT,
  PRIVACY_POLICY_VERSION,
  RESPONSIBILITY_CONTENT,
  RESPONSIBILITY_VERSION,
} from '../lib/documents';
import { isSupabaseConfigured, supabase } from '../lib/supabase';

interface DocumentStatus {
  privacyPolicy: { signed: boolean; version: string };
  responsibility: { signed: boolean; version: string };
}

const STORAGE_KEY = 'autolupa_signatures';

function getStoredSignatures(userId: string): Set<string> {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return new Set();
    const parsed = JSON.parse(raw) as Record<string, string[]>;
    return new Set(parsed[userId] ?? []);
  } catch {
    return new Set();
  }
}

function persistSignature(userId: string, signature: string) {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    const parsed: Record<string, string[]> = raw ? JSON.parse(raw) : {};
    if (!parsed[userId]) parsed[userId] = [];
    if (!parsed[userId].includes(signature)) parsed[userId].push(signature);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(parsed));
  } catch {
    return;
  }
}

function statusFromSignatures(signatures: Set<string>): DocumentStatus {
  return {
    privacyPolicy: { signed: signatures.has(`privacy_policy_v${PRIVACY_POLICY_VERSION}`), version: PRIVACY_POLICY_VERSION },
    responsibility: { signed: signatures.has(`responsibility_declaration_v${RESPONSIBILITY_VERSION}`), version: RESPONSIBILITY_VERSION },
  };
}

export function useDocuments(userId: string | null) {
  const [status, setStatus] = useState<DocumentStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState<'privacy' | 'responsibility' | null>(null);

  useEffect(() => {
    let cancelled = false;
    if (!userId) {
      setShowModal(null);
      setLoading(false);
      return;
    }

    const applyStatus = (nextStatus: DocumentStatus) => {
      if (cancelled) return;
      setStatus(nextStatus);
      setLoading(false);
      if (!nextStatus.privacyPolicy.signed) setShowModal('privacy');
      else if (!nextStatus.responsibility.signed) setShowModal('responsibility');
      else setShowModal(null);
    };

    const load = async () => {
      if (isSupabaseConfigured && supabase) {
        const { data, error } = await supabase
          .from('document_signatures')
          .select('document_type,document_version')
          .eq('user_id', userId);
        if (!error && data) {
          const signatures = new Set((data as Array<{ document_type: string; document_version: string }>).map((row) => `${row.document_type}_v${row.document_version}`));
          applyStatus(statusFromSignatures(signatures));
          return;
        }
      }
      applyStatus(statusFromSignatures(getStoredSignatures(userId)));
    };

    setLoading(true);
    load().catch(() => {
      applyStatus(statusFromSignatures(getStoredSignatures(userId)));
    });

    return () => {
      cancelled = true;
    };
  }, [userId]);

  const sign = async (type: 'privacy' | 'responsibility') => {
    if (!userId || !status) return false;

    const docType = type === 'privacy' ? 'privacy_policy' : 'responsibility_declaration';
    const version = type === 'privacy' ? status.privacyPolicy.version : status.responsibility.version;
    const signature = `${docType}_v${version}`;

    persistSignature(userId, signature);
    if (isSupabaseConfigured && supabase) {
      const { error } = await supabase.from('document_signatures').insert({
        user_id: userId,
        document_type: docType,
        document_version: version,
      });
      if (error && error.code !== '23505') return false;
    }

    const signatures = getStoredSignatures(userId);
    const newStatus = statusFromSignatures(signatures);
    setStatus(newStatus);

    if (type === 'privacy' && !newStatus.responsibility.signed) setShowModal('responsibility');
    else setShowModal(null);

    return true;
  };

  const decline = () => setShowModal(null);

  const needsSignature = status
    ? !status.privacyPolicy.signed || !status.responsibility.signed
    : false;

  return {
    status,
    loading,
    showModal,
    sign,
    decline,
    needsSignature,
    privacyContent: PRIVACY_POLICY_CONTENT,
    responsibilityContent: RESPONSIBILITY_CONTENT,
  };
}
