import Image from "next/image";

type BrandMarkProps = {
  compact?: boolean;
};

export function BrandMark({ compact = false }: BrandMarkProps) {
  return (
    <span className="brand-mark" aria-label="Deltech home">
      <span className="brand-symbol" aria-hidden="true">
        <Image
          className="brand-symbol-image"
          src="/deltech-logo.png"
          alt=""
          width={40}
          height={40}
          sizes="40px"
        />
      </span>
      {compact ? null : <span className="brand-word">Deltech</span>}
    </span>
  );
}
