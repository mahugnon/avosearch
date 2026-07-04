"use client";

import { useState, useTransition } from "react";
import { useTranslations } from "next-intl";
import { submitMissionReviewAction } from "@/lib/actions/account";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

type Props = {
  missionId: string;
};

export function MissionReviewForm({ missionId }: Props) {
  const t = useTranslations("missions.review");
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [done, setDone] = useState(false);
  const [pending, startTransition] = useTransition();

  function handleSubmit() {
    startTransition(async () => {
      const result = await submitMissionReviewAction({ missionId, rating, comment });
      if (result.ok) setDone(true);
    });
  }

  if (done) {
    return <p className="text-sm text-muted-foreground">{t("thanks")}</p>;
  }

  return (
    <div className="space-y-4 rounded-xl border p-4">
      <h3 className="font-semibold">{t("title")}</h3>
      <div className="space-y-2">
        <Label>{t("rating")}</Label>
        <div className="flex gap-2">
          {[1, 2, 3, 4, 5].map((n) => (
            <Button
              key={n}
              type="button"
              size="sm"
              variant={rating === n ? "default" : "outline"}
              onClick={() => setRating(n)}
            >
              {n}
            </Button>
          ))}
        </div>
      </div>
      <div className="space-y-2">
        <Label htmlFor="review-comment">{t("comment")}</Label>
        <Textarea
          id="review-comment"
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          rows={3}
        />
      </div>
      <Button type="button" disabled={pending} onClick={handleSubmit}>
        {t("submit")}
      </Button>
    </div>
  );
}
