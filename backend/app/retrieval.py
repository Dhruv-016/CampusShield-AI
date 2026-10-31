"""Handbook chunking + local BM25 lexical retrieval (no external dependencies).

This is LEXICAL retrieval, not semantic vector search. The interface
(`Retriever.search`) is small so an embedding backend can replace it later.
"""
import math
import re
from collections import Counter

STOP = set("""a an the and or of to in on at for is are was were be been i me my we you your it its this that these
those can could should would will do does did have has had what when where which who how why about from with as by
if then than so not no yes please tell say says handbook policy policies student students campus pilot""".split())


def stem(w: str) -> str:
    if len(w) > 5 and w.endswith("ies"):
        return w[:-3] + "y"
    if len(w) > 5 and w.endswith("ing"):
        return w[:-3]
    if len(w) > 4 and w.endswith("ed"):
        return w[:-2]
    if len(w) > 3 and w.endswith("s") and not w.endswith("ss"):
        return w[:-1]
    return w


def tokenize(text: str) -> list[str]:
    return [stem(w) for w in re.findall(r"[a-z0-9]+", text.lower()) if w not in STOP and len(w) > 1]


def chunk_markdown(text: str, document_id: str, document_title: str, max_chars: int = 900) -> list[dict]:
    """Split on '## ' headings; keep heading with its text; split long sections by sentence with 1-sentence overlap."""
    sections: list[tuple[str, str]] = []
    cur_title, cur_lines = None, []
    for line in text.splitlines():
        if line.startswith("## "):
            if cur_title:
                sections.append((cur_title, "\n".join(cur_lines).strip()))
            cur_title, cur_lines = line[3:].strip(), []
        elif cur_title is not None:
            cur_lines.append(line)
    if cur_title:
        sections.append((cur_title, "\n".join(cur_lines).strip()))

    chunks: list[dict] = []
    for title_raw, body in sections:
        m = re.match(r"(\d+)\.\s*(.*)", title_raw)
        number, title = (m.group(1), m.group(2)) if m else ("", title_raw)
        location = f"Section {number}" if number else title
        pieces = [body]
        if len(body) > max_chars:
            sents = re.split(r"(?<=[.!?])\s+", body)
            pieces, buf = [], []
            for s in sents:
                if buf and len(" ".join(buf + [s])) > max_chars:
                    pieces.append(" ".join(buf))
                    buf = [buf[-1], s]
                else:
                    buf.append(s)
            if buf:
                pieces.append(" ".join(buf))
        for i, piece in enumerate(pieces):
            chunks.append({
                "chunk_id": f"{document_id}-s{number or 'x'}-{i}",
                "document_id": document_id,
                "document_title": document_title,
                "section_title": title,
                "content": f"{title}\n{piece}",
                "source_location": location,
                "chunk_index": len(chunks),
            })
    return chunks


class Retriever:
    mode = "lexical-bm25"

    def __init__(self, chunks: list[dict], k1: float = 1.5, b: float = 0.75):
        self.chunks = chunks
        self.k1, self.b = k1, b
        # Section title is repeated to boost heading matches.
        self.docs = [tokenize((c["section_title"] + " ") * 2 + c["content"]) for c in chunks]
        self.N = len(self.docs)
        self.avgdl = (sum(len(d) for d in self.docs) / self.N) if self.N else 0
        df: Counter = Counter()
        for d in self.docs:
            df.update(set(d))
        self.idf = {t: math.log(1 + (self.N - n + 0.5) / (n + 0.5)) for t, n in df.items()}

    def search(self, query: str, limit: int = 3, min_score: float = 1.0) -> list[dict]:
        q = list(dict.fromkeys(tokenize(query)))
        if not q or not self.N:
            return []
        results = []
        for chunk, doc in zip(self.chunks, self.docs):
            tf = Counter(doc)
            score, matched = 0.0, []
            for t in q:
                if t in tf:
                    f = tf[t]
                    score += self.idf[t] * f * (self.k1 + 1) / (f + self.k1 * (1 - self.b + self.b * len(doc) / self.avgdl))
                    matched.append(t)
            if matched and score >= min_score:
                results.append({**chunk, "score": round(score, 3), "matched_terms": matched, "retrieval_mode": self.mode})
        results.sort(key=lambda r: r["score"], reverse=True)
        return results[:limit]
