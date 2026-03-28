import Link from "next/link";

interface Props {
  fallbackHref: string;
  label: string;
}

export default function BackButton({ fallbackHref, label }: Props) {
  return (
    <Link href={fallbackHref} className="text-base font-bold text-muted-foreground hover:underline py-4 inline-block">
      {label}
    </Link>
  );
}
