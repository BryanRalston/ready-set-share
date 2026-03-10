'use client';

import { useState, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Card from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import {
  getCategories,
  getTemplatesByCategory,
  extractPlaceholders,
  fillTemplate,
  type CaptionTemplate,
} from '@/lib/caption-templates';
import { IoArrowBackOutline, IoCheckmarkCircle } from 'react-icons/io5';

interface TemplatePickerProps {
  businessType: string;
  onSelectCaption: (caption: string, hashtags: string[]) => void;
  onCancel: () => void;
}

export default function TemplatePicker({ businessType, onSelectCaption, onCancel }: TemplatePickerProps) {
  const categories = useMemo(() => getCategories(), []);
  const [activeCategory, setActiveCategory] = useState(categories[0].key);
  const [selectedTemplate, setSelectedTemplate] = useState<CaptionTemplate | null>(null);
  const [placeholderValues, setPlaceholderValues] = useState<Record<string, string>>({});

  const templates = useMemo(
    () => getTemplatesByCategory(businessType || 'other', activeCategory),
    [businessType, activeCategory]
  );

  const placeholders = useMemo(
    () => (selectedTemplate ? extractPlaceholders(selectedTemplate.template) : []),
    [selectedTemplate]
  );

  const filledCaption = useMemo(
    () => (selectedTemplate ? fillTemplate(selectedTemplate.template, placeholderValues) : ''),
    [selectedTemplate, placeholderValues]
  );

  const handleSelectTemplate = useCallback((template: CaptionTemplate) => {
    setSelectedTemplate(template);
    setPlaceholderValues({});
  }, []);

  const handleBackToTemplates = useCallback(() => {
    setSelectedTemplate(null);
    setPlaceholderValues({});
  }, []);

  const handlePlaceholderChange = useCallback((key: string, value: string) => {
    setPlaceholderValues(prev => ({ ...prev, [key]: value }));
  }, []);

  const handleUseCaption = useCallback(() => {
    if (!selectedTemplate) return;
    const hashtags = selectedTemplate.hashtags.map(h => h.startsWith('#') ? h : `#${h}`);
    onSelectCaption(filledCaption, hashtags);
  }, [selectedTemplate, filledCaption, onSelectCaption]);

  // Highlight placeholders in preview text with sage color
  const renderPreviewText = (text: string, truncate = true) => {
    const maxLen = truncate ? 100 : Infinity;
    const displayText = truncate && text.length > maxLen ? text.slice(0, maxLen) + '...' : text;

    // Split on [placeholder] patterns
    const parts = displayText.split(/(\[[^\]]+\])/g);
    return parts.map((part, i) => {
      if (part.startsWith('[') && part.endsWith(']')) {
        return (
          <span key={i} className="text-sage-500 font-medium">
            {part}
          </span>
        );
      }
      return <span key={i}>{part}</span>;
    });
  };

  // ─── Fill-in Form View ─────────────────────────────────────────────
  if (selectedTemplate) {
    return (
      <motion.div
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: -20 }}
        transition={{ duration: 0.25 }}
        className="space-y-4"
      >
        {/* Header */}
        <div className="flex items-center gap-3">
          <button
            onClick={handleBackToTemplates}
            className="w-8 h-8 rounded-full bg-white border border-cream-200 flex items-center justify-center text-brown-light hover:text-sage-500 transition-colors shrink-0"
          >
            <IoArrowBackOutline size={16} />
          </button>
          <div>
            <h3 className="text-sm font-semibold text-brown">{selectedTemplate.title}</h3>
            <p className="text-xs text-brown-light">Fill in the blanks below</p>
          </div>
        </div>

        {/* Tip */}
        {selectedTemplate.tip && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-gold-50 border border-gold-200 rounded-xl px-3 py-2"
          >
            <p className="text-xs text-brown-light">
              <span className="font-medium text-brown">Tip:</span> {selectedTemplate.tip}
            </p>
          </motion.div>
        )}

        {/* Placeholder Inputs */}
        <Card animate={false} padding="md">
          <div className="space-y-3">
            {placeholders.map((placeholder, index) => (
              <motion.div
                key={placeholder}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.05 * index }}
              >
                <Input
                  label={placeholder.charAt(0).toUpperCase() + placeholder.slice(1)}
                  placeholder={`Enter ${placeholder}...`}
                  value={placeholderValues[placeholder] || ''}
                  onChange={(e) => handlePlaceholderChange(placeholder, e.target.value)}
                />
              </motion.div>
            ))}
          </div>
        </Card>

        {/* Live Preview */}
        <Card animate={false} padding="md">
          <p className="text-xs font-medium text-brown-light mb-2">Preview</p>
          <p className="text-sm text-brown leading-relaxed">
            {renderPreviewText(filledCaption, false)}
          </p>
          {selectedTemplate.hashtags.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mt-3">
              {selectedTemplate.hashtags.map((tag) => (
                <span key={tag} className="text-xs text-sage-500">{tag}</span>
              ))}
            </div>
          )}
        </Card>

        {/* Actions */}
        <div className="space-y-2">
          <Button
            size="md"
            className="w-full"
            onClick={handleUseCaption}
          >
            <IoCheckmarkCircle className="w-5 h-5" />
            Use This Caption
          </Button>
          <button
            onClick={handleBackToTemplates}
            className="w-full text-center text-sm text-brown-light hover:text-sage-500 transition-colors py-2"
          >
            Back to Templates
          </button>
        </div>
      </motion.div>
    );
  }

  // ─── Template Browser View ─────────────────────────────────────────
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -12 }}
      transition={{ duration: 0.25 }}
      className="space-y-4"
    >
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-semibold text-brown">Caption Templates</h3>
          <p className="text-xs text-brown-light">Choose a style, fill in the blanks</p>
        </div>
        <button
          onClick={onCancel}
          className="text-xs text-brown-light hover:text-sage-500 transition-colors"
        >
          Cancel
        </button>
      </div>

      {/* Category Pills — horizontal scrollable */}
      <div className="flex gap-2 overflow-x-auto pb-1 -mx-1 px-1 scrollbar-hide">
        {categories.map((cat) => (
          <Badge
            key={cat.key}
            variant="sage"
            active={activeCategory === cat.key}
            onClick={() => setActiveCategory(cat.key)}
            className="whitespace-nowrap shrink-0"
          >
            {cat.emoji} {cat.label}
          </Badge>
        ))}
      </div>

      {/* Template Cards */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeCategory}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.2 }}
          className="space-y-2"
        >
          {templates.map((template, index) => (
            <motion.div
              key={template.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.04 * index }}
            >
              <motion.button
                whileTap={{ scale: 0.98 }}
                onClick={() => handleSelectTemplate(template)}
                className="w-full text-left"
              >
                <Card animate={false} padding="sm" className="hover:border-sage-300 transition-colors cursor-pointer">
                  <p className="text-sm font-medium text-brown mb-1">{template.title}</p>
                  <p className="text-xs text-brown-light leading-relaxed">
                    {renderPreviewText(template.template)}
                  </p>
                </Card>
              </motion.button>
            </motion.div>
          ))}

          {templates.length === 0 && (
            <div className="text-center py-8">
              <p className="text-sm text-brown-light">No templates in this category yet.</p>
            </div>
          )}
        </motion.div>
      </AnimatePresence>
    </motion.div>
  );
}
