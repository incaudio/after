import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

interface FilterPanelProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  sortBy: "relevance" | "newest" | "popularity" | "publicDomain";
  setSortBy: (value: "relevance" | "newest" | "popularity" | "publicDomain") => void;
  platform: "all" | "jamendo";
  setPlatform: (value: "all" | "jamendo") => void;
}

export function FilterPanel({ open, onOpenChange, sortBy, setSortBy, platform, setPlatform }: FilterPanelProps) {
  if (!open) return null;

  return (
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 transition-opacity"
        onClick={() => onOpenChange(false)}
      />

      {/* Panel */}
      <div className="fixed right-0 top-0 bottom-0 w-80 glass-elevated border-l border-white/20 z-50 animate-in slide-in-from-right duration-300">
        <div className="h-full flex flex-col p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-display font-semibold">Filters</h2>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => onOpenChange(false)}
              data-testid="button-close-filters"
            >
              <X className="w-5 h-5" />
            </Button>
          </div>

          {/* Content */}
          <div className="flex-1 space-y-6 overflow-y-auto custom-scrollbar">
            {/* Sort by */}
            <div className="space-y-3">
              <Label className="text-sm font-medium">Sort By</Label>
              <RadioGroup value={sortBy} onValueChange={(value) => setSortBy(value as any)}>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="relevance" id="relevance" data-testid="radio-relevance" />
                  <Label htmlFor="relevance" className="font-normal cursor-pointer">
                    Most Relevant
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="newest" id="newest" data-testid="radio-newest" />
                  <Label htmlFor="newest" className="font-normal cursor-pointer">
                    Newest First
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="popularity" id="popularity" data-testid="radio-popularity" />
                  <Label htmlFor="popularity" className="font-normal cursor-pointer">
                    Most Popular
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="publicDomain" id="publicDomain" data-testid="radio-public-domain" />
                  <Label htmlFor="publicDomain" className="font-normal cursor-pointer">
                    Public Domain
                  </Label>
                </div>
              </RadioGroup>
            </div>

            {/* Platform */}
            <div className="space-y-3">
              <Label className="text-sm font-medium">Platform</Label>
              <RadioGroup value={platform} onValueChange={(value) => setPlatform(value as any)}>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="all" id="all" data-testid="radio-all-platforms" />
                  <Label htmlFor="all" className="font-normal cursor-pointer">
                    All Platforms
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="jamendo" id="jamendo" data-testid="radio-jamendo" />
                  <Label htmlFor="jamendo" className="font-normal cursor-pointer">
                    Jamendo Only
                  </Label>
                </div>
              </RadioGroup>
            </div>
          </div>

          {/* Footer */}
          <div className="pt-6 border-t border-white/10">
            <Button
              onClick={() => onOpenChange(false)}
              className="w-full bg-gradient-to-r from-violet-500 to-blue-500 hover:from-violet-600 hover:to-blue-600"
              data-testid="button-apply-filters"
            >
              Apply Filters
            </Button>
          </div>
        </div>
      </div>
    </>
  );
}
