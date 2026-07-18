import type { Metadata } from "next";

import { AccountNav } from "@/components/account/account-nav";

export const metadata: Metadata = {
  robots: {
    index: false,
    follow: false,
  },
};

export default function AccountLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <>
      <AccountNav />
      {children}
    </>
  );
}
