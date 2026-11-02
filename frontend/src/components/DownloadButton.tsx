import { Button, type ButtonProps } from '@heroui/react';
import { Download } from 'lucide-react';
import { useState, type ReactNode } from 'react';
import { downloadFile, errorMessage } from '@/lib/api';
import { toast } from '@/lib/toast';

interface Props extends Omit<ButtonProps, 'onPress' | 'isLoading'> { file: string; children: ReactNode }

/** Files are permission-checked by the API, so they are fetched with the auth header and saved as a blob. */
export default function DownloadButton({ file, children, ...rest }: Props) {
  const [busy, setBusy] = useState(false);
  async function go() {
    setBusy(true);
    try { await downloadFile(file); }
    catch (e) { toast.error('Could not download', errorMessage(e)); }
    finally { setBusy(false); }
  }
  return <Button startContent={<Download size={16} />} {...rest} onPress={go} isLoading={busy}>{children}</Button>;
}
