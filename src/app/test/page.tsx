import { WhatsAppTest } from '@/components/whatsapp-test';

export default function TestPage() {
  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-md mx-auto">
        <h1 className="text-2xl font-bold text-center mb-8">Teste WhatsApp API</h1>
        <WhatsAppTest />
      </div>
    </div>
  );
}