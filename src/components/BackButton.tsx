import Link from "next/link";

interface Props {
  fallbackHref: string;
  label: string;
}

export default function BackButton({ fallbackHref, label }: Props) {
  return (
    <Link href={fallbackHref} className="text-sm text-muted-foreground hover:underline">
      {label}
    </Link>
  );
}
