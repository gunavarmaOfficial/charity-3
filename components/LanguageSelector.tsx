"use client";

import { useRouter } from "next/navigation";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Globe } from "lucide-react";

const languages = [
  { code: "en", name: "English" },
  { code: "ta", name: "தமிழ்" },
  { code: "hi", name: "हिंदी" },
];

export default function LanguageSelector() {
  const router = useRouter();

  const handleLanguageChange = (locale: string) => {
    router.push(`/${locale}`);
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger className="flex items-center gap-2 text-gray-700 dark:text-gray-200 hover:text-primary ">
        <Globe className="h-5 w-5" />
        <span className="hidden md:inline">Language</span>
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        {languages.map((lang) => (
          <DropdownMenuItem
            key={lang.code}
            onClick={() => handleLanguageChange(lang.code)}
            className="cursor-pointer"
          >
            {lang.name}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
