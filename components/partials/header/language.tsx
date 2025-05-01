"use client";
import React, { useEffect, useState, useTransition } from "react";
import Image from "next/image";
import { useLocale } from "next-intl";
import { Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useThemeStore } from "@/store";
import { setUserLocale } from "@/service/locale.service";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import flag1 from "@/public/images/all-img/flag-1.png";
import flag3 from "@/public/images/all-img/flag-3.png";

const languages = [
  {
    name: "en",
    flag: flag1,
  },
  {
    name: "ar",
    flag: flag3,
  },
];

const Language = () => {
  const locale = useLocale();
  const [isPending, startTransition] = useTransition();
  const { isRtl, setRtl } = useThemeStore();
  const [selectedLanguage, setSelectedLanguage] = useState<any>({});

  useEffect(() => {
    let langObj = filterLanguage(locale);
    if (langObj) {
      setSelectedLanguage(langObj);
    }
  }, [locale]);

  //Function to filter language
  function filterLanguage(selectedLanguage: string) {
    const language = languages.find((language) => {
      return language.name === selectedLanguage;
    });
    return language;
  }

  //Function to handel language change
  const handleLanguageChange = (lang: string) => {
    const language = filterLanguage(lang);
    startTransition(() => {
      if (language) {
        setSelectedLanguage(language);
        setUserLocale(language?.name);
        setRtl(language?.name === "ar");
      }
    });
  };

  return (
    <DropdownMenu>
      {/* <DropdownMenuTrigger asChild>
        <Button type="button" className="bg-transparent hover:bg-transparent">
          <span className="w-6 h-6 rounded-full me-1.5">
            <Image
              src={selectedLanguage?.flag ? selectedLanguage.flag : flag1}
              alt=""
              className="w-full h-full object-cover rounded-full"
            />
          </span>
          <span className="text-sm text-default-600 capitalize">
            {selectedLanguage?.name ? selectedLanguage.name : "En"}
          </span>
        </Button>
      </DropdownMenuTrigger> */}
      {/* <DropdownMenuContent className="p-2">
        {languages.map((item, index) => (
          <DropdownMenuItem
            key={`flag-${index}`}
            className={cn(
              "py-1.5 px-2 cursor-pointer dark:hover:bg-background mb-[2px] last:mb-0",
              {
                "bg-primary-100 ":
                  selectedLanguage && selectedLanguage.name === item.name,
              }
            )}
            onClick={() => handleLanguageChange(item.name)}
          >
            <span className="w-6 h-6 rounded-full me-1.5">
              <Image
                src={item.flag}
                alt=""
                className="w-full h-full object-cover rounded-full"
              />
            </span>
            <span className="text-sm text-default-600 capitalize">
              {item.name}
            </span>
            {selectedLanguage && selectedLanguage.name === item.name && (
              <Check className="w-4 h-4 flex-none ltr:ml-auto rtl:mr-auto text-default-700" />
            )}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent> */}
    </DropdownMenu>
  );
};

export default Language;
