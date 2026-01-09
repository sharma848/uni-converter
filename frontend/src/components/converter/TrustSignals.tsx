import { Shield, Lock, Trash2, CheckCircle2 } from 'lucide-react';

export function TrustSignals() {
  const signals = [
    {
      icon: CheckCircle2,
      text: 'No signup required',
    },
    {
      icon: Shield,
      text: 'No watermark',
    },
    {
      icon: Trash2,
      text: 'Files deleted automatically',
    },
    {
      icon: Lock,
      text: 'Secure processing',
    },
  ];

  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 py-6 border-t">
      {signals.map((signal, index) => {
        const Icon = signal.icon;
        return (
          <div key={index} className="flex flex-col items-center text-center space-y-2">
            <div className="p-2 rounded-full bg-primary/10">
              <Icon className="w-5 h-5 text-primary" />
            </div>
            <p className="text-xs text-muted-foreground leading-tight">
              {signal.text}
            </p>
          </div>
        );
      })}
    </div>
  );
}

