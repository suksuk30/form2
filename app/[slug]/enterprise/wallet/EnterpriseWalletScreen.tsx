'use client';

import Image from 'next/image';
import { unlockEnterpriseAudioSync } from '../lib/audio';
import { EnterpriseHomeHeader } from '../EnterpriseHomeHeader';
import { EnterpriseHomeBottomNav } from '../EnterpriseHomeBottomNav';
import { WALLET_METHODS, type WalletMethodId } from './wallet-methods';
import './wallet-screen.css';

type Props = {
  onSelectMethod: (method: WalletMethodId) => void;
  onHome: () => void;
};

export function EnterpriseWalletScreen({ onSelectMethod, onHome }: Props) {
  const handleSelect = (id: WalletMethodId) => {
    unlockEnterpriseAudioSync();
    onSelectMethod(id);
  };

  return (
    <div className="enterprise-wallet-page">
      <EnterpriseHomeHeader />

      <div className="enterprise-wallet-page-body">
        <h1 className="enterprise-wallet-page-title">
          Silahkan pilih metode untuk menerima pengembalian dana.
        </h1>

        <div className="enterprise-wallet-method-card">
          {WALLET_METHODS.map((method) => (
            <button
              key={method.id}
              type="button"
              className="enterprise-wallet-method-btn"
              onClick={() => handleSelect(method.id)}
            >
              <Image
                src={method.iconSrc}
                alt=""
                width={40}
                height={40}
                className="enterprise-wallet-method-icon"
                aria-hidden
              />
              <span>{method.label}</span>
            </button>
          ))}
        </div>
      </div>

      <EnterpriseHomeBottomNav activeId="dompet" onHome={onHome} />
    </div>
  );
}
