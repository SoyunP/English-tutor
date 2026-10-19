"use client";

import { useMemo, useState, useTransition } from "react";
import { Volume2, Shuffle, Eye, EyeOff, Star } from "lucide-react";
import type { VocabularyItem } from "@/lib/types";
import { toggleDifficultWordAction } from "@/lib/actions/homework";
import { Button } from "./ui/button";

export function VocabularyPanel({
  items,
  difficultIds,
}: {
  items: VocabularyItem[];
  difficultIds: string[];
}) {
  const [flipped, setFlipped] = useState<Record<string, boolean>>({});
  const [hideKo, setHideKo] = useState(false);
  const [order, setOrder] = useState(items.map((i) => i.id));
  const [onlyDifficult, setOnlyDifficult] = useState(false);
  const [difficult, setDifficult] = useState(new Set(difficultIds));
  const [pending, startTransition] = useTransition();

  const ordered = useMemo(
    () =>
      order
        .map((id) => items.find((i) => i.id === id)!)
        .filter(Boolean)
        .filter((i) => (onlyDifficult ? difficult.has(i.id) : true)),
    [order, items, onlyDifficult, difficult]
  );

  function speak(word: string) {
    if (typeof window === "undefined" || !window.speechSynthesis) return;
    const u = new SpeechSynthesisUtterance(word);
    u.lang = "en-US";
    window.speechSynthesis.speak(u);
  }

  function shuffle() {
    setOrder((prev) => [...prev].sort(() => Math.random() - 0.5));
  }

  function toggleDifficult(id: string) {
    startTransition(async () => {
      await toggleDifficultWordAction(id);
      setDifficult((prev) => {
        const next = new Set(prev);
        if (next.has(id)) next.delete(id);
        else next.add(id);
        return next;
      });
    });
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2">
        <Button type="button" variant="outline" size="sm" onClick={shuffle}>
          <Shuffle className="h-4 w-4" /> 섞기
        </Button>
        <Button type="button" variant="outline" size="sm" onClick={() => setHideKo((v) => !v)}>
          {hideKo ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
          {hideKo ? "뜻 보이기" : "뜻 가리기"}
        </Button>
        <Button type="button" variant="outline" size="sm" onClick={() => setOnlyDifficult((v) => !v)}>
          <Star className="h-4 w-4" />
          {onlyDifficult ? "전체 보기" : "어려운 단어만"}
        </Button>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        {ordered.map((item) => {
          const isFlipped = flipped[item.id];
          return (
            <button
              key={item.id}
              type="button"
              className="rounded-2xl border border-border bg-white p-4 text-left transition hover:border-primary focus-ring"
              onClick={() => setFlipped((f) => ({ ...f, [item.id]: !f[item.id] }))}
            >
              <div className="flex items-start justify-between gap-2">
                <div>
                  <div className="text-lg font-semibold">{item.word}</div>
                  <div className="text-xs text-muted-foreground">{item.partOfSpeech}</div>
                </div>
                <div className="flex gap-1">
                  <span
                    role="button"
                    tabIndex={0}
                    className="rounded-lg p-1 hover:bg-muted"
                    onClick={(e) => {
                      e.stopPropagation();
                      speak(item.word);
                    }}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.stopPropagation();
                        speak(item.word);
                      }
                    }}
                  >
                    <Volume2 className="h-4 w-4" />
                  </span>
                  <span
                    role="button"
                    tabIndex={0}
                    className="rounded-lg p-1 hover:bg-muted"
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleDifficult(item.id);
                    }}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.stopPropagation();
                        toggleDifficult(item.id);
                      }
                    }}
                  >
                    <Star
                      className={`h-4 w-4 ${difficult.has(item.id) ? "fill-amber-400 text-amber-500" : ""}`}
                    />
                  </span>
                </div>
              </div>
              <div className="mt-3 text-sm">
                {!isFlipped ? (
                  hideKo ? (
                    <span className="text-muted-foreground">클릭하여 뜻 확인</span>
                  ) : (
                    <span>{item.meaningKo}</span>
                  )
                ) : (
                  <div className="space-y-1">
                    <p>{item.exampleEn}</p>
                    <p className="text-muted-foreground">{item.exampleKo}</p>
                  </div>
                )}
              </div>
            </button>
          );
        })}
      </div>
      {pending && <p className="text-xs text-muted-foreground">저장 중…</p>}
    </div>
  );
}
