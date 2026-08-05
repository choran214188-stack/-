import Image from "next/image";
import { PersonIcon } from "./icons";

type Props = { name: string; profileImage?: string; size?: number };

export function PersonaAvatar({ name, profileImage, size = 34 }: Props) {
  if (profileImage) {
    return (
      <Image
        src={profileImage}
        alt={`${name} 프로필 사진`}
        width={size}
        height={size}
        className="rounded-full object-cover"
      />
    );
  }
  return (
    <span
      className="flex items-center justify-center rounded-full bg-[#E6B800]/80 text-[#4A3B00]"
      style={{ width: size, height: size }}
      aria-hidden="true"
    >
      <PersonIcon className="h-[62%] w-[62%]" />
    </span>
  );
}
