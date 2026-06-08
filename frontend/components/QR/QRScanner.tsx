'use client';

import { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { XMarkIcon } from '@heroicons/react/24/outline';

interface QRScannerProps {
  onScan: (data: string) => void;
  onClose: () => void;
}

export default function QRScanner({ onScan, onClose }: QRScannerProps) {
  const { t } = useTranslation();
  const videoRef = useRef<HTMLVideoElement>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    let scanner: any = null;

    import('html5-qrcode').then(({ Html5Qrcode }) => {
      const qrRegion = document.getElementById('qr-reader-region');
      if (!qrRegion) return;

      scanner = new Html5Qrcode('qr-reader-region');
      
      scanner.start(
        { facingMode: 'environment' },
        { fps: 10, qrbox: { width: 250, height: 250 } },
        (decodedText: string) => {
          scanner.stop().catch(() => {});
          onScan(decodedText);
        },
        () => {}
      ).catch((err: any) => {
        setError(t('common.cameraDenied'));
      });
    });

    return () => {
      if (scanner) {
        scanner.stop().catch(() => {});
      }
    };
  }, [onScan]);

  return (
    <div className="fixed inset-0 z-50 bg-black bg-opacity-75 flex items-center justify-center">
      <div className="bg-white rounded-xl p-4 max-w-sm w-full mx-4">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold text-gray-800">{t('common.scanQR')}</h3>
          <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded-lg">
            <XMarkIcon className="h-6 w-6 text-gray-600" />
          </button>
        </div>
        
        <div id="qr-reader-region" className="w-full"></div>
        
        {error && (
          <p className="text-red-600 text-sm mt-2 text-center">{error}</p>
        )}
        
        <p className="text-gray-500 text-sm text-center mt-2">
          {t('common.pointCamera')}
        </p>
      </div>
    </div>
  );
}
