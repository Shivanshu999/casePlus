"use client";
import {
  LoginLink,
  LogoutLink,
  RegisterLink,
} from "@kinde-oss/kinde-auth-nextjs/components";
import Link from "next/link";
import React, { useEffect, useState } from "react";

interface NavbarClientProps {
  user?: Record<string, unknown> | null;
}

const NavbarClient = ({ user }: NavbarClientProps) => {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    // Return a neutral state that works for both authenticated and unauthenticated
    return (
      <div className="flex justify-between items-center p-4 shadow-md">
        <div>
          <Link href="/" className="text-lg font-semibold">
            CasePLUS
          </Link>
        </div>
        <div className="flex space-x-15">
          <Link href="/configure/upload">Create Cover</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="flex justify-between items-center p-4 shadow-md">
      <div>
        <Link href="/" className="text-lg font-semibold">
          CasePLUS
        </Link>
      </div>
      {user ? (
        <>
          <div className=" flex space-x-15">
            <Link href="/dashboard">DashBoard</Link>

            <LogoutLink >Logout</LogoutLink>
            <Link href="/configure/upload">Create Cover</Link>
          </div>
        </>
      ) : (
        <>
          <div className=" flex space-x-15">
            <RegisterLink postLoginRedirectURL="/configure/upload">Signup</RegisterLink>
            <LoginLink postLoginRedirectURL="/configure/upload">Login</LoginLink>

            <Link href="/configure/upload">Create Cover</Link>
          </div>
        </>
      )}
    </div>
  );
};

export default NavbarClient;
