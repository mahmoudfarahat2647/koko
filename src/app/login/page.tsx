"use client";

import Login04 from "@/components/ui/login-2";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function LoginPage() {
  return (
    <div className="flex justify-center items-center min-h-screen bg-background">
      <Login04 />
    </div>
  );
}
