"use client";

import { PhoneNotch } from "./PhoneNotch";
import { HomeIndicator } from "./HomeIndicator";

type Props = { children: React.ReactNode; badge?: React.ReactNode };

/**
 * 데스크톱에서는 세로형 스마트폰 프레임, 모바일에서는 전체 화면 메신저로 전환한다.
 */
export function PhoneFrame({ children, badge }: Props) {
  return (
    <div className="flex min-h-[100dvh] w-full flex-col items-center justify-center bg-[#E7EBF1] sm:p-8">
      {badge ? <div className="hidden sm:mb-4 sm:block">{badge}</div> : null}
      <div
        className="
          relative flex h-[100dvh] w-full flex-col overflow-hidden bg-white
          sm:h-[760px] sm:w-[390px] sm:rounded-[46px] sm:border-[11px] sm:border-[#111A2C]
          sm:shadow-[0_30px_60px_-20px_rgba(22,35,60,0.45)]
        "
      >
        <PhoneNotch />
        {children}
        <HomeIndicator />
      </div>
      {badge ? <div className="sm:hidden">{badge}</div> : null}
    </div>
  );
}
