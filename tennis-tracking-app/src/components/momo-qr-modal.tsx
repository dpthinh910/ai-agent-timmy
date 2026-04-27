'use client';

import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { QRCodeSVG } from 'qrcode.react';
import { Smartphone, Copy, Check } from 'lucide-react';
import { formatVND } from '@/lib/finance';

interface MomoQRModalProps {
  phoneNumber?: string;
  amount?: number;
  memberName?: string;
}

export function MomoQRModal({
  phoneNumber = '0901234567',
  amount = 20_000,
  memberName,
}: MomoQRModalProps) {
  const [copied, setCopied] = useState(false);

  // Momo QR deep link format
  const momoLink = `https://nhantien.momo.vn/${phoneNumber}/${amount}`;

  const handleCopy = async () => {
    await navigator.clipboard.writeText(momoLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <Dialog>
      <DialogTrigger
        render={
          <Button
            variant="destructive"
            className="gap-2 bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600 shadow-lg shadow-rose-500/25 transition-all duration-200 active:scale-95"
          />
        }
      >
        <Smartphone className="h-4 w-4" />
        Donate {formatVND(amount)} via Momo
      </DialogTrigger>
      <DialogContent className="sm:max-w-[360px]">
        <DialogHeader>
          <DialogTitle className="text-center">
            <span className="bg-gradient-to-r from-pink-500 to-rose-500 bg-clip-text text-transparent">
              Momo Payment
            </span>
          </DialogTitle>
        </DialogHeader>
        <div className="flex flex-col items-center gap-4 py-4">
          {memberName && (
            <p className="text-sm text-muted-foreground">
              Fine for: <span className="font-semibold text-foreground">{memberName}</span>
            </p>
          )}
          <div className="rounded-2xl border-2 border-pink-200 bg-white p-4 shadow-lg dark:border-pink-800">
            <QRCodeSVG
              value={momoLink}
              size={200}
              level="H"
              includeMargin
              fgColor="#ae2070"
            />
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-foreground">{formatVND(amount)}</p>
            <p className="text-sm text-muted-foreground mt-1">Scan with Momo app</p>
          </div>
          <Button
            variant="outline"
            size="sm"
            className="gap-2"
            onClick={handleCopy}
          >
            {copied ? (
              <><Check className="h-3.5 w-3.5 text-emerald-500" /> Copied!</>
            ) : (
              <><Copy className="h-3.5 w-3.5" /> Copy Link</>
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
