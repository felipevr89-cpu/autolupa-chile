import ReactMarkdown from 'react-markdown';
import { PRIVACY_POLICY_CONTENT, RESPONSIBILITY_CONTENT, TERMS_AND_CONDITIONS } from '../lib/documents';
import { Breadcrumbs } from '../components/Breadcrumbs';
import { SEO } from '../components/SEO';
import type { LegalDocType } from '../lib/legalDocTypes';

const DOCS: Record<LegalDocType, { title: string; content: string }> = {
  'privacidad': { title: 'Política de Privacidad', content: PRIVACY_POLICY_CONTENT },
  'responsabilidad': { title: 'Declaración de Responsabilidad', content: RESPONSIBILITY_CONTENT },
  'terminos': { title: 'Términos y Condiciones', content: TERMS_AND_CONDITIONS },
};

export function LegalDocs({ docType }: { docType: LegalDocType }) {
  const doc = DOCS[docType];

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8">
      <SEO title={doc.title} description={`${doc.title} de AutoLupa.`} />
      <Breadcrumbs items={[{ label: doc.title }]} />
      <div className="bg-white dark:bg-gray-800 rounded-2xl card-shadow p-6 sm:p-8">
        <div className="prose prose-sm max-w-none dark:prose-invert">
          <ReactMarkdown>{doc.content}</ReactMarkdown>
        </div>
      </div>
    </div>
  );
}

export default LegalDocs;