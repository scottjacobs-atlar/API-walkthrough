'use client';

import { useCallback } from 'react';
import { useCredentials } from '@/lib/credentials';
import { RunableCode } from './RunableCode';
import { type CodeTab } from './CodeBlock';

type Props = {
  tabs: CodeTab[];
};

export function CounterpartyForm({ tabs }: Props) {
  const { saveGuideId } = useCredentials();

  const handleResult = useCallback(
    (r: { status: number; body: unknown }) => {
      if (r.status >= 200 && r.status < 300 && r.body && typeof r.body === 'object') {
        const body = r.body as Record<string, unknown>;
        const accounts = body.accounts as { id: string }[] | undefined;
        if (accounts?.[0]?.id) {
          saveGuideId('externalAccountId', accounts[0].id);
          const name = (body.legalName as string) ?? (body.alias as string) ?? 'Counterparty';
          saveGuideId('externalAccountLabel', `${name} — external account`);
        }
      }
    },
    [saveGuideId],
  );

  return (
    <RunableCode
      tabs={tabs}
      authMode="bearer"
      apiCall={{
        method: 'POST',
        path: '/payments/v2/counterparties',
        body: {
          legalName: '{{legalName}}',
          alias: '{{alias}}',
          partyType: '{{partyType}}',
          email: '{{email}}',
          address: {
            country: '{{market}}',
            city: '{{city}}',
            postalCode: '{{postalCode}}',
            streetName: '{{streetName}}',
            streetNumber: '{{streetNumber}}',
          },
          nationalIdentifier: {
            type: 'CIVIC',
            market: '{{market}}',
            number: '{{nationalId}}',
          },
          metadata: { segment: 'trial' },
          accounts: [
            {
              market: '{{market}}',
              identifiers: [
                {
                  type: 'IBAN',
                  market: '{{market}}',
                  number: '{{iban}}',
                },
              ],
            },
          ],
        },
      }}
      parameters={[
        { key: 'legalName', label: 'Legal Name', defaultValue: 'Example Company GmbH' },
        { key: 'alias', label: 'Alias', defaultValue: 'Customer #1234', half: true },
        { key: 'partyType', label: 'Party Type', defaultValue: 'INDIVIDUAL', type: 'select', options: [{ value: 'INDIVIDUAL', label: 'INDIVIDUAL' }, { value: 'ORGANIZATION', label: 'ORGANIZATION' }], half: true },
        { key: 'iban', label: 'IBAN', defaultValue: 'DE64500105173198833324' },
        { key: 'market', label: 'Market', defaultValue: 'DE', type: 'select', options: [{ value: 'DE', label: 'DE' }, { value: 'SE', label: 'SE' }, { value: 'DK', label: 'DK' }, { value: 'GB', label: 'GB' }], half: true },
        { key: 'email', label: 'Email', defaultValue: 'john.smith@example.com', half: true },
        { key: 'city', label: 'City', defaultValue: 'Berlin', half: true },
        { key: 'postalCode', label: 'Postal Code', defaultValue: '10115', half: true },
        { key: 'streetName', label: 'Street', defaultValue: 'Example Strasse', half: true },
        { key: 'streetNumber', label: 'Number', defaultValue: '47', half: true },
        { key: 'nationalId', label: 'National ID', defaultValue: '2012121212', required: false, half: true },
      ]}
      onResult={handleResult}
      successMessage="Counterparty created."
      successLink={{
        urlTemplate: 'https://app.atlar.com/counterparties/{{response.id}}/details',
        label: 'View in Dashboard',
      }}
    />
  );
}
