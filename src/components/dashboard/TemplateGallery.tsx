import { useState } from 'react';
import {
  Check,
  Eye,
  ArrowRight,
  Layers,
  X,
} from 'lucide-react';
import { Card } from '@/components/dashboard/Card';
import { Badge } from '@/components/dashboard/Badge';
import {
  RESUME_TEMPLATES,
  type ResumeTemplateMeta,
} from '@/lib/resumeTemplatesData';
import { TemplateThumbnail } from './TemplateThumbnail';

interface TemplateGalleryProps {
  selectedTemplateId: string;
  onSelectTemplate: (template: ResumeTemplateMeta) => void;
  onContinueToPreview: (template: ResumeTemplateMeta) => void;
}

export function TemplateGallery({
  selectedTemplateId,
  onSelectTemplate,
  onContinueToPreview,
}: TemplateGalleryProps) {
  const [filterCategory, setFilterCategory] = useState<string>('All');
  const [modalPreviewTemplate, setModalPreviewTemplate] = useState<ResumeTemplateMeta | null>(
    null,
  );

  const categories = ['All', 'Modern', 'Technical', 'Traditional', 'Creative'];

  const filteredTemplates =
    filterCategory === 'All'
      ? RESUME_TEMPLATES
      : RESUME_TEMPLATES.filter((t) => t.category === filterCategory);

  const selectedTemplate =
    RESUME_TEMPLATES.find((t) => t.id === selectedTemplateId) || RESUME_TEMPLATES[0];

  const handleCardClick = (tpl: ResumeTemplateMeta) => {
    onSelectTemplate(tpl);
  };

  const handlePreviewClick = (e: React.MouseEvent, tpl: ResumeTemplateMeta) => {
    e.stopPropagation();
    setModalPreviewTemplate(tpl);
  };

  return (
    <div className="space-y-6 animate-fade-slide">
      {/* Header Banner */}
      <Card hover={false} gradient className="p-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center shrink-0">
              <Layers className="w-5 h-5 text-blue-400" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="text-base font-semibold text-zinc-100">
                  Choose a Professional Resume Template
                </h3>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20 font-medium">
                  10 Styles Available
                </span>
              </div>
              <p className="text-xs text-zinc-400 mt-1">
                Select from 10 distinct, ATS-tested layouts. Your corrected resume content and
                optional profile photo will automatically populate the chosen design.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => onContinueToPreview(selectedTemplate)}
            className="press-scale flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-teal-600 hover:from-blue-500 hover:to-teal-500 text-white text-xs font-semibold shadow-lg shadow-blue-500/20 transition-all shrink-0"
          >
            Preview with my resume <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-2 mt-5 pt-4 border-t border-zinc-800/80 overflow-x-auto pb-1">
          <span className="text-[11px] font-medium text-zinc-500 shrink-0">Style:</span>
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setFilterCategory(cat)}
              className={`text-xs px-3 py-1 rounded-lg font-medium transition-colors shrink-0 ${
                filterCategory === cat
                  ? 'bg-zinc-700 text-white border border-zinc-600'
                  : 'bg-zinc-900/50 text-zinc-400 hover:text-zinc-200 border border-zinc-800'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </Card>

      {/* 10-Template Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-5">
        {filteredTemplates.map((template) => {
          const isSelected = template.id === selectedTemplateId;

          return (
            <div
              key={template.id}
              onClick={() => handleCardClick(template)}
              className={`group cursor-pointer rounded-2xl border transition-all relative flex flex-col justify-between overflow-hidden ${
                isSelected
                  ? 'border-blue-500 ring-2 ring-blue-500/30 bg-zinc-900/90 shadow-xl shadow-blue-500/10'
                  : 'border-zinc-800 bg-zinc-900/40 hover:border-zinc-700 hover:bg-zinc-900/70'
              }`}
            >
              {/* Selected checkmark badge */}
              {isSelected && (
                <div className="absolute top-3 right-3 z-10 w-6 h-6 rounded-full bg-blue-500 text-white flex items-center justify-center shadow-lg shadow-blue-500/30">
                  <Check className="w-3.5 h-3.5 stroke-[3]" />
                </div>
              )}

              {/* Thumbnail Container */}
              <div className="p-4 pb-2 bg-gradient-to-b from-zinc-950/40 to-transparent relative">
                <div className="relative rounded-lg overflow-hidden border border-zinc-800 group-hover:border-zinc-700 transition-colors">
                  <TemplateThumbnail template={template} />

                  {/* Hover Quick-Preview Button */}
                  <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2 p-2">
                    <button
                      type="button"
                      onClick={(e) => handlePreviewClick(e, template)}
                      className="press-scale flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-zinc-900/90 text-white text-xs font-semibold border border-zinc-700 shadow-md hover:bg-zinc-800"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      Enlarge
                    </button>
                  </div>
                </div>
              </div>

              {/* Template Information */}
              <div className="p-4 pt-2 flex-1 flex flex-col justify-between space-y-3">
                <div>
                  <div className="flex items-center justify-between gap-1 mb-1">
                    <h4 className="text-sm font-bold text-zinc-100 truncate">{template.name}</h4>
                    <span
                      className="w-2 h-2 rounded-full shrink-0"
                      style={{ backgroundColor: template.accentColor }}
                      title={`Accent: ${template.accentColor}`}
                    />
                  </div>

                  <p className="text-[11px] text-zinc-400 line-clamp-2 leading-relaxed">
                    {template.descriptor}
                  </p>
                </div>

                <div className="pt-2 border-t border-zinc-800/60 flex items-center justify-between">
                  <span className="text-[10px] px-2 py-0.5 rounded-md bg-zinc-800 text-zinc-400 font-medium">
                    {template.tag}
                  </span>

                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      onSelectTemplate(template);
                      onContinueToPreview(template);
                    }}
                    className={`text-xs font-semibold flex items-center gap-1 transition-colors ${
                      isSelected
                        ? 'text-blue-400 hover:text-blue-300'
                        : 'text-zinc-500 group-hover:text-zinc-300'
                    }`}
                  >
                    Select <ArrowRight className="w-3 h-3" />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Large Enlarge Preview Modal */}
      {modalPreviewTemplate && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="relative w-full max-w-lg rounded-2xl border border-zinc-800 bg-zinc-950 p-6 shadow-2xl space-y-4">
            <button
              onClick={() => setModalPreviewTemplate(null)}
              className="absolute top-4 right-4 p-1.5 rounded-lg text-zinc-500 hover:text-zinc-300 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-2">
              <h3 className="text-base font-bold text-zinc-100">
                {modalPreviewTemplate.name}
              </h3>
              <Badge variant="neutral" size="sm">
                {modalPreviewTemplate.tag}
              </Badge>
            </div>
            <p className="text-xs text-zinc-400">{modalPreviewTemplate.descriptor}</p>

            {/* Visual preview */}
            <div className="w-full max-h-[440px] overflow-hidden rounded-xl border border-zinc-800 bg-zinc-900 p-4">
              <TemplateThumbnail template={modalPreviewTemplate} />
            </div>

            <div className="flex items-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => setModalPreviewTemplate(null)}
                className="flex-1 px-4 py-2.5 rounded-xl border border-zinc-800 text-zinc-300 text-xs font-medium hover:bg-zinc-900 transition-colors"
              >
                Close
              </button>
              <button
                type="button"
                onClick={() => {
                  onSelectTemplate(modalPreviewTemplate);
                  setModalPreviewTemplate(null);
                  onContinueToPreview(modalPreviewTemplate);
                }}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold transition-colors"
              >
                <Check className="w-4 h-4" />
                Use this template
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
