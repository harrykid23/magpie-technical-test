import Link from "next/link";
import { usePathname } from "next/navigation";
import React from "react";

interface NavLinkProps {
  href: string;
  className: string;
  children: React.ReactNode;
}

export const checkMenuActive = (href: string, pathname: string) => {
  return (
    (href !== "/dashboard" && pathname?.startsWith(href)) ||
    (href === "/dashboard" && pathname === href)
  );
};

const CustomNavLink: React.FC<NavLinkProps> = ({
  href,
  children,
  className,
}) => {
  const pathname = usePathname();
  const isActive = checkMenuActive(href, pathname);

  return (
    <Link
      href={href}
      passHref
      className={`${className} ${isActive ? "bg-blue-50" : ""}`}
    >
      {children}
    </Link>
  );
};

export default CustomNavLink;
