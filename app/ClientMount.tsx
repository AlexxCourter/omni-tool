"use client";

import React from "react";
import ClientApp from "./ClientApp";

export default function ClientMount({ children }: { children: React.ReactNode }) {
  return <ClientApp>{children}</ClientApp>;
}
