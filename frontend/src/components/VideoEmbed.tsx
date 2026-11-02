import { Button } from '@heroui/react';
import { ExternalLink } from 'lucide-react';
import { youtubeEmbed } from '@/lib/format';

export default function VideoEmbed({ url, title }: { url?: string | null; title: string }) {
  if (!url) return null;
  const yt = youtubeEmbed(url);
  if (yt) {
    return (
      <div className="aspect-video w-full overflow-hidden rounded-lg bg-black">
        <iframe src={yt} title={title} className="h-full w-full" allowFullScreen
          allow="accelerometer; encrypted-media; picture-in-picture" referrerPolicy="strict-origin-when-cross-origin" />
      </div>
    );
  }
  if (/\.(mp4|webm|ogg)(\?.*)?$/i.test(url)) {
    return <video src={url} controls className="aspect-video w-full rounded-lg bg-black" />;
  }
  return <Button as="a" href={url} target="_blank" rel="noopener noreferrer" endContent={<ExternalLink size={16} />}>Open video</Button>;
}
