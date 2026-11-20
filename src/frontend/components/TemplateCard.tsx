import React from "react";
import Button from "@frontend/components/ui/Button";
import Badge from "@frontend/components/ui/Badge";
import Card from "@frontend/components/ui/Card";
import type { Template } from "@shared/types";

export type TemplateCardVariant = "default" | "featured" | "compact" | "horizontal";

export interface TemplateCardProps {
  template: Template;
  variant?: TemplateCardVariant;
  onUse?: (t: Template) => void;
  onCopy?: (t: Template) => void;
  onEdit?: (t: Template) => void;
  onPublish?: (t: Template) => void;
  onDelete?: (t: Template) => void;
  onPreview?: (t: Template) => void;
  selected?: boolean;
  loading?: boolean;
}

const nodeIcons: Record<string, string> = {
  trigger: "/OGMOP/icons/trigger.svg",
  logic: "/OGMOP/icons/logic.svg",
  scanner: "/OGMOP/icons/scanner.svg",
  notify: "/OGMOP/icons/notify.svg",
  ai: "/OGMOP/icons/ai.svg",
};

const TemplateCard: React.FC<TemplateCardProps> = ({
  template,
  variant = "default",
  onUse,
  onCopy,
  onEdit,
  onPublish,
  onDelete,
  onPreview,
  selected,
  loading,
}) => {
  const t = template;
  const tags = t.tags || [];
  const rawNodes = (t.workflow?.nodes || []) as any[];
  const nodeTypeSet = new Set<string>();
  rawNodes.forEach((n: any) => {
    const kind = (n?.data?.kind || n?.type || "").toString().split(".")[0];
    if (kind) nodeTypeSet.add(kind);
  });
  const nodeTypes = Array.from(nodeTypeSet).slice(0, 5);

  if (loading) {
    return (
      <Card padding="md" className="animate-pulse">
        <div className="h-24 bg-surface rounded-md mb-3" />
        <div className="h-4 bg-surface rounded w-3/5 mb-2" />
        <div className="h-3 bg-surface rounded w-4/5 mb-2" />
        <div className="h-3 bg-surface rounded w-2/5" />
      </Card>
    );
  }

  const previewHeight = variant === "featured" ? 180 : variant === "compact" ? 80 : 120;

  const body = (
    <>
      <div className="flex items-start justify-between gap-2">
        <h3 className="text-base font-semibold text-text truncate" id={"tpl-" + t.id}>{t.name}</h3>
        {t.isPublic && <Badge variant="info">Публичный</Badge>}
      </div>
      {variant !== "compact" && t.description && (
        <p className={"text-sm text-text-muted " + (variant === "featured" ? "line-clamp-4" : "line-clamp-2")}>{t.description}</p>
      )}
      <div className="flex flex-wrap gap-1">
        {tags.slice(0, variant === "featured" ? 5 : 3).map((tag) => (
          <Badge key={tag} variant="default">{tag}</Badge>
        ))}
      </div>
      <p className="text-xs text-text-subtle">
        {t.author ? "Автор: " + t.author + " · " : ""}
        {t.createdAt ? new Date(t.createdAt).toLocaleDateString() : ""}
        {typeof t.usageCount === "number" ? " · Использований: " + t.usageCount : ""}
      </p>
    </>
  );

  const actions = (
    <div className="flex flex-wrap gap-2 mt-2">
      <Button size="sm" onClick={() => onUse && onUse(t)}>Использовать</Button>
      <Button size="sm" variant="secondary" onClick={() => onCopy && onCopy(t)}>Копировать</Button>
      {variant !== "compact" && (
        <>
          <Button size="sm" variant="ghost" onClick={() => onPreview && onPreview(t)}>Подробнее</Button>
          <Button size="sm" variant="ghost" onClick={() => onEdit && onEdit(t)}>Редактировать</Button>
        </>
      )}
      <Button size="sm" variant="ghost" onClick={() => onPublish && onPublish(t)}>
        {t.isPublic ? "Снять с публикации" : "Опубликовать"}
      </Button>
      <Button size="sm" variant="danger" onClick={() => onDelete && onDelete(t)}>Удалить</Button>
    </div>
  );

  const preview = (
    <div className="bg-surface rounded-t-lg flex items-center justify-center overflow-hidden relative group" style={{ height: previewHeight }}>
      {nodeTypes.length > 0 ? (
        <div className="flex items-center gap-2">
          {nodeTypes.map((nt) => (
            <img key={nt} src={nodeIcons[nt] || "/OGMOP/icons/logic.svg"} alt="" className="w-5 h-5 opacity-70" />
          ))}
          {rawNodes.length > nodeTypes.length && (
            <span className="text-xs text-text-subtle">+{rawNodes.length - nodeTypes.length}</span>
          )}
        </div>
      ) : (
        <div className="flex flex-col items-center gap-1 text-text-subtle">
          <img src="/OGMOP/icons/logic.svg" alt="" className="w-8 h-8 opacity-40" />
          <span className="text-xs">Нет превью</span>
        </div>
      )}
      <button type="button" onClick={() => onPreview && onPreview(t)} className="absolute inset-0 flex items-center justify-center bg-black/0 group-hover:bg-black/10 transition-colors" aria-label="Предпросмотр">
        <span className="opacity-0 group-hover:opacity-100 text-xs bg-white px-2 py-1 rounded shadow">Предпросмотр</span>
      </button>
    </div>
  );

  if (variant === "horizontal") {
    return (
      <Card hoverable padding="md" className={selected ? "ring-2 ring-primary" : ""}>
        <div className="flex gap-3">
          <div className="w-32 h-24 bg-surface rounded-lg flex-shrink-0 flex items-center justify-center overflow-hidden">
            {nodeTypes.length > 0 ? nodeTypes.map((nt) => (
              <img key={nt} src={nodeIcons[nt] || "/OGMOP/icons/logic.svg"} alt="" className="w-4 h-4 opacity-70 mx-0.5" />
            )) : <img src="/OGMOP/icons/logic.svg" alt="" className="w-6 h-6 opacity-40" />}
          </div>
          <div className="flex flex-col gap-1 flex-1 min-w-0">
            {body}
            {actions}
          </div>
        </div>
      </Card>
    );
  }

  if (variant === "compact") {
    return (
      <Card hoverable padding="sm" className={selected ? "ring-2 ring-primary" : ""}>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1">
            {nodeTypes.map((nt) => (
              <img key={nt} src={nodeIcons[nt] || "/OGMOP/icons/logic.svg"} alt="" className="w-4 h-4 opacity-70" />
            ))}
            {nodeTypes.length === 0 && <img src="/OGMOP/icons/logic.svg" alt="" className="w-4 h-4 opacity-40" />}
          </div>
          <h3 className="text-sm font-semibold text-text truncate flex-1">{t.name}</h3>
          <Button size="sm" variant="primary" onClick={() => onUse && onUse(t)}>Использовать</Button>
        </div>
        <p className="text-xs text-text-subtle mt-1">Использований: {t.usageCount ?? 0}</p>
      </Card>
    );
  }

  return (
    <Card hoverable padding="md" className={selected ? "ring-2 ring-primary" : ""}>
      {variant === "featured" && (
        <div className="absolute -top-2 -right-2 z-10"><Badge variant="success">Рекомендуемый</Badge></div>
      )}
      {preview}
      <div className="flex flex-col gap-2 mt-3">{body}</div>
      {actions}
    </Card>
  );
};

export { TemplateCard };
export default TemplateCard;