import Image from "next/image";
import Avatar from "@/components/Avatar";
import PostComments from "@/components/PostComments";

type PostCardProps = {
  id: string;
  title: string;
  content: string;
  mediaType: string | null;
  mediaUrl: string | null;
  authorName: string;
  authorDisplayName?: string | null;
  authorAvatar?: string | null;
  authorAccent?: string | null;
  createdAt: Date;
  isLoggedIn: boolean;
  currentUserId?: string;
  isAdmin?: boolean;
};

export default function PostCard({
  id,
  title,
  content,
  mediaType,
  mediaUrl,
  authorName,
  authorDisplayName,
  authorAvatar,
  authorAccent,
  createdAt,
  isLoggedIn,
  currentUserId,
  isAdmin,
}: PostCardProps) {
  const date = new Intl.DateTimeFormat("tr-TR", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(createdAt));

  const name = authorDisplayName || authorName;
  const isGif = mediaUrl?.toLowerCase().endsWith(".gif");

  return (
    <article className="overflow-hidden rounded-2xl border border-violet-500/20 bg-slate-900/60 shadow-lg shadow-violet-950/30">
      {mediaUrl && mediaType === "image" && isGif && (
        <div className="aspect-video w-full bg-slate-800">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={mediaUrl} alt={title} className="h-full w-full object-cover" />
        </div>
      )}

      {mediaUrl && mediaType === "image" && !isGif && (
        <div className="relative aspect-video w-full bg-slate-800">
          <Image
            src={mediaUrl}
            alt={title}
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, 600px"
          />
        </div>
      )}

      {mediaUrl && mediaType === "video" && (
        <video
          src={mediaUrl}
          controls
          className="aspect-video w-full bg-black"
        />
      )}

      <div className="space-y-3 p-5">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 text-sm">
            <Avatar
              src={authorAvatar}
              name={name}
              size="sm"
              accentColor={authorAccent}
            />
            <span>
              <span className="font-medium text-white">{name}</span>
              <span className="ml-1 text-slate-400">@{authorName}</span>
            </span>
          </div>
          <time className="text-sm text-slate-400">{date}</time>
        </div>
        <h2 className="text-xl font-bold text-white">{title}</h2>
        <p className="whitespace-pre-wrap text-slate-300 leading-relaxed">
          {content}
        </p>

        <PostComments
          postId={id}
          isLoggedIn={isLoggedIn}
          currentUserId={currentUserId}
          isAdmin={isAdmin}
        />
      </div>
    </article>
  );
}
