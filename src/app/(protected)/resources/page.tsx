"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { ChevronRight, ExternalLink, Loader2, MapPinned } from "lucide-react";
import { useTranslation } from "react-i18next";

import { PageHeader, PageShell } from "@/components/ui/layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";
import { cn } from "@/lib/utils";
import {
  DEFAULT_RESOURCE_STATE,
  getStoredResourceState,
  setStoredResourceState,
  useResourceCatalog,
} from "@/hooks/useResourceCatalog";
import {
  buildResourceHref,
  opensInNewTab,
  resolveResourceIcon,
} from "@/lib/resourceCatalog";
import { ResourceItem } from "@/types/resource";

type LinksListProps = {
  commonResources: ResourceItem[];
  stateResources: ResourceItem[];
  selectedState: string;
  emptyLabel: string;
  commonSectionLabel: string;
  stateSectionLabel: string;
};

const ResourceLinkRow = ({
  item,
  stateCode,
}: {
  item: ResourceItem;
  stateCode: string;
}) => {
  const href = buildResourceHref(item, stateCode);
  const Icon = resolveResourceIcon(item);
  const openInNewTab = opensInNewTab(item);

  if (openInNewTab) {
    return (
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center justify-between gap-3 rounded-lg border border-border/60 bg-card/50 px-3 py-2 text-sm transition-colors hover:bg-muted/70"
      >
        <div className="flex min-w-0 items-center gap-2">
          <Icon className="size-4 shrink-0 text-muted-foreground" />
          <span className="truncate">{item.label}</span>
        </div>
        <ExternalLink className="size-4 shrink-0 text-muted-foreground" />
      </a>
    );
  }

  return (
    <Link
      href={href}
      className="flex items-center justify-between gap-3 rounded-lg border border-border/60 bg-card/50 px-3 py-2 text-sm transition-colors hover:bg-muted/70"
    >
      <div className="flex min-w-0 items-center gap-2">
        <Icon className="size-4 shrink-0 text-muted-foreground" />
        <span className="truncate">{item.label}</span>
      </div>
      {item.targetType === "external" && (
        <ExternalLink className="size-4 shrink-0 text-muted-foreground" />
      )}
    </Link>
  );
};

const LinksList = ({
  commonResources,
  stateResources,
  selectedState,
  emptyLabel,
  commonSectionLabel,
  stateSectionLabel,
}: LinksListProps) => {
  const hasLinks = commonResources.length > 0 || stateResources.length > 0;

  if (!hasLinks) {
    return (
      <div className="flex min-h-40 items-center justify-center rounded-xl border border-dashed border-border/70 bg-muted/20 px-4 py-8 text-center text-sm text-muted-foreground">
        <span className="max-w-sm">{emptyLabel}</span>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {commonResources.length > 0 && (
        <section className="space-y-2">
          <h3 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            {commonSectionLabel}
          </h3>
          <div className="space-y-2">
            {commonResources.map((item) => (
              <ResourceLinkRow key={item._id} item={item} stateCode={selectedState} />
            ))}
          </div>
        </section>
      )}

      {stateResources.length > 0 && (
        <section className="space-y-2">
          <h3 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            {stateSectionLabel || `${selectedState} Resources`}
          </h3>
          <div className="space-y-2">
            {stateResources.map((item) => (
              <ResourceLinkRow key={item._id} item={item} stateCode={selectedState} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
};

const ResourcesContent = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { t } = useTranslation();

  const [selectedState, setSelectedState] = React.useState<string>(
    DEFAULT_RESOURCE_STATE
  );
  const [isMobileView, setIsMobileView] = React.useState(false);
  const [drawerOpen, setDrawerOpen] = React.useState(false);

  const { catalog } = useResourceCatalog(selectedState);

  const requestedStateCode =
    searchParams.get("state")?.toUpperCase().trim() || undefined;

  React.useEffect(() => {
    const media = window.matchMedia("(max-width: 1023px)");
    const onChange = (event: MediaQueryListEvent) => setIsMobileView(event.matches);
    setIsMobileView(media.matches);
    media.addEventListener("change", onChange);
    return () => media.removeEventListener("change", onChange);
  }, []);

  const syncStateInUrl = React.useCallback(
    (stateCode: string) => {
      const params = new URLSearchParams(searchParams.toString());
      if (params.get("state") === stateCode) return;
      params.set("state", stateCode);
      router.replace(`/resources?${params.toString()}`, { scroll: false });
    },
    [router, searchParams]
  );

  React.useEffect(() => {
    const allowed = new Set(catalog.states.map((state) => state.code));
    if (!allowed.size) return;

    const storedState = getStoredResourceState();
    const candidates = [
      requestedStateCode,
      storedState,
      catalog.selectedState,
      catalog.states[0]?.code,
    ].filter((code): code is string => typeof code === "string" && code.length > 0);
    const nextState =
      candidates.find((code) => allowed.has(code)) || DEFAULT_RESOURCE_STATE;

    setSelectedState((prev) => (prev === nextState ? prev : nextState));

    if (storedState !== nextState) {
      setStoredResourceState(nextState);
    }

    if (requestedStateCode !== nextState) {
      syncStateInUrl(nextState);
    }
  }, [
    catalog.selectedState,
    catalog.states,
    requestedStateCode,
    syncStateInUrl,
  ]);

  const commonResources = React.useMemo(
    () => catalog.commonResources.filter((item) => item.key !== "news"),
    [catalog.commonResources]
  );
  const stateResources = React.useMemo(
    () => catalog.stateResources.filter((item) => item.key !== "news"),
    [catalog.stateResources]
  );

  const selectedStateMeta = React.useMemo(
    () => catalog.states.find((state) => state.code === selectedState),
    [catalog.states, selectedState]
  );

  const onSelectState = (stateCode: string) => {
    setSelectedState(stateCode);
    setStoredResourceState(stateCode);
    syncStateInUrl(stateCode);

    if (isMobileView) {
      setDrawerOpen(true);
    }
  };

  const stateSectionLabel = t(
    "resources_links_for_state",
    {
      state: selectedStateMeta?.name || selectedState,
      defaultValue: "{{state}} Resources",
    }
  );

  return (
    <PageShell className="max-w-6xl pb-24 md:pb-3">
      <PageHeader
        title={t("nav_resources")}
        description={t(
          "resources_page_description",
          "Pick a state to quickly access relevant government and market resources."
        )}
      />

      <div className="grid gap-4 lg:grid-cols-[320px_minmax(0,1fr)]">
        <Card className="h-fit">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg">{t("resources_select_state", "Select State")}</CardTitle>
            <p className="text-sm text-muted-foreground">
              {t("resources_state_cards_hint", "Tap a card to open links for that state.")}
            </p>
          </CardHeader>
          <CardContent className="space-y-2.5">
            {catalog.states.length === 0 && (
              <p className="text-sm text-muted-foreground">
                {t("resources_no_states", "No states available right now.")}
              </p>
            )}
            {catalog.states.map((state) => {
              const isSelected = state.code === selectedState;
              return (
                <button
                  key={state._id}
                  type="button"
                  onClick={() => onSelectState(state.code)}
                  className={cn(
                    "group flex w-full items-center justify-between rounded-lg border px-3 py-2 text-left transition-all duration-200",
                    isSelected
                      ? "border-primary bg-primary/10 text-foreground shadow-sm ring-1 ring-primary/30"
                      : "border-border bg-card hover:bg-muted/60 hover:translate-x-0.5"
                  )}
                >
                  <div className="min-w-0">
                    <p className="truncate font-medium">{state.name}</p>
                    <p className="text-xs text-muted-foreground">{state.code}</p>
                  </div>
                  <ChevronRight
                    className={cn(
                      "size-4 shrink-0 text-muted-foreground transition-transform",
                      isSelected ? "translate-x-0.5 text-primary" : "group-hover:translate-x-0.5"
                    )}
                  />
                </button>
              );
            })}
          </CardContent>
        </Card>

        <Card className="hidden lg:flex lg:flex-col">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-lg">
              <MapPinned className="size-5 text-muted-foreground" />
              <span>{selectedStateMeta?.name || selectedState}</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="min-h-[420px] pb-5">
            <LinksList
              commonResources={commonResources}
              stateResources={stateResources}
              selectedState={selectedState}
              emptyLabel={t(
                "resources_empty_state",
                "No links for selected state"
              )}
              commonSectionLabel={t(
                "resources_common_links",
                "Common Resources"
              )}
              stateSectionLabel={stateSectionLabel}
            />
          </CardContent>
        </Card>
      </div>

      <Drawer open={drawerOpen} onOpenChange={setDrawerOpen}>
        <DrawerContent className="h-[82vh]">
          <DrawerHeader className="text-left">
            <DrawerTitle>{selectedStateMeta?.name || selectedState}</DrawerTitle>
            <DrawerDescription>
              {t(
                "resources_mobile_hint_state",
                {
                  state: selectedStateMeta?.name || selectedState,
                  defaultValue: "Explore all available links for {{state}}.",
                }
              )}
            </DrawerDescription>
          </DrawerHeader>
          <div className="overflow-auto px-4 pb-8">
            <LinksList
              commonResources={commonResources}
              stateResources={stateResources}
              selectedState={selectedState}
              emptyLabel={t(
                "resources_empty_state",
                "No links for selected state"
              )}
              commonSectionLabel={t(
                "resources_common_links",
                "Common Resources"
              )}
              stateSectionLabel={stateSectionLabel}
            />
          </div>
        </DrawerContent>
      </Drawer>
    </PageShell>
  );
};

const ResourcesPage = () => (
  <React.Suspense
    fallback={
      <div className="flex min-h-[50vh] w-full flex-col items-center justify-center gap-3 py-10">
        <Loader2 className="size-8 animate-spin text-primary" />
        <p className="text-sm text-muted-foreground">Loading resources...</p>
      </div>
    }
  >
    <ResourcesContent />
  </React.Suspense>
);

export default ResourcesPage;
