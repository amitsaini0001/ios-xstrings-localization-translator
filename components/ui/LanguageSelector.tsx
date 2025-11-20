'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Search } from 'lucide-react';
import { LanguageOption } from '@/lib/types';

interface LanguageSelectorProps {
  availableLanguages: LanguageOption[];
  onSelect: (languageCode: string) => void;
  onClose: () => void;
}

export function LanguageSelector({
  availableLanguages,
  onSelect,
  onClose,
}: LanguageSelectorProps) {
  const [search, setSearch] = useState('');

  const filteredLanguages = availableLanguages.filter(
    (lang) =>
      lang.name.toLowerCase().includes(search.toLowerCase()) ||
      lang.code.toLowerCase().includes(search.toLowerCase()) ||
      lang.native.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Add Language</DialogTitle>
          <DialogDescription>
            Select a language to add to your XCStrings file
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search languages..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9"
            />
          </div>

          <ScrollArea className="h-[400px] border rounded-lg">
            <div className="p-2 space-y-1">
              {filteredLanguages.map((lang) => (
                <Button
                  key={lang.code}
                  variant="ghost"
                  className="w-full justify-start"
                  onClick={() => onSelect(lang.code)}
                >
                  <div className="flex items-center gap-3">
                    <code className="text-xs bg-muted px-2 py-1 rounded">
                      {lang.code}
                    </code>
                    <div className="text-left">
                      <p className="font-medium">{lang.name}</p>
                      <p className="text-sm text-muted-foreground">{lang.native}</p>
                    </div>
                  </div>
                </Button>
              ))}
              {filteredLanguages.length === 0 && (
                <p className="text-center text-muted-foreground py-8">
                  No languages found
                </p>
              )}
            </div>
          </ScrollArea>
        </div>
      </DialogContent>
    </Dialog>
  );
}

