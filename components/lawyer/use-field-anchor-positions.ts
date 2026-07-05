"use client";

import { useCallback, useLayoutEffect, useState } from "react";

export const FIELD_PILL_HEIGHT = 26;
const LINE_THRESHOLD = 12;

export type FieldLineGroup = {
  top: number;
  fieldIds: string[];
};

function pillTopForMark(markRect: DOMRect, trackRect: DOMRect): number {
  const markCenter = markRect.top + markRect.height / 2;
  return markCenter - trackRect.top - FIELD_PILL_HEIGHT / 2;
}

function buildLineGroups(
  anchors: Array<{ id: string; top: number; left: number }>
): FieldLineGroup[] {
  if (anchors.length === 0) return [];

  const sorted = [...anchors].sort((a, b) => a.top - b.top || a.left - b.left);
  const groups: Array<{ tops: number[]; fields: Array<{ id: string; left: number }> }> = [];

  for (const anchor of sorted) {
    const last = groups[groups.length - 1];
    const lastTop =
      last && last.tops.length > 0
        ? last.tops.reduce((sum, value) => sum + value, 0) / last.tops.length
        : 0;

    if (last && Math.abs(anchor.top - lastTop) <= LINE_THRESHOLD) {
      last.fields.push({ id: anchor.id, left: anchor.left });
      last.tops.push(anchor.top);
    } else {
      groups.push({
        tops: [anchor.top],
        fields: [{ id: anchor.id, left: anchor.left }],
      });
    }
  }

  return groups.map((group) => ({
    top: group.tops.reduce((sum, value) => sum + value, 0) / group.tops.length,
    fieldIds: group.fields.sort((a, b) => a.left - b.left).map((field) => field.id),
  }));
}

export function useFieldAnchorPositions(
  trackRef: React.RefObject<HTMLElement | null>,
  fieldIds: string[],
  deps: unknown[] = []
) {
  const [lineGroups, setLineGroups] = useState<FieldLineGroup[]>([]);
  const [trackHeight, setTrackHeight] = useState(0);

  const measure = useCallback(() => {
    const track = trackRef.current;
    if (!track) return;

    const trackRect = track.getBoundingClientRect();
    const anchors: Array<{ id: string; top: number; left: number }> = [];

    for (const id of fieldIds) {
      const mark = track.querySelector<HTMLElement>(`[data-field-id="${id}"]`);
      if (!mark) continue;
      const markRect = mark.getBoundingClientRect();
      anchors.push({
        id,
        top: pillTopForMark(markRect, trackRect),
        left: markRect.left,
      });
    }

    setLineGroups(buildLineGroups(anchors));
    setTrackHeight(track.offsetHeight);
  }, [fieldIds, trackRef]);

  useLayoutEffect(() => {
    measure();

    const track = trackRef.current;
    if (!track) return;

    const observer = new ResizeObserver(measure);
    observer.observe(track);

    const marks = fieldIds
      .map((id) => track.querySelector(`[data-field-id="${id}"]`))
      .filter(Boolean) as HTMLElement[];
    marks.forEach((mark) => observer.observe(mark));

    window.addEventListener("resize", measure);

    if (document.fonts?.ready) {
      void document.fonts.ready.then(measure);
    }

    return () => {
      observer.disconnect();
      window.removeEventListener("resize", measure);
    };
  }, [measure, trackRef, fieldIds, ...deps]);

  return { lineGroups, trackHeight, remeasure: measure };
}
